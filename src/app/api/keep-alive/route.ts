import { NextResponse } from 'next/server';
import { databases, appwriteConfig, Query } from '@/lib/appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { databaseId, collections } = appwriteConfig;

/**
 * Appwrite ucretsiz plan projeyi hareketsizlikte duraklatir.
 * Gunluk cron bu sorgularla projeyi aktif tutar.
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

  return NextResponse.json(
    { ok, checkedAt: new Date().toISOString(), results },
    { status: ok ? 200 : 503 }
  );
}
