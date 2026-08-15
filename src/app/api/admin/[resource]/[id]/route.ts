import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Run } from '@/lib/d1';
import { getTableSpec, pickColumns, rowToDoc } from '@/lib/admin-tables';
import { requireAdmin, adminError } from '@/lib/admin-guard';
import { revalidateContent } from '@/lib/revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { resource: string; id: string } };

/** PATCH /api/admin/<kaynak>/<id> — alanları günceller */
export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  const spec = getTableSpec(params.resource);
  if (!spec) return NextResponse.json({ ok: false, error: 'unknown_resource' }, { status: 404 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { names, values } = pickColumns(spec, body);
    if (names.length === 0) {
      return NextResponse.json({ ok: false, error: 'no_fields' }, { status: 400 });
    }

    const assignments = names.map((n) => `${n} = ?`);
    if (spec.touchUpdatedAt) assignments.push("updated_at = datetime('now')");

    await d1Run(`UPDATE ${spec.table} SET ${assignments.join(', ')} WHERE id = ?`, [
      ...values,
      params.id
    ]);

    const [row] = await d1Query(`SELECT * FROM ${spec.table} WHERE id = ?`, [params.id]);
    revalidateContent();
    return NextResponse.json({ ok: true, document: row ? rowToDoc(spec, row) : null });
  } catch (e) {
    return adminError(e);
  }
}

/** DELETE /api/admin/<kaynak>/<id> */
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  const spec = getTableSpec(params.resource);
  if (!spec) return NextResponse.json({ ok: false, error: 'unknown_resource' }, { status: 404 });

  try {
    await d1Run(`DELETE FROM ${spec.table} WHERE id = ?`, [params.id]);
    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminError(e);
  }
}
