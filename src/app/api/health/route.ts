import { NextResponse } from 'next/server';
import { d1Query, isD1Configured } from '@/lib/d1';
import { isR2Configured } from '@/lib/r2';
import { sendMail } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Backend sağlık kontrolü (günlük cron).
 *
 * Cloudflare D1 ve R2 hareketsizlikte duraklatılmaz; bu uç bir şeyi
 * ayakta tutmaz, yalnızca bozulmayı erken haber verir. Sorun varsa
 * mevcut Resend kurulumuyla uyarı e-postası gönderir.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const checks: Record<string, string> = {
    d1_config: isD1Configured() ? 'ok' : 'ortam degiskenleri eksik',
    r2_config: isR2Configured() ? 'ok' : 'ortam degiskenleri eksik'
  };

  if (isD1Configured()) {
    for (const table of ['settings', 'projects', 'services']) {
      try {
        await d1Query(`SELECT id FROM ${table} LIMIT 1`);
        checks[table] = 'ok';
      } catch (e) {
        checks[table] = e instanceof Error ? e.message : 'hata';
      }
    }
  }

  const ok = Object.values(checks).every((v) => v === 'ok');

  let notified: string | undefined;
  if (!ok) {
    const mail = await sendMail({
      subject: 'cbnplaque.com — backend erisilemiyor',
      html: `
        <h2>Backend saglik kontrolu basarisiz</h2>
        <p>Sitede projeler, resimler veya logo gorunmuyor olabilir.</p>
        <pre style="font-size:12px">${JSON.stringify(checks, null, 2)}</pre>
      `
    });
    notified = mail.ok ? 'sent' : mail.reason;
  }

  return NextResponse.json(
    { ok, checkedAt: new Date().toISOString(), checks, ...(notified ? { notified } : {}) },
    { status: ok ? 200 : 503 }
  );
}
