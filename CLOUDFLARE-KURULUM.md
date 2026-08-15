# Cloudflare Kurulumu (D1 + R2)

Bu dosya, Appwrite'tan Cloudflare'e geçiş için **senin panelde yapman gereken** adımları anlatır.
Kod tarafı hazır; sadece aşağıdaki değerleri üretip `.env.local` ve Vercel'e girmen gerekiyor.

Toplam süre: yaklaşık 15 dakika.

---

## 1. Account ID'yi al

1. https://dash.cloudflare.com adresine gir.
2. Sağ üstten hesabını seç. Adres çubuğundaki URL şuna benzer:
   `https://dash.cloudflare.com/1a2b3c4d5e6f.../home`
3. Oradaki uzun karakter dizisi senin **Account ID**'n.

```
CLOUDFLARE_ACCOUNT_ID=1a2b3c4d5e6f...
```

---

## 2. D1 veritabanını oluştur

1. Sol menü → **Storage & Databases** → **D1 SQL Database**
2. **Create database** → isim: `cbn` → **Create**
3. Açılan sayfada **Database ID** yazıyor, kopyala.

```
CLOUDFLARE_D1_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> Tabloları sen oluşturmayacaksın. `npm run db:setup` komutu `schema.sql` dosyasını
> otomatik uygular.

---

## 3. D1 için API token üret

1. Sağ üst profil menüsü → **My Profile** → **API Tokens**
2. **Create Token** → en alttan **Create Custom Token** → **Get started**
3. İsim: `cbn-site`
4. **Permissions** bölümünde iki satır ekle:
   - `Account` · `D1` · **Edit**
   - `Account` · `Workers R2 Storage` · **Edit**
5. **Account Resources**: `Include` · kendi hesabın
6. **Continue to summary** → **Create Token**
7. Ekranda bir kez gösterilen token'ı kopyala (bir daha gösterilmez).

```
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. R2 bucket oluştur

> R2'nin ilk açılışında Cloudflare bir **ödeme yöntemi** ister. 10 GB depolama ve
> aylık 1 milyon işlem ücretsizdir; bu site o sınırların çok altında kalır, kart
> yalnızca doğrulama içindir.

1. Sol menü → **R2 Object Storage** → ilk kez giriyorsan ödeme yöntemini ekle.
2. **Create bucket** → isim: `cbn-images` → konum: **Automatic** → **Create bucket**

```
R2_BUCKET=cbn-images
```

---

## 5. R2 görsellerini herkese açık yap

İki seçenek var. **B şıkkı önerilir** (kendi alan adın, sınırsız, daha hızlı).

### A) Hızlı yol — r2.dev adresi

1. Bucket → **Settings** → **Public Development URL** → **Enable**
2. Verilen `https://pub-xxxx.r2.dev` adresini kopyala.

```
NEXT_PUBLIC_ASSET_BASE_URL=https://pub-xxxx.r2.dev
```

> Bu adres Cloudflare tarafından hız sınırlıdır, üretim için ideal değildir.

### B) Önerilen — assets.cbnplaque.com

1. `cbnplaque.com` alan adı Cloudflare'de kayıtlı değilse önce sol menüden
   **Add a domain** ile ekle ve alan adı sağlayıcındaki nameserver'ları Cloudflare'inkilerle değiştir.
2. Bucket → **Settings** → **Custom Domains** → **Connect Domain**
3. Alan adı: `assets.cbnplaque.com` → **Continue** → **Connect domain**
4. DNS kaydı otomatik oluşur, birkaç dakikada aktifleşir.

```
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.cbnplaque.com
```

---

## 6. R2 API anahtarları (dosya yükleme için)

1. **R2 Object Storage** ana sayfası → sağ üst **API** → **Manage API Tokens**
2. **Create API Token** → isim: `cbn-upload`
3. Permissions: **Object Read & Write**
4. Specify bucket: `cbn-images`
5. **Create API Token**
6. Ekranda üç değer çıkar:

```
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`Endpoint` satırı `https://<account-id>.r2.cloudflarestorage.com` şeklindedir;
kod bunu `CLOUDFLARE_ACCOUNT_ID` üzerinden kendisi kurar, ayrıca girmene gerek yok.

---

## 7. Admin girişi için gizli anahtar

Oturum çerezini imzalamak için rastgele bir anahtar üret. PowerShell'de:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
ADMIN_SESSION_SECRET=<cikan-64-karakterlik-deger>
ADMIN_EMAIL=cbnplaque@gmail.com
ADMIN_PASSWORD=<guclu-bir-sifre>
```

---

## 8. Appwrite'ı geçici olarak aç

Veri ve görselleri taşımak için Appwrite'ın bir kereliğine ayakta olması gerekiyor.

1. https://cloud.appwrite.io/console → CBN Plaque projesi → **Restore**
2. Aktarım bittikten sonra Appwrite'a bir daha ihtiyaç kalmaz.

---

## 9. Tüm ortam değişkenleri (özet)

`.env.local` dosyana ekle:

```env
# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_API_TOKEN=

# Cloudflare R2
R2_BUCKET=cbn-images
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.cbnplaque.com

# Admin girisi
ADMIN_SESSION_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# E-posta (mevcut, degismiyor)
RESEND_API_KEY=
RESEND_FROM=
CONTACT_NOTIFY_EMAIL=

# Sadece veri aktarimi sirasinda gerekli (sonra silinebilir)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
```

Aynı değerleri Vercel'de de gir:
**Vercel → Proje → Settings → Environment Variables** (Production + Preview).

---

## 10. Sıra ile çalıştırılacak komutlar

```powershell
npm install                # yeni paketler (@aws-sdk/client-s3)
npm run db:setup           # D1'de tablolari olustur
npm run admin:create       # admin kullanicisini ekle
npm run migrate:export     # Appwrite'tan veri + gorselleri indir
npm run migrate:import     # D1'e ve R2'ye yaz
npm run build              # dogrulama
```
