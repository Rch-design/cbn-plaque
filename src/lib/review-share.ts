/** Müşteriye gönderilecek Google yorum isteği metinleri (sahibi kopyalar / WhatsApp'tan yapıştırır) */

export function buildReviewRequestMessage(locale: string, googleReviewUrl: string): string {
  const url = googleReviewUrl.trim();
  if (!url) return '';

  if (locale === 'tr') {
    return `Merhaba,

CBN Plaque ile yaptığımız işler için teşekkürler.

Memnun kaldıysanız, Google'da kısa bir değerlendirme bizi Morbier ve Haut-Jura'da tanıtmamıza çok yardımcı olur:
${url}

Kendi cümlelerinizle yazmanız yeterli — teşekkürler!

CBN Plaque
06 12 60 55 00`;
  }

  return `Bonjour,

Merci encore pour votre confiance et pour les travaux réalisés avec CBN Plaque.

Si vous êtes satisfait(e), un petit avis Google nous aide beaucoup à faire connaître notre activité à Morbier et dans le Haut-Jura :
${url}

N'hésitez pas à écrire avec vos propres mots — un grand merci !

CBN Plaque
06 12 60 55 00`;
}
