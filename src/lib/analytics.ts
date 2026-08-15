/**
 * Ziyaret sayacı — tarayıcı tarafı.
 *
 * Yazma işlemi artık doğrudan veritabanına değil, sunucudaki
 * `/api/track` ucuna gider; böylece herkese açık yazma yetkisi kalmaz.
 */

export interface AnalyticsRow {
  $id: string;
  date: string;
  page: string;
  views: number;
}

/** Bir sayfa görüntülemesi bildirir. Hata sitenin çalışmasını etkilemez. */
export async function trackPageView(pathname: string): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: (pathname || '/').slice(0, 200) }),
      keepalive: true
    });
  } catch {
    // sessiz
  }
}

/** Admin paneli için son N günün satırları. */
export async function fetchAnalyticsRows(days = 30): Promise<AnalyticsRow[]> {
  try {
    const res = await fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.rows) ? (data.rows as AnalyticsRow[]) : [];
  } catch {
    return [];
  }
}
