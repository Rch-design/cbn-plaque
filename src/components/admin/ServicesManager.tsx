'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteConfig, ID, Query } from '@/lib/appwrite';
import type { ServiceDoc } from '@/lib/types';

const { databaseId, collections } = appwriteConfig;
const ICONS = ['wall', 'trowel', 'paint', 'deco', 'insulation', 'default'];

const empty = {
  title_fr: '',
  title_tr: '',
  desc_fr: '',
  desc_tr: '',
  icon: 'wall',
  sort_order: 0
};

export default function ServicesManager() {
  const [items, setItems] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing('new');
    setForm({ ...empty, sort_order: items.length });
  }

  function startEdit(item: ServiceDoc) {
    setEditing(item.$id);
    setForm({
      title_fr: item.title_fr,
      title_tr: item.title_tr,
      desc_fr: item.desc_fr,
      desc_tr: item.desc_tr,
      icon: item.icon,
      sort_order: item.sort_order
    });
  }

  async function save() {
    setBusy(true);
    try {
      if (editing === 'new') {
        await databases.createDocument(databaseId, collections.services, ID.unique(), form);
      } else if (editing) {
        await databases.updateDocument(databaseId, collections.services, editing, form);
      }
      setEditing(null);
      await load();
    } catch (e) {
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

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Hizmetler</h2>
        <button onClick={startNew} className="btn-primary !px-4 !py-2 text-sm">
          + Yeni hizmet
        </button>
      </div>

      {editing && (
        <div className="mb-6 rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Başlık (FR)" value={form.title_fr} onChange={(v) => setForm({ ...form, title_fr: v })} />
            <Field label="Başlık (TR)" value={form.title_tr} onChange={(v) => setForm({ ...form, title_tr: v })} />
            <TextArea label="Açıklama (FR)" value={form.desc_fr} onChange={(v) => setForm({ ...form, desc_fr: v })} />
            <TextArea label="Açıklama (TR)" value={form.desc_tr} onChange={(v) => setForm({ ...form, desc_tr: v })} />
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">İkon</label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input-field"
              >
                {ICONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
              {busy ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-500">Henüz hizmet yok.</p>}
        {items.map((item) => (
          <div
            key={item.$id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
          >
            <div>
              <p className="font-semibold text-gray-900">{item.title_fr}</p>
              <p className="text-sm text-gray-500">{item.title_tr} · {item.icon}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="text-sm font-semibold text-ocean-600 hover:underline">
                Düzenle
              </button>
              <button onClick={() => remove(item.$id)} className="text-sm font-semibold text-red-600 hover:underline">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="input-field resize-none" />
    </div>
  );
}
