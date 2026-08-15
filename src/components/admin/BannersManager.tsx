'use client';

import { useEffect, useRef, useState } from 'react';
import {
  adminList, adminCreate, adminUpdate, adminDelete, uploadFile, deleteFile
} from '@/lib/admin-client';
import { assetUrl } from '@/lib/assets';

interface BannerDoc {
  $id: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  bg_color?: string;
  text_color?: string;
  image_file_id?: string;
  pages?: string;
  is_active: boolean;
  sort_order: number;
}

const PRESET_COLORS = [
  { label: 'Mavi',   bg: '#1e40af', text: '#ffffff' },
  { label: 'Turuncu',bg: '#ea580c', text: '#ffffff' },
  { label: 'Yeşil',  bg: '#15803d', text: '#ffffff' },
  { label: 'Mor',    bg: '#7e22ce', text: '#ffffff' },
  { label: 'Siyah',  bg: '#111827', text: '#ffffff' },
  { label: 'Açık',   bg: '#f0f9ff', text: '#1e3a5f' },
];

const empty = (): Omit<BannerDoc, '$id'> => ({
  title:         '',
  subtitle:      '',
  cta_text:      '',
  cta_link:      '',
  bg_color:      '#1e40af',
  text_color:    '#ffffff',
  image_file_id: '',
  pages:         'all',
  is_active:     true,
  sort_order:    0
});

export default function BannersManager() {
  const [items,   setItems]   = useState<BannerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form,    setForm]    = useState(empty());
  const [busy,    setBusy]    = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [upload,  setUpload]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await adminList<BannerDoc>('banners'));
    } catch { setItems([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing('new');
    setForm({ ...empty(), sort_order: items.length });
  }

  function startEdit(item: BannerDoc) {
    setEditing(item.$id);
    setForm({ title: item.title, subtitle: item.subtitle ?? '', cta_text: item.cta_text ?? '',
      cta_link: item.cta_link ?? '', bg_color: item.bg_color ?? '#1e40af',
      text_color: item.text_color ?? '#ffffff', image_file_id: item.image_file_id ?? '',
      pages: item.pages ?? 'all', is_active: item.is_active ?? true, sort_order: item.sort_order });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpload('Yükleniyor…');
    try {
      const key = await uploadFile(file, 'banners');
      setForm(prev => ({ ...prev, image_file_id: key }));
      setUpload('✅ Yüklendi');
    } catch { setUpload('❌ Hata'); }
    setTimeout(() => setUpload(''), 2000);
  }

  async function removeImage(fileId: string) {
    setForm(prev => ({ ...prev, image_file_id: '' }));
    await deleteFile(fileId);
  }

  async function save() {
    if (!form.title.trim()) { alert('Başlık zorunludur.'); return; }
    setBusy(true);
    try {
      if (editing === 'new') {
        await adminCreate('banners', { ...form });
      } else if (editing) {
        await adminUpdate('banners', editing, { ...form });
      }
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Kaydedilemedi.'); }
    setBusy(false);
  }

  async function remove(id: string, imgId?: string) {
    if (!confirm('Banner silinsin mi?')) return;
    await adminDelete('banners', id).catch(() => {});
    if (imgId) await deleteFile(imgId);
    await load();
  }

  async function toggleActive(item: BannerDoc) {
    await adminUpdate('banners', item.$id, {
      is_active: !item.is_active
    }).catch(() => {});
    await load();
  }

  async function move(index: number, dir: -1 | 1) {
    const nb = index + dir;
    if (nb < 0 || nb >= items.length) return;
    const [a, b] = [items[index], items[nb]];
    await Promise.all([
      adminUpdate('banners', a.$id, { sort_order: b.sort_order }),
      adminUpdate('banners', b.$id, { sort_order: a.sort_order })
    ]).catch(() => {});
    await load();
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🎯 Reklam Bannerları</h2>
          <p className="text-sm text-gray-500">Sitenin tüm sayfalarında görünen duyuru / reklam şeritleri</p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2.5 text-sm">
          + Yeni Banner
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200">
          ✅ Banner kaydedildi.
        </div>
      )}

      {/* Form */}
      {editing && (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md space-y-5">
          <h3 className="text-base font-bold text-gray-800">
            {editing === 'new' ? '+ Yeni Banner' : '✏️ Banner Düzenle'}
          </h3>

          {/* Önizleme */}
          <div
            className="flex min-h-[80px] items-center justify-between gap-4 rounded-xl px-6 py-4 shadow"
            style={{ backgroundColor: form.bg_color ?? '#1e40af', color: form.text_color ?? '#fff' }}
          >
            <div>
              {form.image_file_id && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(form.image_file_id)} alt="" className="mb-2 h-12 w-12 rounded-full object-cover" />
              )}
              <p className="font-extrabold text-lg leading-tight">{form.title || 'Banner Başlığı'}</p>
              {form.subtitle && <p className="text-sm opacity-80 mt-0.5">{form.subtitle}</p>}
            </div>
            {form.cta_text && (
              <span className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold"
                style={{ borderColor: form.text_color, color: form.text_color }}>
                {form.cta_text}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Başlık *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ücretsiz Keşif!" className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Alt Başlık</label>
              <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Haziran ayı özel fiyatları" className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Buton Yazısı</label>
              <input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })}
                placeholder="Teklif Al" className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Buton Linki</label>
              <input value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })}
                placeholder="/contact" className="input-field" />
            </div>
          </div>

          {/* Renkler */}
          <div>
            <label className="label-text mb-2 block">Renk Teması</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map(p => (
                <button key={p.bg} type="button" title={p.label}
                  onClick={() => setForm({ ...form, bg_color: p.bg, text_color: p.text })}
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${form.bg_color === p.bg ? 'ring-blue-500' : 'ring-transparent'}`}
                  style={{ backgroundColor: p.bg }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Arkaplan</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bg_color} onChange={e => setForm({ ...form, bg_color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5" />
                  <input value={form.bg_color} onChange={e => setForm({ ...form, bg_color: e.target.value })}
                    className="input-field !py-1.5 w-28 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Metin</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.text_color} onChange={e => setForm({ ...form, text_color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5" />
                  <input value={form.text_color} onChange={e => setForm({ ...form, text_color: e.target.value })}
                    className="input-field !py-1.5 w-28 font-mono text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Görsel */}
          <div>
            <label className="label-text mb-2 block">Görsel (opsiyonel)</label>
            {form.image_file_id ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(form.image_file_id)} alt="" className="h-16 w-24 rounded-xl object-cover ring-1 ring-gray-200" />
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Değiştir</button>
                  <button type="button" onClick={() => removeImage(form.image_file_id!)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Kaldır</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-5 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                📷 Görsel Yükle
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {upload && <p className="mt-1 text-xs text-blue-600">{upload}</p>}
          </div>

          {/* Sayfa seçimi + aktif */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Hangi Sayfalar</label>
              <select value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })}
                className="input-field">
                <option value="all">Tüm Sayfalar</option>
                <option value="home">Sadece Anasayfa</option>
                <option value="services">Sadece Hizmetler</option>
                <option value="realisations">Sadece Referanslar</option>
                <option value="contact">Sadece İletişim</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra No</label>
              <input type="number" value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="input-field" min={0} />
            </div>
            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-3">
                <div className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {form.is_active ? '✅ Aktif' : '⏸️ Pasif'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
              {busy ? 'Kaydediliyor…' : '💾 Kaydet'}
            </button>
            <button onClick={() => setEditing(null)}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {items.length === 0 && !editing && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">🎯</div>
          <p className="mt-2 font-semibold">Henüz banner eklenmemiş.</p>
          <button onClick={startNew} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Banner'ı Ekle
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.$id}
            className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm ${item.is_active ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'}`}>
            {/* Renk önizleme */}
            <div className="h-10 w-16 shrink-0 rounded-lg shadow-sm"
              style={{ backgroundColor: item.bg_color ?? '#1e40af' }} />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.title}</p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {item.subtitle && <span className="text-xs text-gray-400 truncate max-w-[200px]">{item.subtitle}</span>}
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{item.pages === 'all' ? 'Tüm sayfalar' : item.pages}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => move(index, -1)} disabled={index === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button onClick={() => move(index, 1)} disabled={index === items.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(item)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                {item.is_active
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
              <button onClick={() => startEdit(item)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Düzenle
              </button>
              <button onClick={() => remove(item.$id, item.image_file_id)}
                className="rounded-lg px-2 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
