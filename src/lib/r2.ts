/**
 * Cloudflare R2 — dosya yükleme / silme (S3 uyumlu API, AWS SigV4).
 *
 * `@aws-sdk/client-s3` yerine imza doğrudan node:crypto ile üretiliyor:
 * tek ihtiyacımız PUT ve DELETE, buna karşılık SDK sunucu paketine
 * onlarca MB ekliyor. İmza mantığı scripts/sigv4-test.mjs içindeki
 * resmi AWS test vektörleriyle doğrulanır.
 *
 * Yalnızca sunucu tarafında kullanılır (runtime = 'nodejs').
 */
import { createHash, createHmac } from 'node:crypto';

const SERVICE = 's3';
const REGION = 'auto';
const ALGORITHM = 'AWS4-HMAC-SHA256';

export class R2Error extends Error {}

function config() {
  return {
    accountId: (process.env.CLOUDFLARE_ACCOUNT_ID ?? '').trim(),
    bucket: (process.env.R2_BUCKET ?? '').trim(),
    accessKeyId: (process.env.R2_ACCESS_KEY_ID ?? '').trim(),
    secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY ?? '').trim()
  };
}

export function isR2Configured(): boolean {
  const c = config();
  return Boolean(c.accountId && c.bucket && c.accessKeyId && c.secretAccessKey);
}

function sha256Hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: string | Buffer, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

/** RFC 3986 — encodeURIComponent'in bıraktığı !'()* karakterlerini de kaçırır. */
function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function canonicalUri(segments: string[]): string {
  return `/${segments.map(encodeRfc3986).join('/')}`;
}

/**
 * AWS Signature Version 4 — imzalanmış istek başlıklarını üretir.
 * Dışa açık olma sebebi scripts/sigv4-test.mjs ile doğrulanabilmesi.
 */
export function signRequest({
  method,
  host,
  uri,
  payloadHash,
  headers,
  accessKeyId,
  secretAccessKey,
  region,
  service,
  date
}: {
  method: string;
  host: string;
  uri: string;
  payloadHash: string;
  headers: Record<string, string>;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  date: Date;
}): Record<string, string> {
  const amzDate = `${date.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15)}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders: Record<string, string> = {
    ...headers,
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate
  };

  const sortedKeys = Object.keys(allHeaders)
    .map((k) => k.toLowerCase())
    .sort();

  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(allHeaders)) {
    lowerHeaders[k.toLowerCase()] = String(v).trim().replace(/\s+/g, ' ');
  }

  const canonicalHeaders = sortedKeys.map((k) => `${k}:${lowerHeaders[k]}\n`).join('');
  const signedHeaders = sortedKeys.join(';');

  const canonicalRequest = [
    method,
    uri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [ALGORITHM, amzDate, scope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  return {
    ...allHeaders,
    Authorization: `${ALGORITHM} Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}

async function r2Fetch(
  method: 'PUT' | 'DELETE',
  key: string,
  body?: Buffer,
  contentType?: string
): Promise<void> {
  const { accountId, bucket, accessKeyId, secretAccessKey } = config();
  if (!isR2Configured()) throw new R2Error('Cloudflare R2 ortam degiskenleri eksik');

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const cleanKey = key.replace(/^\/+/, '');
  const uri = canonicalUri([bucket, ...cleanKey.split('/')]);
  const payload = body ?? Buffer.alloc(0);

  const extra: Record<string, string> = {};
  if (contentType) extra['content-type'] = contentType;

  const headers = signRequest({
    method,
    host,
    uri,
    payloadHash: sha256Hex(payload),
    headers: extra,
    accessKeyId,
    secretAccessKey,
    region: REGION,
    service: SERVICE,
    date: new Date()
  });

  const res = await fetch(`https://${host}${uri}`, {
    method,
    headers,
    // Buffer dogrudan BodyInit degil; ayni bellegi gosteren Uint8Array'e sariyoruz.
    body: method === 'PUT' ? new Uint8Array(payload) : undefined,
    cache: 'no-store'
  });

  // DELETE zaten silinmis nesne icin de 204 doner; 404'u hata sayma.
  if (!res.ok && !(method === 'DELETE' && res.status === 404)) {
    throw new R2Error(`R2 ${method} basarisiz (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
}

export async function r2Put(key: string, body: Buffer, contentType?: string): Promise<string> {
  await r2Fetch('PUT', key, body, contentType);
  return key;
}

export async function r2Delete(key: string): Promise<void> {
  if (!key?.trim()) return;
  await r2Fetch('DELETE', key.trim());
}

/** Yüklenen dosya için çakışmayan, URL güvenli nesne anahtarı. */
export function buildObjectKey(folder: string, fileName: string): string {
  const ext = (fileName.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'bin').toLowerCase();
  const rand = createHash('sha256')
    .update(`${Date.now()}-${Math.random()}-${fileName}`)
    .digest('hex')
    .slice(0, 20);
  return `${folder}/${rand}.${ext}`;
}
