import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getReviews, getSettings, settingValue } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata, buildReviewsJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ts = await getTranslations({ locale, namespace: 'reviews.seo' });
  return buildPageMetadata({
    locale,
    path: '/avis',
    title: ts('title'),
    description: ts('description'),
    keywords: ts('keywords')
  });
}

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sz} ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const colors = [
    'from-orange-400 to-orange-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600'
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-black text-white shadow`}>
      {initials || '?'}
    </div>
  );
}

export default async function AvisPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('reviews');
  const [reviews, settings] = await Promise.all([getReviews(), getSettings()]);

  const googleUrl = settingValue(settings, 'google_review_url', locale, '');

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0
  }));

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
      { name: t('title'), path: '/avis' }
    ]),
    ...(reviews.length > 0
      ? [buildReviewsJsonLd(reviews, avg)].filter(Boolean)
      : [])
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
    <div className="container-page py-14">
      {/* Başlık */}
      <header className="text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
      </header>

      {reviews.length > 0 && (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Özet kutu */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-md ring-1 ring-gray-100 text-center">
            <p className="text-6xl font-black text-gray-900">{avg.toFixed(1)}</p>
            <Stars rating={Math.round(avg)} size="lg" />
            <p className="mt-2 text-sm text-gray-500">
              {reviews.length} {t('reviewCount')}
            </p>

            <div className="mt-6 w-full space-y-2">
              {dist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-2 text-right text-gray-500">{star}</span>
                  <svg className="h-3.5 w-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-400">{count}</span>
                </div>
              ))}
            </div>

            {googleUrl && (
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('leaveReview')}
              </a>
            )}
          </div>

          {/* Yorumlar grid */}
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.$id}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={r.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={r.rating} size="sm" />
                        {r.date_label && (
                          <span className="text-xs text-gray-400">{r.date_label}</span>
                        )}
                      </div>
                    </div>
                    {r.source === 'google' && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                  </div>
                  {r.body && (
                    <p className="text-sm text-gray-600 leading-relaxed">"{r.body}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="mt-16 rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-5xl">⭐</div>
          <p className="mt-4 text-xl font-bold text-gray-700">{t('empty')}</p>
          {googleUrl && (
            <a href={googleUrl} target="_blank" rel="noopener noreferrer"
              className="btn-primary mt-6 inline-flex">
              {t('leaveReview')}
            </a>
          )}
        </div>
      )}

      {/* CTA */}
      {reviews.length > 0 && googleUrl && (
        <div
          className="mt-12 rounded-3xl px-8 py-10 text-center text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
        >
          <p className="text-2xl font-extrabold">{t('ctaTitle')}</p>
          <p className="mt-2 text-white/90">{t('ctaText')}</p>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold transition hover:bg-gray-50"
            style={{ color: 'var(--c-primary-dark)' }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('leaveReview')}
          </a>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/contact" className="btn-secondary">
          {t('contactUs')}
        </Link>
      </div>
    </div>
    </>
  );
}
