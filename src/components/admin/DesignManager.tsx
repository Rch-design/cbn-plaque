'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { databases, storage, appwriteConfig } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';

/* ── Mevcut ayarları çekme ── */
async function fetchDesignSettings(): Promise<Record<string, string>> {
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.settings
  );
  const map: Record<string, string> = {};
  for (const doc of result.documents) {
    map[doc.key] = doc.value_fr ?? '';
  }
  return map;
}

/* ── Tek ayar kaydetme — document ID döner */
async function saveSetting(key: string, value: string, existingId?: string): Promise<string> {
  if (existingId) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.settings,
      existingId,
      { value_fr: value, value_tr: value }
    );
    return existingId;
  }
  const doc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.settings,
    ID.unique(),
    { key, value_fr: value, value_tr: value },
    [Permission.read(Role.any())]
  );
  return doc.$id;
}

/* ── Tüm ayar ID'lerini çekme (update için gerekli) ── */
async function fetchDocIds(): Promise<Record<string, string>> {
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.settings
  );
  const map: Record<string, string> = {};
  for (const doc of result.documents) {
    map[doc.key] = doc.$id;
  }
  return map;
}

/* ── Google Fonts listesi ── */
const FONTS = [
  { label: 'Sistem (varsayılan)', value: 'system' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Playfair Display (Zarif)', value: 'Playfair Display' },
  { label: 'Merriweather (Gazete)', value: 'Merriweather' }
];

interface Section {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: 'identity', label: 'Kimlik & Logo', icon: '🏷️' },
  { id: 'colors', label: 'Renkler', icon: '🎨' },
  { id: 'hero', label: 'Hero Bölümü', icon: '🖼️' },
  { id: 'typography', label: 'Yazı Tipi', icon: '✍️' },
  { id: 'footer', label: 'Footer', icon: '📌' }
];

/* ── Renk satırı bileşeni ── */
function ColorRow({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border-0 p-0"
          title={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono uppercase focus:border-blue-400 focus:outline-none"
          placeholder="#f97316"
        />
      </div>
    </div>
  );
}

export default function DesignManager() {
  const [activeSection, setActiveSection] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Design state ── */
  const [siteName, setSiteName]           = useState('CBN Plaque');
  const [logoFileId, setLogoFileId]       = useState('');
  const [primary, setPrimary]             = useState('#f97316');
  const [primaryDark, setPrimaryDark]     = useState('#ea580c');
  const [primaryText, setPrimaryText]     = useState('#ffffff');
  const [secondary, setSecondary]         = useState('#3b82f6');
  const [secondaryDark, setSecondaryDark] = useState('#2563eb');
  const [headerBg, setHeaderBg]           = useState('#ffffff');
  const [headerText, setHeaderText]       = useState('#111827');
  const [heroFrom, setHeroFrom]           = useState('#f97316');
  const [heroVia, setHeroVia]             = useState('#ea580c');
  const [heroTo, setHeroTo]               = useState('#3b82f6');
  const [heroTitleFr, setHeroTitleFr]     = useState('');
  const [heroTitleTr, setHeroTitleTr]     = useState('');
  const [heroSubFr, setHeroSubFr]         = useState('');
  const [heroSubTr, setHeroSubTr]         = useState('');
  const [footerBg, setFooterBg]           = useState('#111827');
  const [footerText, setFooterText]       = useState('#d1d5db');
  const [fontName, setFontName]           = useState('system');

  const [docIds, setDocIds] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settings, ids] = await Promise.all([fetchDesignSettings(), fetchDocIds()]);
      setDocIds(ids);
      if (settings.design_primary)       setPrimary(settings.design_primary);
      if (settings.design_primary_dark)  setPrimaryDark(settings.design_primary_dark);
      if (settings.design_primary_text)  setPrimaryText(settings.design_primary_text);
      if (settings.design_secondary)     setSecondary(settings.design_secondary);
      if (settings.design_secondary_dark) setSecondaryDark(settings.design_secondary_dark);
      if (settings.design_header_bg)     setHeaderBg(settings.design_header_bg);
      if (settings.design_header_text)   setHeaderText(settings.design_header_text);
      if (settings.design_hero_from)     setHeroFrom(settings.design_hero_from);
      if (settings.design_hero_via)      setHeroVia(settings.design_hero_via);
      if (settings.design_hero_to)       setHeroTo(settings.design_hero_to);
      if (settings.design_footer_bg)     setFooterBg(settings.design_footer_bg);
      if (settings.design_footer_text)   setFooterText(settings.design_footer_text);
      if (settings.design_font)          setFontName(settings.design_font);
      if (settings.design_logo_file_id)  setLogoFileId(settings.design_logo_file_id);
      if (settings.site_name)            setSiteName(settings.site_name);
      if (settings.design_hero_title_fr) setHeroTitleFr(settings.design_hero_title_fr);
      if (settings.design_hero_title_tr) setHeroTitleTr(settings.design_hero_title_tr);
      if (settings.design_hero_sub_fr)   setHeroSubFr(settings.design_hero_sub_fr);
      if (settings.design_hero_sub_tr)   setHeroSubTr(settings.design_hero_sub_tr);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Logo yükleme ── */
  async function uploadLogo(file: File) {
    setLogoUploading(true);
    try {
      if (logoFileId) {
        try { await storage.deleteFile(appwriteConfig.bucketId, logoFileId); } catch (_) {}
      }
      const uploaded = await storage.createFile(appwriteConfig.bucketId, ID.unique(), file, [
        Permission.read(Role.any())
      ]);
      const newId = uploaded.$id;
      setLogoFileId(newId);
      const docId = await saveSetting('design_logo_file_id', newId, docIds['design_logo_file_id']);
      setDocIds((prev) => ({ ...prev, design_logo_file_id: docId }));
    } catch (e) {
      console.error(e);
      alert('Logo yüklenirken hata oluştu.');
    }
    setLogoUploading(false);
  }

  async function removeLogo() {
    if (!logoFileId) return;
    try {
      await storage.deleteFile(appwriteConfig.bucketId, logoFileId);
      setLogoFileId('');
      await saveSetting('design_logo_file_id', '', docIds['design_logo_file_id']);
    } catch (e) {
      console.error(e);
    }
  }

  /* ── Tüm ayarları kaydet ── */
  async function saveAll() {
    setSaving(true);
    const pairs: Record<string, string> = {
      site_name:              siteName,
      design_primary:         primary,
      design_primary_dark:    primaryDark,
      design_primary_text:    primaryText,
      design_secondary:       secondary,
      design_secondary_dark:  secondaryDark,
      design_header_bg:       headerBg,
      design_header_text:     headerText,
      design_hero_from:       heroFrom,
      design_hero_via:        heroVia,
      design_hero_to:         heroTo,
      design_footer_bg:       footerBg,
      design_footer_text:     footerText,
      design_font:            fontName,
      design_hero_title_fr:   heroTitleFr,
      design_hero_title_tr:   heroTitleTr,
      design_hero_sub_fr:     heroSubFr,
      design_hero_sub_tr:     heroSubTr
    };
    try {
      for (const [key, value] of Object.entries(pairs)) {
        await saveSetting(key, value, docIds[key]);
      }
      const ids = await fetchDocIds();
      setDocIds(ids);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Kaydetme sırasında hata oluştu.');
    }
    setSaving(false);
  }

  const logoPreview = logoFileId
    ? `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${logoFileId}/view?project=${appwriteConfig.projectId}`
    : '';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🎨 Tasarım & Görünüm</h2>
          <p className="text-sm text-gray-500">
            Sitenin renklerini, logosunu, yazı tipini ve içeriğini yönet.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition ${
            saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Kaydediliyor…
            </>
          ) : saved ? (
            <>✅ Kaydedildi</>
          ) : (
            <>💾 Kaydet</>
          )}
        </button>
      </div>

      {/* Ön izleme bandı */}
      <div
        className="flex h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-white shadow"
        style={{ background: `linear-gradient(135deg, ${heroFrom}, ${heroVia}, ${heroTo})` }}
      >
        <span>Hero renk ön izlemesi →</span>
        <div className="flex gap-2">
          <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: primary, color: primaryText }}>
            Buton
          </span>
          <span className="rounded-full px-3 py-1 text-xs bg-white/20">İkincil buton</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sol navigasyon */}
        <div className="lg:col-span-1">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition ${
                  activeSection === s.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sağ içerik */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* KİMLİK & LOGO */}
            {activeSection === 'identity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">🏷️ Site Kimliği & Logo</h3>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Site Adı</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-400 focus:outline-none"
                    placeholder="CBN Plaque"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Logo</label>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
                    {logoPreview ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="h-20 w-auto max-w-[200px] rounded-3xl object-contain border border-gray-200 p-1"
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Değiştir
                          </button>
                          <button
                            onClick={removeLogo}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl">🖼️</div>
                        <p className="mt-2 text-sm text-gray-500">
                          PNG, JPG veya SVG — önerilen boyut 200×200px
                        </p>
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={logoUploading}
                          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {logoUploading ? 'Yükleniyor…' : 'Logo Yükle'}
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLogo(f);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {!logoPreview && (
                    <p className="mt-2 text-xs text-gray-500">
                      Logo yüklenmezse sağ üstte "CBN" harfleri görünür.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* RENKLER */}
            {activeSection === 'colors' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Renk Paleti</h3>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ana Renk (Turuncu / Birincil)</h4>
                  <ColorRow label="Ana renk" value={primary} onChange={setPrimary} hint="Butonlar ve vurgular" />
                  <ColorRow label="Koyu tonu" value={primaryDark} onChange={setPrimaryDark} hint="Hover durumu" />
                  <ColorRow label="Buton yazı rengi" value={primaryText} onChange={setPrimaryText} hint="Genellikle beyaz" />
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">İkincil Renk (Mavi)</h4>
                  <ColorRow label="İkincil renk" value={secondary} onChange={setSecondary} />
                  <ColorRow label="Koyu tonu" value={secondaryDark} onChange={setSecondaryDark} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Header Renkleri</h4>
                  <ColorRow label="Header arka plan" value={headerBg} onChange={setHeaderBg} />
                  <ColorRow label="Header yazı rengi" value={headerText} onChange={setHeaderText} />
                </div>

                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  💡 <strong>İpucu:</strong> Değişiklikleri kaydet ve sayfayı yenile — renkler anında uygulanır.
                </div>
              </div>
            )}

            {/* HERO */}
            {activeSection === 'hero' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">🖼️ Hero Bölümü</h3>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Arkaplan Degradesi</h4>
                  <ColorRow label="Başlangıç rengi" value={heroFrom} onChange={setHeroFrom} hint="Sol / üst" />
                  <ColorRow label="Orta renk" value={heroVia} onChange={setHeroVia} hint="Geçiş tonu" />
                  <ColorRow label="Bitiş rengi" value={heroTo} onChange={setHeroTo} hint="Sağ / alt" />
                  <div
                    className="mt-3 h-16 w-full rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${heroFrom}, ${heroVia}, ${heroTo})` }}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Başlık (Fransızca)
                    </label>
                    <textarea
                      rows={3}
                      value={heroTitleFr}
                      onChange={(e) => setHeroTitleFr(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-400 focus:outline-none resize-none"
                      placeholder="Votre artisan plâtrier-peintre…"
                    />
                    <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız çeviri dosyasındaki metin kullanılır.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Başlık (Türkçe)
                    </label>
                    <textarea
                      rows={3}
                      value={heroTitleTr}
                      onChange={(e) => setHeroTitleTr(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-400 focus:outline-none resize-none"
                      placeholder="Alçıpan ve boya ustanız…"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Alt Başlık (Fransızca)
                    </label>
                    <textarea
                      rows={3}
                      value={heroSubFr}
                      onChange={(e) => setHeroSubFr(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-400 focus:outline-none resize-none"
                      placeholder="Expert en plâtrerie, peinture…"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Alt Başlık (Türkçe)
                    </label>
                    <textarea
                      rows={3}
                      value={heroSubTr}
                      onChange={(e) => setHeroSubTr(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-400 focus:outline-none resize-none"
                      placeholder="Alçıpan, boya, dekorasyon uzmanı…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* YAZI TİPİ */}
            {activeSection === 'typography' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">✍️ Yazı Tipi</h3>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Yazı Tipi Seç</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FONTS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFontName(f.value)}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition ${
                          fontName === f.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-800">{f.label}</span>
                        {fontName === f.value && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Google Fonts kullanılır. Kaydettikten ve sayfayı yeniledikten sonra değişiklik görünür.
                  </p>
                </div>
              </div>
            )}

            {/* FOOTER */}
            {activeSection === 'footer' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">📌 Footer Renkleri</h3>
                <ColorRow label="Footer arka plan" value={footerBg} onChange={setFooterBg} hint="Genellikle koyu renk" />
                <ColorRow label="Footer yazı rengi" value={footerText} onChange={setFooterText} hint="Genellikle açık gri" />
                <div
                  className="mt-4 h-20 w-full rounded-xl flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: footerBg, color: footerText }}
                >
                  © 2023 CBN Plaque — Footer ön izlemesi
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
