'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/types';

export default function CategoryFilter({ active }: { active: string }) {
  const t = useTranslations('realisations');
  const options = ['all', ...CATEGORIES];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((cat) => {
        const isActive = active === cat;
        const href = cat === 'all' ? '/realisations' : `/realisations?cat=${cat}`;
        return (
          <Link
            key={cat}
            href={href}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? t('all') : t(`categories.${cat}`)}
          </Link>
        );
      })}
    </div>
  );
}
