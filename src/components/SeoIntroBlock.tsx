interface Props {
  introTitle?: string;
  intro1?: string;
  intro2?: string;
  zonesTitle?: string;
  zones?: string;
}

/** Visible local SEO block — keywords for Google + users */
export default function SeoIntroBlock({ introTitle, intro1, intro2, zonesTitle, zones }: Props) {
  if (!intro1 && !introTitle) return null;

  return (
    <section aria-labelledby="page-seo-intro" className="mx-auto mb-10 max-w-3xl">
      {introTitle && (
        <h2 id="page-seo-intro" className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
          {introTitle}
        </h2>
      )}
      {intro1 && (
        <p className="mt-3 text-center leading-relaxed text-gray-700">{intro1}</p>
      )}
      {intro2 && (
        <p className="mt-2 text-center leading-relaxed text-gray-600">{intro2}</p>
      )}
      {zones && zonesTitle && (
        <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{zonesTitle}</p>
          <p className="mt-1 text-sm text-gray-800">{zones}</p>
        </div>
      )}
    </section>
  );
}
