'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteConfig, ID, Query } from '@/lib/appwrite';
import { Permission, Role } from 'appwrite';
import type { ServiceDoc } from '@/lib/types';
import ServiceIcon, { SERVICE_ICONS } from '@/components/ServiceIcon';

const { databaseId, collections } = appwriteConfig;

const ICON_KEYS = Object.keys(SERVICE_ICONS);

const empty = (): Omit<ServiceDoc, '$id' | '$createdAt' | '$updatedAt'> => ({
  title_fr: '',
  title_tr: '',
  desc_fr: '',
  desc_tr: '',
  icon: 'wall',
  sort_order: 0,
  is_active: true
});

export default function ServicesManager() {
  const [items, setItems]     = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm]       = useState(empty());
  const [busy, setBusy]       = useState(false);
  const [saved, setSaved]     = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.services, [
        Query.orderAsc('sort_order'),
        Query.limit(100)
      ]);
      setItems(res.documents as unknown as ServiceDoc[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing('new');
    setForm({ ...empty(), sort_order: items.length });
    setIconSearch('');
  }

  function startEdit(item: ServiceDoc) {
    setEditing(item.$id);
    setForm({
      title_fr:   item.title_fr,
      title_tr:   item.title_tr,
      desc_fr:    item.desc_fr,
      desc_tr:    item.desc_tr,
      icon:       item.icon,
      sort_order: item.sort_order,
      is_active:  item.is_active ?? true
    });
    setIconSearch('');
  }

  function duplicate(item: ServiceDoc) {
    setEditing('new');
    setForm({
      title_fr:   item.title_fr + ' (kopya)',
      title_tr:   item.title_tr + ' (kopya)',
      desc_fr:    item.desc_fr,
      desc_tr:    item.desc_tr,
      icon:       item.icon,
      sort_order: items.length,
      is_active:  false
    });
  }

  async function save() {
    if (!form.title_fr.trim()) { alert('Fransızca başlık zorunludur.'); return; }
    setBusy(true);
    try {
      if (editing === 'new') {
        await databases.createDocument(
          databaseId, collections.services, ID.unique(), form,
          [Permission.read(Role.any())]
        );
      } else if (editing) {
        await databases.updateDocument(databaseId, collections.services, editing, form);
      }
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch {
      alert('Kaydedilemedi. Bağlantı/izin ayarlarını kontrol edin.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      await databases.deleteDocument(databaseId, collections.services, id);
      await load();
    } catch {
      alert('Silinemedi.');
    }
  }

  async function toggleActive(item: ServiceDoc) {
    try {
      await databases.updateDocument(databaseId, collections.services, item.$id, {
        is_active: !(item.is_active ?? true)
      });
      await load();
    } catch {
      alert('Güncellenemedi.');
    }
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const a = items[index - 1];
    const b = items[index];
    try {
      await Promise.all([
        databases.updateDocument(databaseId, collections.services, a.$id, { sort_order: b.sort_order }),
        databases.updateDocument(databaseId, collections.services, b.$id, { sort_order: a.sort_order })
      ]);
      await load();
    } catch {
      alert('Sıra değiştirilemedi.');
    }
  }

  async function moveDown(index: number) {
    if (index === items.length - 1) return;
    const a = items[index];
    const b = items[index + 1];
    try {
      await Promise.all([
        databases.updateDocument(databaseId, collections.services, a.$id, { sort_order: b.sort_order }),
        databases.updateDocument(databaseId, collections.services, b.$id, { sort_order: a.sort_order })
      ]);
      await load();
    } catch {
      alert('Sıra değiştirilemedi.');
    }
  }

  const filteredIcons = ICON_KEYS.filter((k) =>
    iconSearch === '' ||
    k.includes(iconSearch.toLowerCase()) ||
    SERVICE_ICONS[k].label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🔧 Hizmetler</h2>
          <p className="text-sm text-gray-500">{items.length} hizmet · Aktif olanlar sitede görünür</p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2.5 text-sm">
          + Yeni Hizmet
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200">
          ✅ Hizmet başarıyla kaydedildi.
        </div>
      )}

      {/* Form */}
      {editing && (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
          <h3 className="mb-4 text-base font-bold text-gray-800">
            {editing === 'new' ? '+ Yeni Hizmet Ekle' : '✏️ Hizmeti Düzenle'}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Başlıklar */}
            <Field
              label="Başlık — Fransızca 🇫🇷"
              value={form.title_fr}
              onChange={(v) => setForm({ ...form, title_fr: v })}
              placeholder="ex: Plâtrerie"
              required
            />
            <Field
              label="Başlık — Türkçe 🇹🇷"
              value={form.title_tr}
              onChange={(v) => setForm({ ...form, title_tr: v })}
              placeholder="ör: Alçı işleri"
            />

            {/* Açıklamalar */}
            <TextArea
              label="Açıklama — Fransızca 🇫🇷"
              value={form.desc_fr}
              onChange={(v) => setForm({ ...form, desc_fr: v })}
              placeholder="Description courte du service…"
            />
            <TextArea
              label="Açıklama — Türkçe 🇹🇷"
              value={form.desc_tr}
              onChange={(v) => setForm({ ...form, desc_tr: v })}
              placeholder="Hizmetin kısa açıklaması…"
            />
          </div>

          {/* İkon Seçici */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">İkon Seç</label>
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="İkon ara (boya, alçı, dekor…)"
              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {filteredIcons.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, icon: key })}
                  title={SERVICE_ICONS[key].label}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${
                    form.icon === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ServiceIcon name={key} className="h-7 w-7 text-gray-700" />
                  <span className="text-[10px] text-gray-500 leading-tight text-center">{SERVICE_ICONS[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alt seçenekler */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra No</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="input-field"
                min={0}
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 w-full">
                <div
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.is_active ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {form.is_active ? '✅ Aktif (sitede görünür)' : '⏸️ Pasif (gizli)'}
                </span>
              </label>
            </div>
          </div>

          {/* Ön izleme kartı */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Kart ön izlemesi</p>
            <div className="inline-block rounded-2xl bg-gray-50 p-4 shadow-sm ring-1 ring-gray-100 max-w-xs">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'color-mix(in srgb, var(--c-primary) 12%, #fff)', color: 'var(--c-primary-dark, #ea580c)' }}
              >
                <ServiceIcon name={form.icon} className="h-7 w-7" />
              </div>
              <p className="mt-3 font-bold text-gray-900">{form.title_fr || 'Başlık (FR)'}</p>
              <p className="mt-1 text-sm text-gray-500">{form.desc_fr || 'Açıklama (FR)…'}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
              {busy ? 'Kaydediliyor…' : '💾 Kaydet'}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {items.length === 0 && !editing && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">🔧</div>
          <p className="mt-2 font-semibold">Henüz hizmet eklenmemiş.</p>
          <button onClick={startNew} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Hizmeti Ekle
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.$id}
            className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm transition ${
              (item.is_active ?? true) ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'
            }`}
          >
            {/* İkon */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--c-primary) 10%, #fff)', color: 'var(--c-primary-dark, #ea580c)' }}
            >
              <ServiceIcon name={item.icon} className="h-6 w-6" />
            </div>

            {/* Bilgi */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 truncate">{item.title_fr}</p>
                {item.title_tr && (
                  <span className="text-xs text-gray-400">/ {item.title_tr}</span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    (item.is_active ?? true)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {(item.is_active ?? true) ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">{item.desc_fr}</p>
            </div>

            {/* Sıralama */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                title="Yukarı taşı"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                title="Aşağı taşı"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Aksiyonlar */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleActive(item)}
                title={item.is_active ? 'Pasife al' : 'Aktif yap'}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                {(item.is_active ?? true) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => duplicate(item)}
                title="Çoğalt"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              <button
                onClick={() => startEdit(item)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Düzenle
              </button>
              <button
                onClick={() => remove(item.$id)}
                className="rounded-lg px-2 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, required
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="input-field resize-none"
      />
    </div>
  );
}
