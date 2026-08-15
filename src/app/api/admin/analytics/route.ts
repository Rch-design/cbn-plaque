import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { requireAdmin, adminError } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalyticsRow {
  id: string;
  date: string;
  page: string;
  views: number;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ('response' in guard) return guard.response;

  try {
    const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days')) || 30, 1), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await d1Query<AnalyticsRow>(
      'SELECT * FROM analytics WHERE date >= ? ORDER BY date DESC LIMIT 500',
      [since.toISOString().slice(0, 10)]
    );

    return NextResponse.json({
      ok: true,
      rows: rows.map((r) => ({ $id: r.id, date: r.date, page: r.page, views: Number(r.views) }))
    });
  } catch (e) {
    return adminError(e);
  }
}
