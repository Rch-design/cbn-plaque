# CBN Plaque — Site web + Panneau d'administration

Site vitrine bilingue (Français / Türkçe) pour une activité de **pose de plaques de plâtre, plâtrerie, peinture, décoration et isolation**.
Construit avec **Next.js 14 + Tailwind CSS + Cloudflare D1 (base de données) + Cloudflare R2 (photos)**.

> Kurulum rehberi aşağıda hem Türkçe hem Fransızca açıklanmıştır.

---

## 🇹🇷 Türkçe Kurulum (Adım Adım)

### Gerekenler
- [Node.js](https://nodejs.org) 18+ (`node --version` ile kontrol edin)
- Bir [Cloudflare](https://dash.cloudflare.com) hesabı

### 1) Cloudflare tarafını hazırlayın
Panelde yapılacak her adım **[CLOUDFLARE-KURULUM.md](CLOUDFLARE-KURULUM.md)** dosyasında
ekran ekran anlatılıyor: D1 veritabanı, R2 bucket, API token'ları ve görsellerin
yayınlanacağı alan adı. Yaklaşık 15 dakika sürer.

### 2) Ortam değişkenlerini ayarlayın
```powershell
copy .env.local.example .env.local
```
`.env.local` içindeki Cloudflare ve admin değerlerini doldurun (liste kurulum
rehberinin 9. bölümünde).

### 3) Bağımlılıkları kurun
```bash
npm install
```

### 4) Veritabanını ve admin hesabını oluşturun
```bash
npm run db:setup       # schema.sql dosyasindaki 10 tabloyu D1'de olusturur
npm run admin:create   # ADMIN_EMAIL / ADMIN_PASSWORD ile yonetici ekler
```

### 5) Siteyi çalıştırın
```bash
npm run dev
```
- Site: http://localhost:3000 (Fransızca varsayılan, Türkçe için `/tr`)
- Yönetim paneli: http://localhost:3000/admin

### 6) Fotoğraf nasıl eklenir?
1. `/admin` adresinden e-posta + şifre ile giriş yapın.
2. **Referanslar** sekmesi > **+ Yeni proje**.
3. Başlık/açıklamayı (FR ve TR) yazın, kategori seçin.
4. **Fotoğraf ekle** ile birden fazla foto seçin (ilk foto kapak olur).
5. **Kaydet**. Fotoğraflar Cloudflare R2'ye yüklenir ve galeride görünür.

---

## 🇫🇷 Installation (résumé)

```bash
copy .env.local.example .env.local   # voir CLOUDFLARE-KURULUM.md
npm install
npm run db:setup                     # cree les tables dans D1
npm run admin:create                 # cree le compte administrateur
npm run dev                          # http://localhost:3000
```

---

## 🔄 Appwrite'tan veri taşıma (tek seferlik)

Eski Appwrite projesinden veri ve görselleri aktarmak için:

```bash
npm run migrate:export   # Appwrite'tan migration-data/ klasorune indirir
npm run migrate:import   # D1'e ve R2'ye yazar, gorsel referanslarini gunceller
```

Aktarım sırasında Appwrite projesinin **Restore** edilmiş (duraklatılmamış) olması
ve `.env.local` içinde `NEXT_PUBLIC_APPWRITE_PROJECT_ID` ile `APPWRITE_API_KEY`
bulunması gerekir. Aktarım bitince bu iki değişken silinebilir.

---

## 🚀 Yayına Alma (Vercel)

1. Kodu GitHub'a push edin.
2. [vercel.com](https://vercel.com) > **New Project** > repoyu seçin.
3. **Settings > Environment Variables**'a `.env.local` içindeki tüm değişkenleri girin
   (Production + Preview). Appwrite değişkenlerine gerek yoktur.
4. **Deploy**. Siteniz `https://projeadi.vercel.app` adresinde yayında olur.
5. Kendi alan adınız için: Vercel > **Settings > Domains**.
6. Admin paneli: `https://siteniz/admin` — `npm run admin:create` ile belirlediğiniz
   e-posta/şifre ile girin.

Cloudflare D1 ve R2 hareketsizlikte duraklatılmaz; sitenin kendi kendine kapanma
sorunu yoktur. Günlük çalışan `/api/health` cron'u yine de bir arıza olursa
e-posta ile haber verir.

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
    api/
      admin/             CRUD protege par session (D1 + R2)
      auth/              login / logout / session
      contact, track     Ecritures publiques
      health             Controle quotidien
  components/            Header, Footer, cartes, galerie...
    admin/               Gestionnaires (services, projets, messages, parametres)
  i18n/                  Configuration next-intl
  lib/
    d1.ts                Acces Cloudflare D1
    r2.ts                Upload / suppression R2 (signature AWS SigV4)
    assets.ts            assetUrl() — URL publique des images
    data.ts              Lecture du site (avec cache)
    admin-client.ts      Appels du panneau vers /api/admin
scripts/
  d1-setup.mjs           Cree les tables dans D1
  create-admin.mjs       Cree le compte administrateur
  export-appwrite.mjs    Export unique depuis Appwrite
  import-cloudflare.mjs  Import vers D1 + R2
schema.sql               Schema de la base
```

## 🎨 Personnalisation rapide
- Couleurs : `tailwind.config.ts` (palette `brand` orange + `ocean` bleu).
- Textes par défaut (services, slogans) : `src/messages/fr.json` et `src/messages/tr.json`.
- Coordonnées (téléphone, e-mail, zone) : modifiables depuis **Admin > Ayarlar / Paramètres**.
