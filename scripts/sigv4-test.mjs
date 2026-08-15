/**
 * src/lib/r2.ts icindeki AWS SigV4 imzasini AWS dokumantasyonundaki
 * resmi ornek istekle karsilastirir. R2 kimlik bilgisi gerektirmez.
 *
 * Kullanim: npm run test:sigv4
 */
import { signRequest } from '../src/lib/r2.ts';

const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/** AWS docs — "Example: GET Object" (Signature Version 4 signing process) */
const cases = [
  {
    name: 'S3 GET Object (Range basligi ile)',
    input: {
      method: 'GET',
      host: 'examplebucket.s3.amazonaws.com',
      uri: '/test.txt',
      payloadHash: EMPTY_SHA256,
      headers: { range: 'bytes=0-9' },
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      region: 'us-east-1',
      service: 's3',
      date: new Date('2013-05-24T00:00:00Z')
    },
    expectedSignature: 'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41',
    expectedSignedHeaders: 'host;range;x-amz-content-sha256;x-amz-date'
  }
];

let failed = 0;

for (const c of cases) {
  const headers = signRequest(c.input);
  const auth = headers.Authorization;
  const signature = auth.match(/Signature=([a-f0-9]+)/)?.[1] ?? '';
  const signedHeaders = auth.match(/SignedHeaders=([^,]+)/)?.[1] ?? '';

  const okSig = signature === c.expectedSignature;
  const okHeaders = signedHeaders === c.expectedSignedHeaders;

  console.log(`\n${c.name}`);
  console.log(`  SignedHeaders  ${okHeaders ? 'ok' : 'HATA'}`);
  if (!okHeaders) {
    console.log(`    beklenen : ${c.expectedSignedHeaders}`);
    console.log(`    bulunan  : ${signedHeaders}`);
  }
  console.log(`  Signature      ${okSig ? 'ok' : 'HATA'}`);
  if (!okSig) {
    console.log(`    beklenen : ${c.expectedSignature}`);
    console.log(`    bulunan  : ${signature}`);
  }

  if (!okSig || !okHeaders) failed++;
}

if (failed) {
  console.error(`\n${failed} test basarisiz — R2 yuklemeleri calismaz.\n`);
  process.exit(1);
}
console.log('\nSigV4 imzasi AWS referans ornegiyle birebir uyusuyor.\n');
