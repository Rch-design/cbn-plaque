'use client';

import { useEffect, useRef, useState } from 'react';
import { databases, storage, appwriteConfig, ID, Query, fileViewUrl } from '@/lib/appwrite';
import { Permission, Role } from 'appwrite';
import type { ServiceDoc, ServiceImageDoc } from '@/lib/types';
import ServiceIcon, { SERVICE_ICONS } from '@/components/ServiceIcon';

const { databaseId, collections, bucketId } = appwriteConfig;
const ICON_KEYS = Object.keys(SERVICE_ICONS);

/* ─────────────────────────── Liste görünümü ─────────────────────────── */
export default function ServicesManager() {
  const [items, setItems]     = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceDoc | 'new' | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.services, [
        Query.orderAsc('sort_order'), Query.limit(100)
      ]);
      setItems(res.documents as unknown as ServiceDoc[]);
    } catch { setItems([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(s: ServiceDoc) {
    if (!confirm('Bu hizmeti ve fotoğraflarını silmek istiyor musunuz?')) return;
    try {
      // extra images
      const imgs = await databases.listDocuments(databaseId, collections.serviceImages, [
        Query.equal('service_id', s.$id), Query.limit(100)
      ]);
      for (const img of imgs.documents as unknown as ServiceImageDoc[]) {
        await safeDeleteFile(img.file_id);
        await databases.deleteDocument(databaseId, collections.serviceImages, img.$id);
      }
      await safeDeleteFile(s.image_file_id ?? '');
      await databases.deleteDocument(databaseId, collections.services, s.$id);
      await load();
    } catch { alert('Silinemedi.'); }
  }

  async function moveUp(i: number) {
    if (i === 0) return;
    const a = items[i - 1], b = items[i];
    await Promise.all([
      databases.updateDocument(databaseId, collections.services, a.$id, { sort_order: b.sort_order }),
      databases.updateDocument(databaseId, collections.services, b.$id, { sort_order: a.sort_order })
    ]).catch(() => {});
    await load();
  }

  async function moveDown(i: number) {
    if (i === items.length - 1) return;
    const a = items[i], b = items[i + 1];
    await Promise.all([
      databases.updateDocument(databaseId, collections.services, a.$id, { sort_order: b.sort_order }),
      databases.updateDocument(databaseId, collections.services, b.$id, { sort_order: a.sort_order })
    ]).catch(() => {});
    await load();
  }

  async function toggleActive(s: ServiceDoc) {
    await databases.updateDocument(databaseId, collections.services, s.$id, {
      is_active: !(s.is_active ?? true)
    }).catch(() => {});
    await load();
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  if (editing !== null) {
    return (
      <ServiceEditor
        service={editing === 'new' ? null : editing}
        defaultOrder={items.length}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🔧 Hizmetler</h2>
          <p className="text-sm text-gray-500">{items.length} hizmet · Aktif olanlar sitede görünür</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary !px-5 !py-2.5 text-sm">
          + Yeni Hizmet
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">🔧</div>
          <p className="mt-2 font-semibold">Henüz hizmet eklenmemiş.</p>
          <button onClick={() => setEditing('new')} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Hizmeti Ekle
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.$id}
            className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${
              (item.is_active ?? true) ? 'ring-gray-100' : 'opacity-60 ring-dashed ring-gray-300'
            }`}
          >
            {/* Kapak fotoğrafı */}
            <div className="relative aspect-[4/3] bg-gray-100">
              {item.image_file_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileViewUrl(item.image_file_id)} alt={item.title_fr} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"
                  style={{ color: 'var(--c-primary-dark, #ea580c)' }}>
                  <ServiceIcon name={item.icon} className="h-16 w-16 opacity-30" />
                </div>
              )}
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                (item.is_active ?? true) ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {(item.is_active ?? true) ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="p-3">
              <p className="font-semibold text-gray-900 truncate">{item.title_fr}</p>
              <p className="text-xs text-gray-400 truncate">{item.title_tr}</p>

              <div className="mt-3 flex items-center justify-between">
                {/* Sıralama okları */}
                <div className="flex gap-1">
                  <button onClick={() => moveUp(index)} disabled={index === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="Yukarı">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === items.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="Aşağı">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <button onClick={() => toggleActive(item)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100" title="Aktif/Pasif">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {(item.is_active ?? true)
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                {/* Aksiyonlar */}
                <div className="flex gap-2">
                  <button onClick={() => setEditing(item)}
                    className="text-sm font-semibold text-blue-600 hover:underline">Düzenle</button>
                  <button onClick={() => remove(item)}
                    className="text-sm font-semibold text-red-500 hover:underline">Sil</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Editör ─────────────────────────── */
async function safeDeleteFile(fileId: string) {
  if (!fileId) return;
  try { await storage.deleteFile(bucketId, fileId); } catch { /* ignore */ }
}

function ServiceEditor({
  service, defaultOrder, onClose, onSaved
}: {
  service: ServiceDoc | null;
  defaultOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title_fr:   service?.title_fr   ?? '',
    title_tr:   service?.title_tr   ?? '',
    desc_fr:    service?.desc_fr    ?? '',
    desc_tr:    service?.desc_tr    ?? '',
    icon:       service?.icon       ?? 'wall',
    sort_order: service?.sort_order ?? defaultOrder,
    is_active:  service?.is_active  ?? true,
  });

  const [coverId, setCoverId]         = useState(service?.image_file_id ?? '');
  const [extraImages, setExtraImages] = useState<ServiceImageDoc[]>([]);
  const [busy, setBusy]               = useState(false);
  const [progress, setProgress]       = useState('');
  const [iconSearch, setIconSearch]   = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      databases.listDocuments(databaseId, collections.serviceImages, [
        Query.equal('service_id', service.$id),
        Query.orderAsc('sort_order'), Query.limit(100)
      ])
        .then((r) => setExtraImages(r.documents as unknown as ServiceImageDoc[]))
        .catch(() => setExtraImages([]));
    }
  }, [service]);

  async function uploadFiles(serviceId: string, files: FileList) {
    let order = extraImages.length;
    let firstCover = coverId;
    for (let i = 0; i < files.length; i++) {
      setProgress(`Fotoğraf yükleniyor ${i + 1}/${files.length}…`);
      const created = await storage.createFile(bucketId, ID.unique(), files[i], [
        Permission.read(Role.any())
      ]);
      if (!firstCover) {
        firstCover = created.$id;
        setCoverId(created.$id);
      } else {
        await databases.createDocument(databaseId, collections.serviceImages, ID.unique(), {
          service_id: serviceId, file_id: created.$id, sort_order: order++
        }, [Permission.read(Role.any())]);
        setExtraImages((prev) => [...prev, { $id: created.$id + '_tmp', service_id: serviceId, file_id: created.$id, sort_order: order - 1 }]);
      }
    }
    setProgress('');
    return firstCover;
  }

  async function handleSave() {
    if (!form.title_fr.trim()) { alert('Fransızca başlık zorunludur.'); return; }
    setBusy(true);
    try {
      const files = fileInput.current?.files;
      if (!service) {
        const doc = await databases.createDocument(
          databaseId, collections.services, ID.unique(),
          { ...form, image_file_id: '' },
          [Permission.read(Role.any())]
        );
        let cover = '';
        if (files && files.length > 0) {
          cover = await uploadFiles(doc.$id, files);
          await databases.updateDocument(databaseId, collections.services, doc.$id, { image_file_id: cover });
        }
      } else {
        let cover = coverId;
        if (files && files.length > 0) cover = await uploadFiles(service.$id, files);
        await databases.updateDocument(databaseId, collections.services, service.$id, {
          ...form, image_file_id: cover
        });
      }
      onSaved();
    } catch { alert('Kaydedilemedi.'); setBusy(false); }
  }

  async function deleteExtra(img: ServiceImageDoc) {
    if (!confirm('Bu fotoğrafı silmek istiyor musunuz?')) return;
    await safeDeleteFile(img.file_id);
    await databases.deleteDocument(databaseId, collections.serviceImages, img.$id);
    setExtraImages((l) => l.filter((x) => x.$id !== img.$id));
  }

  async function makeCover(img: ServiceImageDoc) {
    if (!service) return;
    const oldCover = coverId;
    await databases.updateDocument(databaseId, collections.services, service.$id, { image_file_id: img.file_id });
    await databases.updateDocument(databaseId, collections.serviceImages, img.$id, { file_id: oldCover || img.file_id });
    setCoverId(img.file_id);
    setExtraImages((l) => l.map((x) => x.$id === img.$id ? { ...x, file_id: oldCover || img.file_id } : x));
  }

  const filteredIcons = ICON_KEYS.filter((k) =>
    iconSearch === '' ||
    k.includes(iconSearch.toLowerCase()) ||
    SERVICE_ICONS[k].label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {service ? '✏️ Hizmeti Düzenle' : '+ Yeni Hizmet'}
        </h2>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
          ← Geri
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık — Fransızca 🇫🇷" value={form.title_fr} onChange={(v) => setForm({ ...form, title_fr: v })} placeholder="ex: Plâtrerie" required />
        <Field label="Başlık — Türkçe 🇹🇷"    value={form.title_tr} onChange={(v) => setForm({ ...form, title_tr: v })} placeholder="ör: Alçı işleri" />
        <TextArea label="Açıklama — Fransızca 🇫🇷" value={form.desc_fr} onChange={(v) => setForm({ ...form, desc_fr: v })} placeholder="Description du service…" />
        <TextArea label="Açıklama — Türkçe 🇹🇷"   value={form.desc_tr} onChange={(v) => setForm({ ...form, desc_tr: v })} placeholder="Hizmetin açıklaması…" />
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra</label>
          <input type="number" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="input-field" min={0} />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 w-full">
            <div
              className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {form.is_active ? '✅ Aktif' : '⏸️ Pasif'}
            </span>
          </label>
        </div>
      </div>

      {/* İkon seçici */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">İkon</label>
        <input type="text" value={iconSearch} onChange={(e) => setIconSearch(e.target.value)}
          placeholder="İkon ara…"
          className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none" />
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {filteredIcons.map((key) => (
            <button key={key} type="button" onClick={() => setForm({ ...form, icon: key })}
              title={SERVICE_ICONS[key].label}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${
                form.icon === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <ServiceIcon name={key} className="h-7 w-7 text-gray-700" />
              <span className="text-[10px] text-gray-400 text-center leading-tight">{SERVICE_ICONS[key].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fotoğraflar */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-gray-700">Fotoğraflar</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {/* Kapak */}
          {coverId && (
            <div className="relative overflow-hidden rounded-lg ring-2 ring-orange-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(coverId)} alt="kapak" className="aspect-square w-full object-cover" />
              <span className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--c-primary, #f97316)' }}>Kapak</span>
              <button
                onClick={async () => {
                  if (!confirm('Kapak fotoğrafını kaldırmak istiyor musunuz?')) return;
                  await safeDeleteFile(coverId);
                  setCoverId('');
                  if (service) await databases.updateDocument(databaseId, collections.services, service.$id, { image_file_id: '' });
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white hover:bg-black/70"
              >✕</button>
            </div>
          )}
          {/* Ekstra */}
          {extraImages.map((img) => (
            <div key={img.$id} className="relative overflow-hidden rounded-lg ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(img.file_id)} alt="foto" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5 text-[10px] text-white">
                <button onClick={() => makeCover(img)} className="hover:underline">Kapak</button>
                <button onClick={() => deleteExtra(img)} className="hover:underline">Sil</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Fotoğraf ekle <span className="font-normal text-gray-400">(birden fazla seçebilirsiniz)</span>
          </label>
          <input ref={fileInput} type="file" accept="image/*" multiple className="block w-full text-sm text-gray-600" />
          <p className="mt-1 text-xs text-gray-400">İlk fotoğraf kapak olur. Kaydet'e basınca yüklenir.</p>
        </div>
      </div>

      {progress && <p className="mt-3 text-sm font-semibold text-blue-600">{progress}</p>}

      <div className="mt-5 flex gap-2">
        <button onClick={handleSave} disabled={busy}
          className="btn-primary !py-2 text-sm disabled:opacity-60">
          {busy ? 'Kaydediliyor…' : '💾 Kaydet'}
        </button>
        <button onClick={onClose}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          İptal
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="input-field" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        rows={3} placeholder={placeholder} className="input-field resize-none" />
    </div>
  );
}
