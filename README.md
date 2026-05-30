# CBN Plaque — Site web + Panneau d'administration

Site vitrine bilingue (Français / Türkçe) pour une activité de **pose de plaques de plâtre, plâtrerie, peinture, décoration et isolation**.
Construit avec **Next.js 14 + Tailwind CSS + Appwrite** (Auth, Base de données, Stockage de photos).

> Kurulum rehberi aşağıda hem Fransızca hem Türkçe açıklanmıştır.

---

## 🇹🇷 Türkçe Kurulum (Adım Adım)

### Gerekenler
- [Node.js](https://nodejs.org) 18+ (bilgisayarınızda `node --version` ile kontrol edin)
- Ücretsiz bir [Appwrite Cloud](https://cloud.appwrite.io) hesabı

### 1) Appwrite hesabı ve proje oluşturun
1. https://cloud.appwrite.io adresine girip ücretsiz kayıt olun (kredi kartı gerekmez).
2. **Create project** ile yeni bir proje oluşturun. Proje açıldıktan sonra **Project ID** değerini kopyalayın.
3. Sol menüde **Settings > Platforms > Add platform > Web App** seçin.
   - Name: `CBN Plaque`
   - Hostname: önce `localhost`, yayına aldığınızda Vercel adresinizi de ekleyin (örn. `cbnplaque.vercel.app`).
4. **Overview > Integrate with your server > API Keys > Create API Key** ile bir API anahtarı oluşturun.
   - Scope olarak en kolayı: tüm "Database", "Storage" ve "Users" izinlerini seçin.
   - Oluşan **API Key** değerini kopyalayın (sadece kurulum scripti için kullanılır).

### 2) Ortam değişkenlerini ayarlayın
`.env.local.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:

```bash
cp .env.local.example .env.local   # Windows PowerShell: copy .env.local.example .env.local
```

`.env.local` içinde en az şunları doldurun:
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` = Appwrite Project ID
- `APPWRITE_API_KEY` = oluşturduğunuz API Key
- (İsteğe bağlı) `ADMIN_EMAIL` ve `ADMIN_PASSWORD` = admin paneline gireceğiniz e-posta/şifre

### 3) Bağımlılıkları kurun
```bash
npm install
```

### 4) Appwrite'ı otomatik kurun (tek komut)
Bu komut tüm koleksiyonları, alanları, izinleri ve fotoğraf deposunu (bucket) otomatik oluşturur:
```bash
npm run setup:appwrite
```
`.env.local` içine `ADMIN_EMAIL` ve `ADMIN_PASSWORD` yazdıysanız admin hesabınız da otomatik oluşur.
(Yazmadıysanız Appwrite Console > **Auth > Create user** ile elle bir kullanıcı ekleyin.)

### 5) Siteyi çalıştırın
```bash
npm run dev
```
- Site: http://localhost:3000/fr (veya `/tr`)
- Yönetim paneli: http://localhost:3000/admin

### 6) Fotoğraf nasıl eklenir?
1. http://localhost:3000/admin adresinden e-posta + şifre ile giriş yapın.
2. **Referanslar / Projeler** sekmesi > **+ Yeni proje**.
3. Başlık/açıklamayı (FR ve TR) yazın, kategori seçin.
4. **Fotoğraf ekle** alanından bilgisayar/telefondan birden fazla foto seçin (ilk foto kapak olur).
5. **Kaydet**. Fotoğraflar otomatik Appwrite Storage'a yüklenir ve galeride görünür. Koda dokunmanız gerekmez.

---

## 🇫🇷 Installation (résumé)

```bash
cp .env.local.example .env.local   # remplir PROJECT_ID + APPWRITE_API_KEY
npm install
npm run setup:appwrite             # cree collections, permissions et bucket
npm run dev                        # http://localhost:3000
```

---

## 🚀 Yayına Alma / Hosting (Türkçe)

> ÖNEMLI: Bu bir **Next.js** uygulamasıdır, **Node.js** çalıştırabilen bir hosting gerektirir.
> Klasik "sadece HTML/PHP" paylaşımlı hosting'e (dosyaları FTP ile atma) doğrudan KURULMAZ.
> Admin sayfası (`/admin`) sitenin bir parçasıdır; ayrı bir kurulum gerektirmez — siteyi
> nereye kurarsanız admin de orada `.../admin` adresinde otomatik çalışır.

### Seçenek A — Vercel (ÖNERİLEN, ücretsiz, en kolay)
1. Kodu GitHub'a yükleyin (yeni bir repo oluşturup push edin).
2. [vercel.com](https://vercel.com) > **New Project** > repoyu seçin.
3. **Settings > Environment Variables**'a `.env.local` içindeki tüm `NEXT_PUBLIC_APPWRITE_*`
   değişkenlerini ekleyin. (Üretimde `APPWRITE_API_KEY` ve `ADMIN_*` GEREKMEZ.)
4. **Deploy**'a basın. Siteniz `https://projeadi.vercel.app` adresinde yayında olur.
5. Kendi alan adınız varsa (örn. `cbnplaque.com`): Vercel > **Settings > Domains** bölümünden
   ekleyin ve alan adı sağlayıcınızda Vercel'in verdiği DNS kaydını girin.
6. Appwrite Console > **Settings > Platforms > Add Web App**: yayın adresinizi (örn.
   `cbnplaque.vercel.app` ve/veya `cbnplaque.com`) hostname olarak ekleyin. (Bu adım admin
   girişinin ve fotoğrafların çalışması için ZORUNLU.)
7. Admin paneli: `https://siteniz/admin` — Appwrite'ta oluşturduğunuz e-posta/şifre ile girin.

### Seçenek B — Kendi sunucunuz / VPS (Node.js'li)
Sunucunuzda Node.js 18+ kuruluysa:
```bash
npm install
npm run build
npm start            # uygulamayı 3000 portunda başlatır
```
Sürekli çalışması için **PM2** önerilir:
```bash
npm install -g pm2
pm2 start "npm start" --name cbnplaque
pm2 save
```
Ardından **Nginx** ile alan adınızı 3000 portuna yönlendirin (reverse proxy) ve SSL için
Let's Encrypt kullanın. Environment değişkenlerini sunucuda `.env.local` olarak koyun
(yalnızca `NEXT_PUBLIC_APPWRITE_*` yeterli). Appwrite Platforms'a alan adınızı eklemeyi unutmayın.

### Seçenek C — cPanel / Plesk (Node.js uygulama desteği olan hosting)
Bazı hostingler (örn. cPanel'de "Setup Node.js App") Node uygulaması çalıştırabilir:
1. Dosyaları yükleyin, "Node.js App" oluşturun (Application root = proje klasörü).
2. Çalıştırma komutu olarak önce `npm install` ve `npm run build`, başlangıç dosyası için
   `npm start` kullanın (panelin yönergelerine göre).
3. Environment Variables bölümüne `NEXT_PUBLIC_APPWRITE_*` ekleyin.
4. Appwrite Platforms'a alan adınızı ekleyin.

> Hostinginizin Node.js'i yoksa, en pratik yol Seçenek A (Vercel) ile siteyi yayınlayıp
> kendi alan adınızı (cbnplaque.com) Vercel'e bağlamaktır.

### Admin sayfası nasıl "eklenir"?
Admin ayrı bir uygulama değildir — kod içinde `/admin` rotası olarak gelir. Yapmanız gerekenler:
1. Siteyi yukarıdaki yöntemlerden biriyle yayınlayın.
2. Appwrite'ta bir kullanıcı oluşturun (`npm run setup:appwrite` ile otomatik, ya da Appwrite
   Console > **Auth > Create user**).
3. `https://siteniz/admin` adresine gidip o e-posta/şifre ile giriş yapın. Hepsi bu.

---

## 📁 Structure du projet

```
src/
  app/
    [locale]/            Pages publiques bilingues (FR/TR)
      page.tsx           Accueil
      services/          Services
      realisations/      Galerie + detail [id]
      contact/           Formulaire de contact
    admin/               Panneau d'administration
  components/            Header, Footer, cartes, galerie...
    admin/               Gestionnaires (services, projets, messages, parametres)
  i18n/                  Configuration next-intl
  lib/                   Client Appwrite, types, acces aux donnees
  messages/              Traductions fr.json / tr.json
scripts/
  setup-appwrite.mjs     Script de configuration automatique d'Appwrite
```

## 🎨 Personnalisation rapide
- Couleurs : `tailwind.config.ts` (palette `brand` orange + `ocean` bleu).
- Textes par défaut (services, slogans) : `src/messages/fr.json` et `src/messages/tr.json`.
- Coordonnées (téléphone, e-mail, zone) : modifiables depuis **Admin > Ayarlar / Paramètres**.
