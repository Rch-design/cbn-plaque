import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Run, newId } from '@/lib/d1';
import { requireAdmin, adminError } from '@/lib/admin-guard';
import { revalidateContent } from '@/lib/revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SettingRow {
  id: string;
  key: string;
  value_fr: string;
  value_tr: string;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const rows = await d1Query<SettingRow>('SELECT * FROM settings LIMIT 500');
    return NextResponse.json({
      ok: true,
      documents: rows.map((r) => ({ ...r, $id: r.id }))
    });
  } catch (e) {
    return adminError(e);
  }
}

/**
 * PUT /api/admin/settings
 * Gövde: tek ayar `{ key, value_fr, value_tr }` ya da toplu `{ items: [...] }`.
 * Ayarlar `key` üzerinden upsert edilir; ayrı bir doküman kimliği tutmaya gerek yok.
 */
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const body = (await req.json()) as
      | { key?: string; value_fr?: string; value_tr?: string; items?: unknown }
      | undefined;

    const items = Array.isArray(body?.items)
      ? (body!.items as Array<{ key?: string; value_fr?: string; value_tr?: string }>)
      : [{ key: body?.key, value_fr: body?.value_fr, value_tr: body?.value_tr }];

    const saved: string[] = [];
    for (const item of items) {
      const key = (item.key ?? '').trim();
      if (!key) continue;

      await d1Run(
        `INSERT INTO settings (id, key, value_fr, value_tr, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET
           value_fr = excluded.value_fr,
           value_tr = excluded.value_tr,
           updated_at = datetime('now')`,
        [newId(), key, String(item.value_fr ?? ''), String(item.value_tr ?? '')]
      );
      saved.push(key);
    }

    revalidateContent();
    return NextResponse.json({ ok: true, saved });
  } catch (e) {
    return adminError(e);
  }
}
