'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteConfig, ID, Query } from '@/lib/appwrite';
import { Permission, Role } from 'appwrite';
import type { ReviewDoc } from '@/lib/types';

const { databaseId, collections } = appwriteConfig;

const empty = (): Omit<ReviewDoc, '$id' | '$createdAt'> => ({
  name:       '',
  rating:     5,
  body:       '',
  source:     'google',
  date_label: '',
  is_active:  true,
  sort_order: 0
});

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="transition"
        >
          <svg
            className={`h-7 w-7 ${i <= (hovered || value) ? 'text-yellow-400' : 'text-gray-200'}`}
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-600">{value}/5</span>
    </div>
  );
}

export default function ReviewsManager() {
  const [items, setItems]     = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm]       = useState(empty());
  const [busy, setBusy]       = useState(false);
  const [saved, setSaved]     = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.reviews, [
        Query.orderAsc('sort_order'), Query.limit(100)
      ]);
      setItems(res.documents as unknown as ReviewDoc[]);
    } catch { setItems([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing('new');
    setForm({ ...empty(), sort_order: items.length });
  }

  function startEdit(item: ReviewDoc) {
    setEditing(item.$id);
    setForm({
      name:       item.name,
      rating:     item.rating,
      body:       item.body ?? '',
      source:     item.source ?? 'google',
      date_label: item.date_label ?? '',
      is_active:  item.is_active ?? true,
      sort_order: item.sort_order
    });
  }

  async function save() {
    if (!form.name.trim()) { alert('İsim zorunludur.'); return; }
    setBusy(true);
    try {
      if (editing === 'new') {
        await databases.createDocument(databaseId, collections.reviews, ID.unique(), form,
          [Permission.read(Role.any())]);
      } else if (editing) {
        await databases.updateDocument(databaseId, collections.reviews, editing, form);
      }
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch { alert('Kaydedilemedi.'); }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm('Bu değerlendirmeyi silmek istediğinize emin misiniz?')) return;
    try {
      await databases.deleteDocument(databaseId, collections.reviews, id);
      await load();
    } catch { alert('Silinemedi.'); }
  }

  async function toggleActive(item: ReviewDoc) {
    try {
      await databases.updateDocument(databaseId, collections.reviews, item.$id, {
        is_active: !(item.is_active ?? true)
      });
      await load();
    } catch { alert('Güncellenemedi.'); }
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const [a, b] = [items[index - 1], items[index]];
    await Promise.all([
      databases.updateDocument(databaseId, collections.reviews, a.$id, { sort_order: b.sort_order }),
      databases.updateDocument(databaseId, collections.reviews, b.$id, { sort_order: a.sort_order })
    ]).catch(() => {});
    await load();
  }

  async function moveDown(index: number) {
    if (index === items.length - 1) return;
    const [a, b] = [items[index], items[index + 1]];
    await Promise.all([
      databases.updateDocument(databaseId, collections.reviews, a.$id, { sort_order: b.sort_order }),
      databases.updateDocument(databaseId, collections.reviews, b.$id, { sort_order: a.sort_order })
    ]).catch(() => {});
    await load();
  }

  const avgRating = items.length
    ? (items.filter(i => i.is_active !== false).reduce((s, r) => s + r.rating, 0) /
       Math.max(1, items.filter(i => i.is_active !== false).length)).toFixed(1)
    : '0';

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">⭐ Değerlendirmeler</h2>
          <p className="text-sm text-gray-500">
            {items.length} yorum · Ortalama {avgRating}/5
            {items.length > 0 && (
              <span className="ml-2">
                {'★'.repeat(Math.round(parseFloat(avgRating)))}
                {'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
              </span>
            )}
          </p>
        </div>
        <button onClick={startNew} className="btn-primary !px-5 !py-2.5 text-sm">
          + Yeni Değerlendirme
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200">
          ✅ Değerlendirme kaydedildi.
        </div>
      )}

      {/* Form */}
      {editing && (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
          <h3 className="mb-5 text-base font-bold text-gray-800">
            {editing === 'new' ? '+ Yeni Değerlendirme' : '✏️ Değerlendirmeyi Düzenle'}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">İsim *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tarih (görünen)</label>
              <input
                value={form.date_label}
                onChange={(e) => setForm({ ...form, date_label: e.target.value })}
                placeholder="mars 2024"
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Puan *</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Yorum metni</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={3}
              placeholder="Très bon travail, je recommande vivement..."
              className="input-field resize-none"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Kaynak</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="input-field"
              >
                <option value="google">Google</option>
                <option value="manual">Manuel</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
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
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-3">
                <div
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {form.is_active ? '✅ Aktif' : '⏸️ Pasif'}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
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
          <div className="text-4xl">⭐</div>
          <p className="mt-2 font-semibold">Henüz değerlendirme eklenmemiş.</p>
          <button onClick={startNew} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Değerlendirmeyi Ekle
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
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-black text-white">
              {item.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Bilgi */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`h-3.5 w-3.5 ${i <= item.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                {item.date_label && <span className="text-xs text-gray-400">{item.date_label}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  (item.is_active ?? true) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {(item.is_active ?? true) ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              {item.body && <p className="text-xs text-gray-400 truncate mt-0.5">"{item.body}"</p>}
            </div>

            {/* Sıralama */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => moveUp(index)} disabled={index === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
              <button onClick={() => moveDown(index)} disabled={index === items.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>

            {/* Aksiyonlar */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(item)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                title={(item.is_active ?? true) ? 'Pasife al' : 'Aktif yap'}>
                {(item.is_active ?? true)
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
              <button onClick={() => startEdit(item)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Düzenle
              </button>
              <button onClick={() => remove(item.$id)}
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
