export interface PageTemplate {
  id: string;
  label: string;
  slug: string;
  title_fr: string;
  title_tr: string;
  content_fr: string;
  content_tr: string;
  seo_keywords_fr: string;
  seo_keywords_tr: string;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'pose-plaques',
    label: 'Pose de plaques — Morbier',
    slug: 'pose-plaques-platre-morbier',
    title_fr: 'Pose de plaques de plâtre à Morbier',
    title_tr: 'Morbier alçıpan montajı',
    seo_keywords_fr:
      'pose plaques plâtre Morbier, plaquiste Haut-Jura, cloisons placo Jura 39, faux-plafond Morbier',
    seo_keywords_tr:
      'Morbier alçıpan montajı, Haut-Jura alçıpan, bölme duvar Jura 39, asma tavan Morbier',
    content_fr: `CBN Plaque réalise la pose de plaques de plâtre à Morbier et dans tout le Haut-Jura (Jura 39). Cloisons, doublages, faux-plafonds et aménagements sur mesure pour particuliers et professionnels.

## Nos prestations placo à Morbier

- Cloisons en plaques de plâtre (distribution des pièces)
- Doublage thermique et phonique des murs
- Faux-plafonds suspendus (dalles, placo, design)
- Niches, encastrements et préparation peinture
- Finitions jointoiement prêtes à peindre

## Pourquoi faire appel à un plaquiste local ?

Un artisan basé à Morbier connaît les contraintes des logements du Haut-Jura : humidité, combles, isolation. Nous garantissons des finitions propres, des délais respectés et un devis gratuit sans engagement.

## Zones d'intervention

Morbier, Morez, Les Rousses, Saint-Claude, Haut-Jura et communes voisines du Jura (39).

## Demander un devis

Contactez CBN Plaque au 06 12 60 55 00 ou via le formulaire de contact. Réponse rapide et visite sur place si nécessaire.`,
    content_tr: `CBN Plaque, Morbier ve Haut-Jura (Jura 39) bölgesinde alçıpan montajı hizmeti sunar. Bölme duvarlar, kaplamalar, asma tavanlar ve özel alçıpan uygulamaları.

## Morbier'de alçıpan hizmetlerimiz

- Alçıpan bölme duvarlar (mekan düzenleme)
- Duvar kaplama (ısı ve ses yalıtımı)
- Asma tavan sistemleri
- Niş, gömme alanlar ve boya öncesi hazırlık
- Derz ve pürüzsüz bitirme

## Neden yerel usta?

Morbier merkezli ekibimiz Haut-Jura konutlarının ihtiyaçlarını bilir. Temiz işçilik, zamanında teslim ve ücretsiz teklif.

## Hizmet bölgeleri

Morbier, Morez, Les Rousses, Saint-Claude, Haut-Jura ve Jura (39) çevresi.

## Teklif alın

06 12 60 55 00 veya iletişim formu ile bize ulaşın.`
  },
  {
    id: 'peinture',
    label: 'Peinture intérieure — Jura',
    slug: 'peinture-interieure-haut-jura',
    title_fr: 'Peinture intérieure à Morbier et dans le Haut-Jura',
    title_tr: 'Morbier iç mekan boya hizmetleri',
    seo_keywords_fr:
      'peinture intérieure Morbier, peintre Haut-Jura, rénovation peinture Jura 39, artisan peintre Morez',
    seo_keywords_tr:
      'Morbier iç boya, Haut-Jura boya ustası, Jura 39 boya, Morez boyacı',
    content_fr: `CBN Plaque assure la peinture intérieure de vos murs et plafonds à Morbier, Morez et dans le Haut-Jura. Préparation des supports, application soignée et choix des finitions.

## Services peinture

- Peinture murs et plafonds (appartements, maisons, locaux pro)
- Préparation : rebouchage, ponçage, sous-couche
- Finitions mate, satinée ou velours
- Rénovation après travaux de plâtrerie
- Conseils teintes et harmonisation des pièces

## Qualité et finitions

Nous travaillons sur supports préparés en plâtrerie ou rénovation. Chaque chantier est protégé, nettoyé et livré prêt à vivre.

## Zone d'intervention

Morbier, Haut-Jura, département du Jura (39), Morez, Les Rousses, Saint-Claude.

## Devis gratuit

Appelez le 06 12 60 55 00 ou demandez un devis via notre formulaire de contact.`,
    content_tr: `CBN Plaque, Morbier, Morez ve Haut-Jura'da duvar ve tavan iç mekan boyası yapar. Yüzey hazırlığı, özenli uygulama ve son kat seçenekleri.

## Boya hizmetlerimiz

- Duvar ve tavan boyası (konut ve işyeri)
- Hazırlık: macun, zımpara, astar
- Mat, saten veya kadife bitiş
- Alçı işleri sonrası boya
- Renk danışmanlığı

## Kaliteli bitirme

Alçıpan veya renovasyon sonrası yüzeylerde profesyonel boya uygulaması. İş bitiminde temiz teslim.

## Hizmet bölgesi

Morbier, Haut-Jura, Jura (39), Morez, Les Rousses, Saint-Claude.

## Ücretsiz teklif

06 12 60 55 00 veya iletişim formu.`
  },
  {
    id: 'combles',
    label: 'Rénovation combles — Jura',
    slug: 'renovation-combles-jura',
    title_fr: 'Rénovation de combles à Morbier — aménagement & isolation',
    title_tr: 'Morbier çatı katı renovasyonu',
    seo_keywords_fr:
      'rénovation combles Morbier, aménagement combles Jura, isolation combles Haut-Jura, placo combles 39',
    seo_keywords_tr:
      'Morbier çatı katı, çatı katı renovasyon Jura, combles izolasyon Haut-Jura',
    content_fr: `Aménagez et isolez vos combles à Morbier avec CBN Plaque : plâtrerie, isolation thermique, peinture et finitions pour créer des pièces supplémentaires confortables.

## Travaux en combles

- Isolation thermique par l'intérieur (murs et rampants)
- Pose de plaques sous toiture
- Création de cloisons et circulation
- Faux-plafonds et éclairage intégré
- Peinture et finitions complètes

## Confort et économies d'énergie

Une bonne isolation des combles réduit les déperditions et améliore le confort toute l'année dans le Haut-Jura.

## Nous contacter

Devis gratuit pour votre projet de combles à Morbier ou dans le Jura (39). Tél. 06 12 60 55 00.`,
    content_tr: `Morbier'de çatı katınızı CBN Plaque ile düzenleyin: izolasyon, alçıpan, boya ve bitirme — konforlu ekstra oda alanları.

## Çatı katı işleri

- İçten ısı yalıtımı (duvar ve çatı eğimi)
- Alçıpan kaplama
- Bölme duvarlar
- Asma tavan ve aydınlatma
- Boya ve son işler

## Konfor ve tasarruf

İyi çatı katı izolasyonu Haut-Jura'da enerji tasarrufu sağlar.

## İletişim

Morbier ve Jura (39) çatı katı projeleri için ücretsiz teklif: 06 12 60 55 00.`
  }
];

export function getPageTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateKeywords(slug: string, locale: string): string | undefined {
  const t = PAGE_TEMPLATES.find((p) => p.slug === slug);
  if (!t) return undefined;
  return locale === 'tr' ? t.seo_keywords_tr : t.seo_keywords_fr;
}
