/**
 * Görsel URL üretimi (R2).
 *
 * Tarayıcıda da çalışması gerektiği için burada sunucuya özel hiçbir şey
 * import edilmez. Yükleme/silme işlemleri `src/lib/r2.ts` içindedir.
 */

/** R2 nesne anahtarından herkese açık URL üretir. */
export function assetUrl(key?: string | null): string {
  const k = (key ?? '').trim();
  if (!k) return '';
  if (/^https?:\/\//i.test(k)) return k;

  const base = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '').trim().replace(/\/+$/, '');
  if (!base) return '';
  return `${base}/${k.replace(/^\/+/, '')}`;
}
