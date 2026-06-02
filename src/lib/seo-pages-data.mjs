/** SEO blog sayfalari — admin sablonlari + seed script ortak kaynak */

export const SEO_PAGE_SLUGS = [
  'pose-plaques-platre-morbier',
  'peinture-interieure-haut-jura',
  'renovation-combles-jura'
];

export const PAGE_TEMPLATES = [
  {
    id: 'pose-plaques',
    label: 'Pose de plaques — Morbier',
    slug: 'pose-plaques-platre-morbier',
    title_fr: 'Pose de plaques de plâtre à Morbier — plaquiste Haut-Jura',
    title_tr: 'Morbier alçıpan montajı — Haut-Jura plaquiste',
    seo_keywords_fr:
      'pose plaques plâtre Morbier, plaquiste Haut-Jura, cloisons placo Jura 39, faux-plafond Morbier, doublage mur Morez',
    seo_keywords_tr:
      'Morbier alçıpan montajı, Haut-Jura alçıpan ustası, bölme duvar Jura 39, asma tavan Morbier',
    content_fr: `CBN Plaque est votre artisan plaquiste à Morbier (39400), spécialisé dans la pose de plaques de plâtre, les cloisons, les faux-plafonds et les finitions dans tout le Haut-Jura. Que vous rénoviez une maison à Morbier, un appartement à Morez ou un local professionnel aux Rousses, nous réalisons des travaux propres, durables et prêts à peindre.

## Pourquoi choisir un plaquiste local à Morbier ?

Faire appel à un plaquiste basé dans le Jura (39), c'est bénéficier d'un interlocuteur de proximité qui connaît les spécificités des logements de montagne : humidité, combles, isolation, maisons anciennes en pierre. CBN Plaque intervient rapidement, respecte les délais annoncés et vous propose un devis gratuit et détaillé avant tout chantier.

## Nos prestations en plaques de plâtre

- Cloisons distributives (création de chambres, bureaux, salles de bain)
- Doublage collé ou sur ossature (isolation thermique et phonique)
- Faux-plafonds placo, dalles ou design avec intégration lumineuse
- Habillages autour de poutres, tuyaux et gaines techniques
- Jointoiement, enduits de lissage et préparation peinture
- Aménagements sur mesure : niches, meubles TV en placo, bibliothèques

## Types de projets que nous réalisons

Nous accompagnons les particuliers pour des rénovations complètes ou partielles, ainsi que les professionnels (commerces, bureaux, copropriétés). Du simple agrandissement d'une pièce à la restructuration totale d'un étage, chaque projet fait l'objet d'un conseil personnalisé sur les matériaux et les finitions.

## Zones d'intervention — Haut-Jura et Jura (39)

CBN Plaque intervient à Morbier et dans les communes voisines : Morez, Les Rousses, Saint-Claude, Longchaumois, Hauts de Bienne, et l'ensemble du Haut-Jura. N'hésitez pas à nous contacter même si votre commune n'est pas listée — nous étudions chaque demande.

## Devis gratuit et délais

Chaque projet commence par un échange téléphonique ou une visite sur place. Nous établissons un devis clair, sans surprise, et planifions les travaux selon vos contraintes. Appelez le 06 12 60 55 00 ou utilisez le formulaire de contact sur cbnplaque.com.

## Questions fréquentes

### Combien de temps pour poser une cloison placo ?
Selon la surface et la complexité, une cloison standard se pose généralement en 1 à 3 jours, finitions comprises.

### Faut-il quitter le logement pendant les travaux ?
Non, dans la plupart des cas les travaux sont localisés et nous protégeons les zones de vie.

### Proposez-vous la peinture après la pose ?
Oui, CBN Plaque assure également la peinture intérieure et les finitions complètes.`,
    content_tr: `CBN Plaque, Morbier (39400) merkezli alçıpan ve plaquiste ustasıdır. Haut-Jura bölgesinde bölme duvar, asma tavan, duvar kaplama ve pürüzsüz bitirme işleri yapıyoruz. Morbier, Morez veya Les Rousses'ta evinizi yeniliyor olsanız da, size temiz ve dayanıklı işçilik sunuyoruz.

## Neden Morbier'de yerel usta?

Dağ iklimindeki konutların nem, yalıtım ve eski yapı özelliklerini bilen yerel ekip, hızlı müdahale ve net fiyat teklifi sağlar. Her proje öncesi ücretsiz keşif ve bağlayıcı olmayan teklif veriyoruz.

## Alçıpan hizmetlerimiz

- Bölme duvarlar (oda, banyo, ofis düzenleme)
- Duvar kaplama (ısı ve ses yalıtımı)
- Asma tavan sistemleri
- Kiriş, boru ve tesisat gizleme kaplamaları
- Derz, sıva ve boya öncesi hazırlık
- Niş, TV ünitesi ve özel alçıpan mobilya

## Hizmet bölgeleri

Morbier, Morez, Les Rousses, Saint-Claude, Longchaumois ve Haut-Jura genelinde çalışıyoruz.

## Ücretsiz teklif

06 12 60 55 00 veya cbnplaque.com iletişim formu.`
  },
  {
    id: 'peinture',
    label: 'Peinture intérieure — Jura',
    slug: 'peinture-interieure-haut-jura',
    title_fr: 'Peinture intérieure à Morbier — peintre professionnel Haut-Jura',
    title_tr: 'Morbier iç mekan boya — Haut-Jura boya ustası',
    seo_keywords_fr:
      'peinture intérieure Morbier, peintre Haut-Jura, rénovation peinture Jura 39, artisan peintre Morez, rafraîchissement murs',
    seo_keywords_tr:
      'Morbier iç boya, Haut-Jura boyacı, Jura 39 boya badana, Morez boya ustası',
    content_fr: `CBN Plaque réalise vos travaux de peinture intérieure à Morbier et dans tout le Haut-Jura (Jura 39). Murs, plafonds, boiseries : nous préparons soigneusement les supports et appliquons des peintures de qualité pour un résultat net, lumineux et durable.

## Peintre à Morbier : un savoir-faire complet

Notre activité de peintre s'inscrit dans une démarche globale de rénovation intérieure. Après des travaux de plâtrerie ou sur supports existants, nous garantissons une préparation minutieuse — rebouchage, ponçage, sous-couche — indispensable à une finition professionnelle.

## Prestations peinture intérieure

- Peinture murs et plafonds (mat, satin, velours)
- Rénovation après dégâts des eaux ou remplacement de cloisons
- Peinture de pièces humides (salle de bain, cuisine) avec produits adaptés
- Conseils couleurs et harmonisation des teintes
- Protection des sols et nettoyage complet en fin de chantier
- Rafraîchissement complet avant location ou vente

## Pour qui ?

Particuliers, propriétaires, locataires, commerces et petites entreprises du Haut-Jura. Que ce soit une chambre, un salon, un couloir ou l'intégralité d'un logement, nous adaptons notre intervention à votre budget et votre calendrier.

## Communes desservies

Morbier, Morez, Les Rousses, Saint-Claude, Longchaumois, Haut-Jura et environs du département du Jura (39).

## Demandez votre devis peinture

Contactez CBN Plaque au 06 12 60 55 00 ou via le formulaire en ligne. Devis gratuit, réponse sous 48 h.

## Questions fréquentes

### Quel délai entre deux couches ?
En général 24 à 48 h de séchage selon le produit et la ventilation.

### Dois-je vider la pièce ?
Nous déplaçons les meubles légers et protégeons le reste ; vous n'avez pas à tout vider.

### Peignez-vous après des travaux de placo ?
Oui, c'est notre spécialité : plâtrerie puis peinture clé en main.`,
    content_tr: `CBN Plaque, Morbier ve Haut-Jura'da profesyonel iç mekan boyası yapar. Duvar, tavan ve ahşap yüzeylerde kaliteli boya ve özenli hazırlık ile uzun ömürlü sonuç sunuyoruz.

## Morbier'de boya ustası

Alçıpan işlerinden sonra veya mevcut yüzeylerde; macun, zımpara ve astar dahil tam hazırlık yapıyoruz.

## Hizmetler

- Duvar ve tavan boyası (mat, saten)
- Su hasarı veya renovasyon sonrası boya
- Banyo ve mutfak nemli hacim boyası
- Renk danışmanlığı
- Temiz teslim

## Bölgeler

Morbier, Morez, Les Rousses, Saint-Claude, Jura (39).

## Teklif

06 12 60 55 00 veya iletişim formu — ücretsiz keşif.`
  },
  {
    id: 'combles',
    label: 'Rénovation combles — Jura',
    slug: 'renovation-combles-jura',
    title_fr: 'Rénovation de combles à Morbier — aménagement & isolation',
    title_tr: 'Morbier çatı katı renovasyonu — izolasyon ve düzenleme',
    seo_keywords_fr:
      'rénovation combles Morbier, aménagement combles Jura, isolation combles Haut-Jura, placo combles 39, grenier aménagé',
    seo_keywords_tr:
      'Morbier çatı katı, combles izolasyon Jura, çatı arası alçıpan Haut-Jura',
    content_fr: `Vous souhaitez aménager ou isoler vos combles à Morbier ou dans le Haut-Jura ? CBN Plaque transforme vos espaces sous toiture en pièces confortables : chambre, bureau, salle de jeux ou rangement. Isolation, plâtrerie, électricité (en coordination) et peinture — un interlocuteur unique pour votre projet.

## Aménagement de combles dans le Jura (39)

Les maisons du Haut-Jura offrent souvent un potentiel sous-exploité au niveau des combles. Une rénovation bien pensée améliore le confort thermique été comme hiver, réduit les factures de chauffage et augmente la surface habitable sans extension extérieure.

## Nos interventions en combles

- Isolation thermique par l'intérieur (laine de verre, laine de roche)
- Pose de plaques de plâtre sur rampants et murs
- Création de cloisons et circulation (escalier, couloir)
- Faux-plafonds avec intégration de spots LED
- Velux et ouvertures (coordination avec menuisier si besoin)
- Peinture et finitions complètes

## Avantages d'une isolation de combles

- Réduction des déperditions de chaleur (jusqu'à 30 % de la chaleur d'une maison)
- Suppression des ponts thermiques
- Confort acoustique amélioré
- Valorisation du bien immobilier

## Zone d'intervention

Morbier, Morez, Les Rousses, Saint-Claude et communes du Haut-Jura. Devis gratuit après visite et prise de mesures.

## Contact

06 12 60 55 00 — cbnplaque@gmail.com — formulaire sur cbnplaque.com

## Questions fréquentes

### Faut-il un permis pour aménager des combles ?
Selon la surface créée et la hauteur sous plafond, des démarches peuvent être nécessaires ; nous vous orientons.

### Quel budget pour isoler 40 m² de combles ?
Chaque projet est unique ; comptez sur un devis personnalisé après visite.`,
    content_tr: `Morbier ve Haut-Jura'da çatı katınızı CBN Plaque ile yaşam alanına dönüştürün. Yalıtım, alçıpan, bölme duvarlar ve boya — tek elden çözüm.

## Çatı katı neden değer katar?

Haut-Jura evlerinde çatı arası genelde kullanılmayan alan. İyi izolasyon ve düzenleme ile enerji tasarrufu ve ekstra oda kazanırsınız.

## Yaptığımız işler

- Isı yalıtımı (cam yünü, taş yünü)
- Alçıpan kaplama
- Bölme duvar ve koridor
- Asma tavan ve LED aydınlatma
- Boya ve son işler

## Bölgeler

Morbier, Morez, Les Rousses, Saint-Claude, Jura (39).

## Teklif

06 12 60 55 00 — ücretsiz keşif.`
  }
];
