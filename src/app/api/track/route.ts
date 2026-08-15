import { NextRequest, NextResponse } from 'next/server';
import { d1Run, isD1Configured, newId } from '@/lib/d1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sayfa görüntüleme sayacı.
 *
 * Tarayıcı artık veritabanına doğrudan yazmıyor; sayaç bu uç üzerinden
 * artırılıyor. (date, page) benzersiz indeksi sayesinde tek sorguda
 * ya yeni satır açılır ya da mevcut satır bir artar.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isD1Configured()) return NextResponse.json({ ok: false }, { status: 503 });

    const { page } = (await req.json()) as { page?: string };
    const slug = (page ?? '').trim().slice(0, 200) || '/';
    const date = new Date().toISOString().slice(0, 10);

    await d1Run(
      `INSERT INTO analytics (id, date, page, views) VALUES (?, ?, ?, 1)
       ON CONFLICT(date, page) DO UPDATE SET views = views + 1`,
      [newId(), date, slug]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[track]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
