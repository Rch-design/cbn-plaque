# Cursor Prompt — CBN Plaque Web Sitesi

Bu dosya, projeyi **sıfırdan yeniden üretmek** veya **geliştirmek** için Cursor'a (veya başka bir AI ajanına) yapıştırabileceğiniz hazır promptları içerir.

---

## 1) Sıfırdan tüm projeyi üretmek için ana prompt

> Aşağıdaki metni olduğu gibi kopyalayıp Cursor sohbetine yapıştırın.

```
Bir zanaatkâr (alçıpan montajı, alçı, boya, dekorasyon, izolasyon) için modern,
canlı renkli, İKİ DİLLİ (Fransızca + Türkçe) bir vitrin sitesi ve tam bir yönetim
paneli oluştur.

TEKNOLOJİ:
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (canlı palet: turuncu "brand" + mavi "ocean")
- next-intl ile çoklu dil: /fr ve /tr rotaları, varsayılan fr
- Appwrite Cloud: Auth (admin girişi), Databases (içerik), Storage (foto)
- Vercel'e deploy edilebilir

GENEL (PUBLIC) SAYFALAR (hepsi /[locale] altında, dinamik render):
- Anasayfa: renkli hero, hizmetler önizleme, "neden biz", öne çıkan projeler, CTA
- Hizmetler: 5 hizmet (alçıpan, alçı, boya, dekorasyon, izolasyon) ikonlarla
- Referanslar/Galeri: kategoriye göre filtre (mur=duvar, plafond=tavan, comble=çatı katı),
  proje detayında lightbox'lı çoklu foto galerisi
- İletişim: ad/e-posta/telefon/mesaj formu (Appwrite messages koleksiyonuna kaydeder),
  ayrıca telefon/e-posta/bölge bilgisi
- Her sayfada FR/TR dil değiştirici, sticky header, footer

YÖNETİM PANELİ (/admin, lokalize DEĞİL, arayüz Türkçe):
- Appwrite Auth ile e-posta+şifre girişi
- Hizmetler: ekle/düzenle/sil (FR ve TR metinler, ikon, sıra)
- Projeler: ekle/düzenle/sil, FOTOĞRAF YÜKLEME (Appwrite Storage'a, sürükle-bırak/çoklu),
  kapak fotoğrafı seçimi, kategori, sıra
- Mesajlar: listele, okundu/okunmadı, sil
- Ayarlar: telefon, e-posta, hizmet bölgesi (bölge iki dilli)

APPWRITE ŞEMASI (koleksiyonlar, hepsi document security KAPALI):
- services: title_fr*, title_tr, desc_fr, desc_tr, icon, sort_order(int)
  İzin: read=any, create/update/delete=users
- projects: title_fr*, title_tr, desc_fr, desc_tr, category*, cover_file_id, sort_order(int)
  İzin: read=any, create/update/delete=users
- project_images: project_id*, file_id*, sort_order(int)
  İzin: read=any, create/update/delete=users
- messages: name*, email*, phone, body*, is_read(bool)
  İzin: create=ANY (anonim form gönderebilsin), read/update/delete=users
- site_settings: key*, value_fr, value_tr
  İzin: read=any, create/update/delete=users
- Storage bucket "project-images": read=any, create/update/delete=users, file security KAPALI

EK İSTEKLER:
- node-appwrite kullanan "scripts/setup-appwrite.mjs" yaz; tüm koleksiyon/alan/izin
  ve bucket'ı otomatik kursun; .env.local'ı kendisi okusun; ADMIN_EMAIL/ADMIN_PASSWORD
  verilmişse admin kullanıcısını da oluştursun.
- Tüm Appwrite ID'leri .env üzerinden gelsin; env yoksa site çökmeden varsayılan
  içerik göstersin.
- .env.local.example, README.md (TR+FR kurulum) ekle.
- Mobil uyumlu, erişilebilir, şık tasarım. Türkçe/Fransızca tüm metinler hazır gelsin.
```

---

## 2) Sık kullanılacak geliştirme promptları

**Yeni bir hizmet kategorisi/sayfası eklemek:**
```
Galeriye yeni bir kategori ekle: "exterieur" (TR: "Dış cephe"). CATEGORIES tipini,
çeviri dosyalarını (fr.json/tr.json realisations.categories), kategori filtresini ve
admin proje formundaki kategori seçeneklerini güncelle.
```

**Anasayfaya müşteri yorumları bölümü eklemek:**
```
Anasayfaya "Müşteri yorumları" bölümü ekle. Appwrite'ta "testimonials" koleksiyonu
oluştur (author, body_fr, body_tr, rating(int), sort_order). setup-appwrite.mjs'e
ekle, admin paneline yeni bir "Yorumlar" sekmesi/yöneticisi ekle ve anasayfada
göster. Mevcut kod desenlerini (ServicesManager, getServices) takip et.
```

**Renk teması değiştirmek:**
```
Sitenin ana rengini turuncudan yeşile çevir. tailwind.config.ts içindeki "brand"
paletini yeşil tonlarıyla değiştir ve gradient kullanılan yerleri kontrol et.
```

**E-posta bildirimi eklemek (iletişim formu):**
```
İletişim formu gönderildiğinde bana e-posta gelsin. Bir Next.js Route Handler
(app/api/contact/route.ts) ekle; Resend veya Appwrite Messaging ile e-posta gönder.
ContactForm'u bu endpoint'i de çağıracak şekilde güncelle.
```

---

## 3) Önemli komutlar

```bash
npm install              # bağımlılıklar
npm run setup:appwrite   # Appwrite'ı otomatik kur
npm run dev              # geliştirme sunucusu (localhost:3000)
npm run build            # production derleme
```

## 4) Proje haritası (AI'ya bağlam için)
- `src/lib/appwrite.ts` — Appwrite istemcisi ve ID'ler (env'den)
- `src/lib/data.ts` — public sayfalar için veri okuma fonksiyonları
- `src/lib/types.ts` — tipler ve `localized()` yardımcı fonksiyonu
- `src/components/admin/*` — panel yöneticileri (Services, Projects, Messages, Settings)
- `src/messages/{fr,tr}.json` — tüm arayüz metinleri
- `scripts/setup-appwrite.mjs` — altyapı kurulum scripti
