/**
 * Cloudflare D1 erişim katmanı (REST API).
 *
 * Ayrı bir Worker yazılmaz; Next.js sunucu tarafından doğrudan
 * `/accounts/{id}/d1/database/{db}/query` uç noktası kullanılır.
 * Bu yüzden tüm çağrılar yalnızca sunucuda çalışır — tarayıcıdan
 * çağrılırsa token sızardı, `assertServer()` bunu engeller.
 */

export type D1Value = string | number | null;

export interface D1Meta {
  changes?: number;
  last_row_id?: number;
  rows_read?: number;
  rows_written?: number;
}

interface D1ApiResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: Array<{ results: T[]; success: boolean; meta: D1Meta }>;
}

export class D1Error extends Error {}

function config() {
  return {
    accountId: (process.env.CLOUDFLARE_ACCOUNT_ID ?? '').trim(),
    databaseId: (process.env.CLOUDFLARE_D1_DATABASE_ID ?? '').trim(),
    token: (process.env.CLOUDFLARE_API_TOKEN ?? '').trim()
  };
}

/** Ortam değişkenleri tam mı? Eksikse okuma katmanı boş liste döndürür. */
export function isD1Configured(): boolean {
  const { accountId, databaseId, token } = config();
  return Boolean(accountId && databaseId && token);
}

function assertServer() {
  if (typeof window !== 'undefined') {
    throw new D1Error('D1 yalnizca sunucu tarafinda kullanilabilir');
  }
}

async function request<T>(sql: string, params: D1Value[]): Promise<{ rows: T[]; meta: D1Meta }> {
  assertServer();
  const { accountId, databaseId, token } = config();
  if (!accountId || !databaseId || !token) {
    throw new D1Error('Cloudflare D1 ortam degiskenleri eksik');
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params }),
      cache: 'no-store'
    }
  );

  const text = await res.text();
  let payload: D1ApiResponse<T>;
  try {
    payload = JSON.parse(text) as D1ApiResponse<T>;
  } catch {
    throw new D1Error(`D1 gecersiz yanit (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok || !payload.success) {
    const detail = payload.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new D1Error(`D1 hatasi: ${detail}`);
  }

  const first = payload.result?.[0];
  return { rows: first?.results ?? [], meta: first?.meta ?? {} };
}

/** SELECT — satır dizisi döndürür. */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: D1Value[] = []
): Promise<T[]> {
  const { rows } = await request<T>(sql, params);
  return rows;
}

/** SELECT — ilk satır ya da null. */
export async function d1First<T = Record<string, unknown>>(
  sql: string,
  params: D1Value[] = []
): Promise<T | null> {
  const rows = await d1Query<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT / UPDATE / DELETE — etkilenen satır bilgisini döndürür. */
export async function d1Run(sql: string, params: D1Value[] = []): Promise<D1Meta> {
  const { meta } = await request<never>(sql, params);
  return meta;
}

/**
 * Birden fazla ifadeyi sırayla çalıştırır.
 * D1 REST uç noktası ifade başına parametre bağlamayı desteklemediği için
 * atomik değildir; bu yüzden çağıran taraf sıralamayı önemli olduğu
 * durumlarda (önce alt kayıtlar) kendisi kurmalıdır.
 */
export async function d1Batch(
  statements: Array<{ sql: string; params?: D1Value[] }>
): Promise<D1Meta[]> {
  const out: D1Meta[] = [];
  for (const stmt of statements) {
    out.push(await d1Run(stmt.sql, stmt.params ?? []));
  }
  return out;
}

/** SQLite 0|1 → boolean */
export function toBool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  return Number(value) === 1;
}

/** boolean → SQLite 0|1 */
export function fromBool(value: unknown, fallback = true): number {
  if (value === null || value === undefined) return fallback ? 1 : 0;
  return value ? 1 : 0;
}

/** Appwrite $id biçimine yakın, URL güvenli kimlik. */
export function newId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
