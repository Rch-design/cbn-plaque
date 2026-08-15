import { NextRequest, NextResponse } from 'next/server';
import { d1Query, d1Run, newId } from '@/lib/d1';
import { getTableSpec, pickColumns, rowToDoc } from '@/lib/admin-tables';
import { requireAdmin, adminError } from '@/lib/admin-guard';
import { revalidateContent } from '@/lib/revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { resource: string } };

/** GET /api/admin/<kaynak> — tüm kayıtlar */
export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  const spec = getTableSpec(params.resource);
  if (!spec) return NextResponse.json({ ok: false, error: 'unknown_resource' }, { status: 404 });

  try {
    const rows = await d1Query(
      `SELECT * FROM ${spec.table} ORDER BY ${spec.orderBy} LIMIT ${spec.limit}`
    );
    return NextResponse.json({ ok: true, documents: rows.map((r) => rowToDoc(spec, r)) });
  } catch (e) {
    return adminError(e);
  }
}

/** POST /api/admin/<kaynak> — yeni kayıt */
export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  const spec = getTableSpec(params.resource);
  if (!spec) return NextResponse.json({ ok: false, error: 'unknown_resource' }, { status: 404 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { names, values } = pickColumns(spec, body);
    const id = String(body.id ?? '').trim() || newId();

    const columns = ['id', ...names];
    const placeholders = columns.map(() => '?').join(', ');

    await d1Run(
      `INSERT INTO ${spec.table} (${columns.join(', ')}) VALUES (${placeholders})`,
      [id, ...values]
    );

    const [row] = await d1Query(`SELECT * FROM ${spec.table} WHERE id = ?`, [id]);
    revalidateContent();
    return NextResponse.json({ ok: true, document: row ? rowToDoc(spec, row) : { $id: id } });
  } catch (e) {
    return adminError(e);
  }
}
