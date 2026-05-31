'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteConfig, ID, Query } from '@/lib/appwrite';
import type { PageDoc } from '@/lib/types';

const { databaseId, collections } = appwriteConfig;

const empty = {
  slug: '',
  title_fr: '',
  title_tr: '',
  content_fr: '',
  content_tr: '',
  is_published: true,
  sort_order: 0
};

export default function PagesManager() {
  const [items, setItems] = useState<PageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageDoc | 'new' | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.pages, [
        Query.orderAsc('sort_order'),
        Query.limit(100)
      ]);
      setItems(res.documents as unknown as PageDoc[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;
    try {
      await databases.deleteDocument(databaseId, collections.pages, id);
      await load();
    } catch { alert('Silinemedi.'); }
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;

  if (editing) {
    return (
      <PageEditor
        page={editing === 'new' ? null : editing}
        defaultOrder={items.length}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Sayfalar</h2>
        <button onClick={() => setEditing('new')} className="btn-primary !px-4 !py-2 text-sm">
          + Sayfa ekle
        </button>
      </div>

      <p className="mb-4 rounded-xl bg-ocean-50 px-4 py-2 text-sm text-ocean-700">
        Buradan oluşturduğunuz sayfalar sitede <strong>/sayfalar/slug-adi</strong> adresinde görünür.
        Örn: slug = <em>hakkimizda</em> → site.com/hakkimizda
      </p>

      {items.length === 0 && <p className="text-gray-500">Henüz sayfa yok.</p>}

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.$id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{p.title_fr}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              <p className="text-sm text-gray-500">/{p.slug}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/${p.slug}`} target="_blank" className="text-sm font-semibold text-gray-400 hover:text-gray-600">Gör</a>
              <button onClick={() => setEditing(p)} className="text-sm font-semibold text-ocean-600 hover:underline">Düzenle</button>
              <button onClick={() => remove(p.$id)} className="text-sm font-semibold text-red-600 hover:underline">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageEditor({
  page, defaultOrder, onClose, onSaved
}: {
  page: PageDoc | null;
  defaultOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(
    page
      ? { slug: page.slug, title_fr: page.title_fr, title_tr: page.title_tr, content_fr: page.content_fr, content_tr: page.content_tr, is_published: page.is_published, sort_order: page.sort_order }
      : { ...empty, sort_order: defaultOrder }
  );
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.slug || !form.title_fr) { alert('Slug ve Fransızca başlık zorunlu.'); return; }
    const cleanSlug = form.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setBusy(true);
    try {
      const data = { ...form, slug: cleanSlug };
      if (!page) {
        await databases.createDocument(databaseId, collections.pages, ID.unique(), data);
      } else {
        await databases.updateDocument(databaseId, collections.pages, page.$id, data);
      }
      onSaved();
    } catch { alert('Kaydedilemedi.'); setBusy(false); }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{page ? 'Sayfayı düzenle' : 'Yeni sayfa'}</h2>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Geri</button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Slug (URL adresi) <span className="text-red-500">*</span></label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="hakkimizda" className="input-field" />
            <p className="mt-1 text-xs text-gray-400">Sadece harf, rakam ve tire. Örn: hakkimizda, sertifikalar</p>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 rounded" />
              <span className="text-sm font-semibold text-gray-700">Yayınla (sitede görünsün)</span>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Başlık (Fransızca) <span className="text-red-500">*</span></label>
            <input value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Başlık (Türkçe)</label>
            <input value={form.title_tr} onChange={(e) => setForm({ ...form, title_tr: e.target.value })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">İçerik (Fransızca)</label>
          <textarea value={form.content_fr} onChange={(e) => setForm({ ...form, content_fr: e.target.value })} rows={8} className="input-field resize-y font-mono text-sm" placeholder="Sayfa içeriğini buraya yazın..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">İçerik (Türkçe)</label>
          <textarea value={form.content_tr} onChange={(e) => setForm({ ...form, content_tr: e.target.value })} rows={8} className="input-field resize-y font-mono text-sm" placeholder="Sayfa içeriğini buraya yazın..." />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
          {busy ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button onClick={onClose} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">İptal</button>
      </div>
    </div>
  );
}
