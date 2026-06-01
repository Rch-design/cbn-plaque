'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchAnalyticsRows, type AnalyticsRow } from '@/lib/analytics';

type Row = AnalyticsRow;

interface DayStat { date: string; views: number }
interface PageStat { page: string; views: number }

function StatCard({
  icon, label, value, sub, color = 'blue'
}: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    blue:   'from-blue-500 to-blue-700',
    green:  'from-green-500 to-green-700',
    orange: 'from-orange-400 to-orange-600',
    purple: 'from-purple-500 to-purple-700'
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color] ?? colors.blue} p-5 text-white shadow-md`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{label}</p>
          <p className="text-3xl font-black">{value}</p>
          {sub && <p className="text-xs text-white/60">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function pageName(path: string, locale = 'fr'): string {
  const map: Record<string, string> = {
    [`/${locale}`]:                    '🏠 Anasayfa',
    [`/${locale}/`]:                   '🏠 Anasayfa',
    '/':                               '🏠 Anasayfa',
    [`/${locale}/services`]:           '🔧 Hizmetler',
    [`/${locale}/realisations`]:       '📸 Referanslar',
    [`/${locale}/avis`]:               '⭐ Değerlendirmeler',
    [`/${locale}/contact`]:            '✉️ İletişim',
  };
  return map[path] ?? path;
}

export default function AnalyticsPanel() {
  const [rows,    setRows]    = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [range,   setRange]   = useState<7 | 14 | 30>(14);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAnalyticsRows(30);
      setRows(data);
      if (data.length === 0) {
        setError('');
      }
    } catch (e) {
      setRows([]);
      setError('Veriler yüklenemedi. Appwrite CORS / izinlerini kontrol edin.');
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="py-10 text-center text-gray-500">İstatistikler yükleniyor…</p>;

  if (rows.length === 0) return (
    <div className="py-16 text-center">
      <p className="text-5xl">📊</p>
      <p className="mt-4 text-xl font-bold text-gray-700">Henüz ziyaretçi verisi yok.</p>
      <p className="mt-1 text-sm text-gray-400">
        Ana siteyi bir kez ziyaret edin (yeni sekme), sonra <strong>Yenile</strong>ye basın.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button type="button" onClick={load}
        className="btn-primary mt-6 !px-5 !py-2 text-sm">
        🔄 Yenile
      </button>
    </div>
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayViews = rows.filter(r => r.date === today).reduce((s, r) => s + r.views, 0);
  const totalViews = rows.reduce((s, r) => s + r.views, 0);

  // Last N days timeline
  const days: DayStat[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const views   = rows.filter(r => r.date === dateStr).reduce((s, r) => s + r.views, 0);
    days.push({ date: dateStr, views });
  }
  const maxViews = Math.max(...days.map(d => d.views), 1);

  // Top pages (last 30 days)
  const pageMap: Record<string, number> = {};
  for (const r of rows) {
    pageMap[r.page] = (pageMap[r.page] ?? 0) + r.views;
  }
  const topPages: PageStat[] = Object.entries(pageMap)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const maxPage = Math.max(...topPages.map(p => p.views), 1);

  // Unique pages
  const uniquePages = Object.keys(pageMap).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Ziyaretçi İstatistikleri</h2>
          <p className="text-sm text-gray-500">Son 30 günlük veriler</p>
        </div>
        <button onClick={load}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          🔄 Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="👁️"  label="Bugün"           value={todayViews} color="blue"   />
        <StatCard icon="📅"  label="Son 30 Gün"      value={totalViews} color="green"  />
        <StatCard icon="📄"  label="Takip Edilen Sayfa" value={uniquePages} color="purple" />
        <StatCard
          icon="🏆"
          label="En Popüler"
          value={topPages[0] ? pageName(topPages[0].page).split(' ').slice(1).join(' ') : '–'}
          sub={topPages[0] ? `${topPages[0].views} görüntülenme` : ''}
          color="orange"
        />
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Günlük Ziyaretler</h3>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {([7, 14, 30] as const).map(n => (
              <button key={n} onClick={() => setRange(n)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${range === n ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                {n}G
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1 overflow-hidden" style={{ height: 140 }}>
          {days.map(({ date, views }) => {
            const pct = (views / maxViews) * 100;
            const isToday = date === today;
            const shortDate = date.slice(5).replace('-', '/');
            return (
              <div key={date} className="group relative flex flex-1 flex-col items-center gap-1">
                {/* tooltip */}
                <div className="absolute bottom-full mb-1 hidden rounded-lg bg-gray-900 px-2 py-1 text-center text-xs text-white shadow-lg group-hover:block whitespace-nowrap z-10">
                  <span className="font-bold">{views}</span> ziyaret<br />
                  <span className="text-gray-300">{date}</span>
                </div>
                <div
                  className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-blue-500' : 'bg-blue-300 hover:bg-blue-400'}`}
                  style={{ height: `${Math.max(pct, views > 0 ? 4 : 0)}%` }}
                />
                {range <= 14 && (
                  <span className={`text-[9px] font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {shortDate}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h3 className="mb-4 font-bold text-gray-800">En Çok Ziyaret Edilen Sayfalar</h3>
        <div className="space-y-3">
          {topPages.map(({ page, views }, i) => (
            <div key={page} className="flex items-center gap-3">
              <span className={`w-5 text-right text-xs font-bold ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{pageName(page)}</p>
                <p className="text-xs text-gray-400 truncate">{page}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{ width: `${(views / maxPage) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-gray-700">{views}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
