import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run, newId } from '@/lib/d1';
import { CATEGORIES_SETTING_KEY, parseCategories } from '@/lib/categories';
import { requireAdmin, adminError } from '@/lib/admin-guard';
import { revalidateContent } from '@/lib/revalidate';
import type { ProjectCategory } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const row = await d1First<{ value_fr: string }>(
      'SELECT value_fr FROM settings WHERE key = ? LIMIT 1',
      [CATEGORIES_SETTING_KEY]
    );
    return NextResponse.json({ ok: true, categories: parseCategories(row?.value_fr) });
  } catch (e) {
    return adminError(e);
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const { categories } = (await req.json()) as { categories?: ProjectCategory[] };
    if (!Array.isArray(categories)) {
      return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    }

    const json = JSON.stringify(categories);
    await d1Run(
      `INSERT INTO settings (id, key, value_fr, value_tr, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value_fr = excluded.value_fr,
         value_tr = excluded.value_tr,
         updated_at = datetime('now')`,
      [newId(), CATEGORIES_SETTING_KEY, json, json]
    );

    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminError(e);
  }
}
