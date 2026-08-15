import { NextResponse } from 'next/server';
import { databases, appwriteConfig, Query } from '@/lib/appwrite';
import { sendMail } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { databaseId, collections } = appwriteConfig;

const CONSOLE_URL = 'https://cloud.appwrite.io/console';

/**
 * Backend saglik kontrolu ve uyari e-postasi.
 *
 * NOT: Appwrite ucretsiz planinda proje yalnizca Console'daki gelistirme
 * etkinligiyle aktif kalir; buradan gelen API sorgulari duraklamayi onlemez
 * (Appwrite politika degisikligi, Subat 2026). Bu yuzden duraklama
 * engellenemiyor, sadece tespit edilip e-posta ile bildiriliyor.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!appwriteConfig.projectId) {
    return NextResponse.json({ ok: false, error: 'appwrite_not_configured' }, { status: 500 });
  }

  const targets = [collections.settings, collections.projects, collections.services];
  const results: Record<string, string> = {};

  for (const collection of targets) {
    try {
      await databases.listDocuments(databaseId, collection, [Query.limit(1)]);
      results[collection] = 'ok';
    } catch (e) {
      results[collection] = e instanceof Error ? e.message : 'error';
    }
  }

  const ok = Object.values(results).every((v) => v === 'ok');
  const paused = Object.values(results).some((v) => v.includes('paused'));

  let notified: string | undefined;
  if (!ok) {
    const mail = await sendMail({
      subject: paused
        ? 'cbnplaque.com — Appwrite projesi duraklatildi'
        : 'cbnplaque.com — backend erisilemiyor',
      html: `
        <h2>${paused ? 'Appwrite projesi duraklatildi' : 'Backend erisilemiyor'}</h2>
        <p>Sitede projeler, resimler ve logo gorunmuyor olabilir.</p>
        <p><strong>Yapilmasi gereken:</strong> <a href="${CONSOLE_URL}">Appwrite Console</a>
        adresine gir, CBN Plaque projesini ac ve <em>Restore</em> butonuna bas.</p>
        <hr>
        <pre style="font-size:12px">${JSON.stringify(results, null, 2)}</pre>
      `
    });
    notified = mail.ok ? 'sent' : mail.reason;
  }

  return NextResponse.json(
    { ok, paused, checkedAt: new Date().toISOString(), results, ...(notified ? { notified } : {}) },
    { status: ok ? 200 : 503 }
  );
}
