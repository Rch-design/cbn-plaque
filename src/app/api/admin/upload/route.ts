import { NextRequest, NextResponse } from 'next/server';
import { r2Put, r2Delete, buildObjectKey, isR2Configured } from '@/lib/r2';
import { requireAdmin, adminError } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];

/** POST — multipart `file` alanını R2'ye yükler, nesne anahtarını döndürür. */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  if (!isR2Configured()) {
    return NextResponse.json({ ok: false, error: 'r2_not_configured' }, { status: 503 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') ?? 'images').replace(/[^a-z0-9-]/gi, '') || 'images';

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'missing_file' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 413 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok: false, error: 'unsupported_type' }, { status: 415 });
    }

    const key = buildObjectKey(folder, file.name || 'image');
    await r2Put(key, Buffer.from(await file.arrayBuffer()), file.type);

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    return adminError(e);
  }
}

/** DELETE ?key=... — R2'den nesneyi siler. */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const key = (req.nextUrl.searchParams.get('key') ?? '').trim();
    if (!key) return NextResponse.json({ ok: false, error: 'missing_key' }, { status: 400 });

    await r2Delete(key);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminError(e);
  }
}
