'use client';

import { useEffect, useRef, useState } from 'react';
import {
  databases,
  storage,
  appwriteConfig,
  fileViewUrl,
  ID,
  Query
} from '@/lib/appwrite';
import { Permission, Role } from 'appwrite';
import { CATEGORIES, type Category, type ProjectDoc, type ProjectImageDoc } from '@/lib/types';

const { databaseId, collections, bucketId } = appwriteConfig;

const CAT_LABEL: Record<Category, string> = {
  mur:     'Duvar / Mur',
  plafond: 'Tavan / Plafond',
  comble:  'Çatı Katı / Comble'
};

const CAT_COLOR: Record<Category, string> = {
  mur:     'bg-orange-100 text-orange-700',
  plafond: 'bg-blue-100 text-blue-700',
  comble:  'bg-purple-100 text-purple-700'
};

const emptyForm = (order: number) => ({
  title_fr:   '',
  title_tr:   '',
  desc_fr:    '',
  desc_tr:    '',
  category:   'mur' as Category,
  sort_order: order,
  is_active:  true
});

/* ─────────────────────────────── Ana bileşen ─────────────────────────────── */
export default function ProjectsManager() {
  const [items, setItems]     = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectDoc | 'new' | null>(null);
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.projects, [
        Query.orderAsc('sort_order'),
        Query.limit(100)
      ]);
      setItems(res.documents as unknown as ProjectDoc[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(project: ProjectDoc) {
    if (!confirm('Bu projeyi ve tüm fotoğraflarını silmek istediğinize emin misiniz?')) return;
    try {
      const imgs = await databases.listDocuments(databaseId, collections.projectImages, [
        Query.equal('project_id', project.$id),
        Query.limit(100)
      ]);
      for (const img of imgs.documents as unknown as ProjectImageDoc[]) {
        await safeDeleteFile(img.file_id);
        await databases.deleteDocument(databaseId, collections.projectImages, img.$id);
      }
      await safeDeleteFile(project.cover_file_id);
      await databases.deleteDocument(databaseId, collections.projects, project.$id);
      await load();
    } catch {
      alert('Silinemedi.');
    }
  }

  async function toggleActive(project: ProjectDoc) {
    try {
      await databases.updateDocument(databaseId, collections.projects, project.$id, {
        is_active: !(project.is_active ?? true)
      });
      await load();
    } catch {
      alert('Güncellenemedi.');
    }
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const visibleItems = filtered;
    const a = visibleItems[index - 1];
    const b = visibleItems[index];
    try {
      await Promise.all([
        databases.updateDocument(databaseId, collections.projects, a.$id, { sort_order: b.sort_order }),
        databases.updateDocument(databaseId, collections.projects, b.$id, { sort_order: a.sort_order })
      ]);
      await load();
    } catch { alert('Sıra değiştirilemedi.'); }
  }

  async function moveDown(index: number) {
    const visibleItems = filtered;
    if (index === visibleItems.length - 1) return;
    const a = visibleItems[index];
    const b = visibleItems[index + 1];
    try {
      await Promise.all([
        databases.updateDocument(databaseId, collections.projects, a.$id, { sort_order: b.sort_order }),
        databases.updateDocument(databaseId, collections.projects, b.$id, { sort_order: a.sort_order })
      ]);
      await load();
    } catch { alert('Sıra değiştirilemedi.'); }
  }

  function duplicate(project: ProjectDoc) {
    setEditing({
      ...project,
      $id: 'new',
      $createdAt: '',
      title_fr:   project.title_fr + ' (kopya)',
      title_tr:   project.title_tr + ' (kopya)',
      cover_file_id: '',
      sort_order: items.length,
      is_active:  false
    });
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  if (editing) {
    return (
      <ProjectEditor
        project={editing === 'new' ? null : editing}
        defaultOrder={items.length}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    );
  }

  const filtered = filterCat === 'all'
    ? items
    : items.filter((p) => p.category === filterCat);

  const active  = items.filter((p) => p.is_active !== false).length;
  const passive = items.length - active;

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📸 Referanslar / Projeler</h2>
          <p className="text-sm text-gray-500">
            {items.length} proje · {active} aktif · {passive} pasif
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="btn-primary !px-5 !py-2.5 text-sm"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filterCat === c
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c === 'all' ? 'Tümü' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">📷</div>
          <p className="mt-2 font-semibold">Henüz proje yok.</p>
          <button onClick={() => setEditing('new')} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Projeyi Ekle
          </button>
        </div>
      )}

      {/* Grid liste */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, index) => (
          <div
            key={p.$id}
            className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${
              (p.is_active ?? true) ? 'ring-gray-100' : 'ring-dashed ring-gray-300 opacity-60'
            }`}
          >
            {/* Kapak fotoğrafı */}
            <div className="relative aspect-[4/3] bg-gray-100">
              {p.cover_file_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileViewUrl(p.cover_file_id)}
                  alt={p.title_fr}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              {/* Kategori badge */}
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${CAT_COLOR[p.category]}`}>
                {CAT_LABEL[p.category]}
              </span>
              {/* Pasif badge */}
              {!(p.is_active ?? true) && (
                <span className="absolute right-2 top-2 rounded-full bg-gray-800/70 px-2 py-0.5 text-[10px] font-bold text-white">
                  Pasif
                </span>
              )}
            </div>

            {/* Alt bilgi */}
            <div className="p-3">
              <p className="truncate font-semibold text-gray-900">{p.title_fr}</p>
              {p.title_tr && <p className="truncate text-xs text-gray-400">{p.title_tr}</p>}

              <div className="mt-2 flex items-center justify-between gap-1">
                {/* Sıralama */}
                <div className="flex gap-0.5">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                    title="Yukarı"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === filtered.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                    title="Aşağı"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(p)}
                    title={(p.is_active ?? true) ? 'Pasife al' : 'Aktif yap'}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                  >
                    {(p.is_active ?? true) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => duplicate(p)}
                    title="Çoğalt"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── Yardımcı ─────────────────────────────── */
async function safeDeleteFile(fileId: string) {
  if (!fileId) return;
  try { await storage.deleteFile(bucketId, fileId); } catch { /* ignore */ }
}

/* ─────────────────────────────── Editör ─────────────────────────────── */
function ProjectEditor({
  project,
  defaultOrder,
  onClose,
  onSaved
}: {
  project: ProjectDoc | null;
  defaultOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !project || project.$id === 'new';

  const [form, setForm] = useState({
    title_fr:   project?.title_fr   ?? '',
    title_tr:   project?.title_tr   ?? '',
    desc_fr:    project?.desc_fr    ?? '',
    desc_tr:    project?.desc_tr    ?? '',
    category:   (project?.category  ?? 'mur') as Category,
    sort_order: project?.sort_order ?? defaultOrder,
    is_active:  project?.is_active  ?? true
  });

  const [busy, setBusy]           = useState(false);
  const [progress, setProgress]   = useState('');
  const [coverId, setCoverId]     = useState(isNew ? '' : (project?.cover_file_id ?? ''));
  const [extraImages, setExtraImages] = useState<ProjectImageDoc[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew && project) {
      databases
        .listDocuments(databaseId, collections.projectImages, [
          Query.equal('project_id', project.$id),
          Query.orderAsc('sort_order'),
          Query.limit(100)
        ])
        .then((res) => setExtraImages(res.documents as unknown as ProjectImageDoc[]))
        .catch(() => {});
    }
  }, [project, isNew]);

  async function uploadFiles(projectId: string, files: FileList) {
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
        await databases.createDocument(databaseId, collections.projectImages, ID.unique(), {
          project_id: projectId,
          file_id:    created.$id,
          sort_order: order++
        }, [Permission.read(Role.any())]);
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
      if (isNew) {
        const doc = await databases.createDocument(
          databaseId, collections.projects, ID.unique(),
          { ...form, cover_file_id: '' },
          [Permission.read(Role.any())]
        );
        let cover = '';
        if (files && files.length > 0) {
          cover = await uploadFiles(doc.$id, files);
          await databases.updateDocument(databaseId, collections.projects, doc.$id, { cover_file_id: cover });
        }
      } else {
        let cover = coverId;
        if (files && files.length > 0) {
          cover = await uploadFiles(project!.$id, files);
        }
        await databases.updateDocument(databaseId, collections.projects, project!.$id, {
          ...form,
          cover_file_id: cover
        });
      }
      onSaved();
    } catch {
      alert('Kaydedilemedi. Bağlantı/izin ayarlarını kontrol edin.');
      setBusy(false);
    }
  }

  async function deleteExtra(img: ProjectImageDoc) {
    if (!confirm('Bu fotoğrafı silmek istiyor musunuz?')) return;
    await safeDeleteFile(img.file_id);
    await databases.deleteDocument(databaseId, collections.projectImages, img.$id);
    setExtraImages((list) => list.filter((x) => x.$id !== img.$id));
  }

  async function makeCover(img: ProjectImageDoc) {
    if (!project || isNew) return;
    const oldCover = coverId;
    await databases.updateDocument(databaseId, collections.projects, project.$id, {
      cover_file_id: img.file_id
    });
    await databases.updateDocument(databaseId, collections.projectImages, img.$id, {
      file_id: oldCover || img.file_id
    });
    setCoverId(img.file_id);
    setExtraImages((list) =>
      list.map((x) => (x.$id === img.$id ? { ...x, file_id: oldCover || img.file_id } : x))
    );
  }

  async function removeCover() {
    if (!coverId) return;
    if (!confirm('Kapak fotoğrafını kaldırmak istiyor musunuz?')) return;
    await safeDeleteFile(coverId);
    if (!isNew && project) {
      await databases.updateDocument(databaseId, collections.projects, project.$id, { cover_file_id: '' });
    }
    setCoverId('');
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {isNew ? '+ Yeni Proje Ekle' : '✏️ Projeyi Düzenle'}
        </h2>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
          ← Geri
        </button>
      </div>

      {/* Temel bilgiler */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık — Fransızca 🇫🇷" value={form.title_fr} onChange={(v) => setForm({ ...form, title_fr: v })} placeholder="ex: Rénovation salle de bain" required />
        <Field label="Başlık — Türkçe 🇹🇷"    value={form.title_tr} onChange={(v) => setForm({ ...form, title_tr: v })} placeholder="ör: Banyo yenileme" />
        <TextArea label="Açıklama — Fransızca 🇫🇷" value={form.desc_fr} onChange={(v) => setForm({ ...form, desc_fr: v })} />
        <TextArea label="Açıklama — Türkçe 🇹🇷"    value={form.desc_tr} onChange={(v) => setForm({ ...form, desc_tr: v })} />

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Kategori</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CAT_LABEL[c]}</option>
            ))}
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
      </div>

      {/* Aktif/Pasif */}
      <div className="mt-4">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 w-fit">
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {form.is_active ? '✅ Aktif (sitede görünür)' : '⏸️ Pasif (gizli)'}
          </span>
        </label>
      </div>

      {/* Fotoğraflar */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-gray-700">
          📷 Fotoğraflar
          <span className="ml-2 font-normal text-gray-400 text-xs">
            {coverId ? `Kapak + ${extraImages.length} ek fotoğraf` : 'Henüz fotoğraf yok'}
          </span>
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {/* Kapak */}
          {coverId && (
            <div className="relative overflow-hidden rounded-xl ring-2 ring-blue-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(coverId)} alt="kapak" className="aspect-square w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Kapak
              </span>
              <button
                onClick={removeCover}
                className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Ek fotoğraflar */}
          {extraImages.map((img) => (
            <div key={img.$id} className="relative overflow-hidden rounded-xl ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(img.file_id)} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1.5 py-1 text-[10px] text-white">
                <button onClick={() => makeCover(img)} className="hover:underline">⭐ Kapak</button>
                <button onClick={() => deleteExtra(img)} className="hover:underline text-red-300">✕</button>
              </div>
            </div>
          ))}

          {/* Yükleme kutusu */}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[10px]">Ekle</span>
          </button>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-400">
          Birden fazla fotoğraf seçebilirsiniz. İlk fotoğraf kapak olur. Kaydet'e basınca yüklenir.
        </p>
      </div>

      {progress && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {progress}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={handleSave} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
          {busy ? 'Kaydediliyor…' : '💾 Kaydet'}
        </button>
        <button onClick={onClose} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
          İptal
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Input helpers ─────────────────────────────── */
function Field({
  label, value, onChange, placeholder, required
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field" />
    </div>
  );
}

function TextArea({
  label, value, onChange
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="input-field resize-none" />
    </div>
  );
}
