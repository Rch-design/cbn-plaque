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
import { CATEGORIES, type Category, type ProjectDoc, type ProjectImageDoc } from '@/lib/types';

const { databaseId, collections, bucketId } = appwriteConfig;

const CAT_LABEL: Record<Category, string> = {
  mur: 'Duvar (Mur)',
  plafond: 'Tavan (Plafond)',
  comble: 'Çatı katı (Comble)'
};

const empty = {
  title_fr: '',
  title_tr: '',
  desc_fr: '',
  desc_tr: '',
  category: 'mur' as Category,
  sort_order: 0
};

export default function ProjectsManager() {
  const [items, setItems] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectDoc | 'new' | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  async function remove(project: ProjectDoc) {
    if (!confirm('Bu projeyi ve fotoğraflarını silmek istediğinize emin misiniz?')) return;
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

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;

  if (editing) {
    return (
      <ProjectEditor
        project={editing === 'new' ? null : editing}
        defaultOrder={items.length}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Referanslar / Projeler</h2>
        <button onClick={() => setEditing('new')} className="btn-primary !px-4 !py-2 text-sm">
          + Yeni proje
        </button>
      </div>

      {items.length === 0 && <p className="text-gray-500">Henüz proje yok.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.$id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="aspect-[4/3] bg-gray-100">
              {p.cover_file_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileViewUrl(p.cover_file_id)} alt={p.title_fr} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Fotoğraf yok</div>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-gray-900">{p.title_fr}</p>
              <p className="text-xs text-gray-500">{CAT_LABEL[p.category]}</p>
              <div className="mt-2 flex gap-3">
                <button onClick={() => setEditing(p)} className="text-sm font-semibold text-ocean-600 hover:underline">
                  Düzenle
                </button>
                <button onClick={() => remove(p)} className="text-sm font-semibold text-red-600 hover:underline">
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function safeDeleteFile(fileId: string) {
  if (!fileId) return;
  try {
    await storage.deleteFile(bucketId, fileId);
  } catch {
    // ignore missing files
  }
}

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
  const [form, setForm] = useState(
    project
      ? {
          title_fr: project.title_fr,
          title_tr: project.title_tr,
          desc_fr: project.desc_fr,
          desc_tr: project.desc_tr,
          category: project.category,
          sort_order: project.sort_order
        }
      : { ...empty, sort_order: defaultOrder }
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const [coverId, setCoverId] = useState(project?.cover_file_id ?? '');
  const [extraImages, setExtraImages] = useState<ProjectImageDoc[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      databases
        .listDocuments(databaseId, collections.projectImages, [
          Query.equal('project_id', project.$id),
          Query.orderAsc('sort_order'),
          Query.limit(100)
        ])
        .then((res) => setExtraImages(res.documents as unknown as ProjectImageDoc[]))
        .catch(() => setExtraImages([]));
    }
  }, [project]);

  async function uploadFiles(projectId: string, files: FileList) {
    let order = extraImages.length;
    let firstCover = coverId;
    for (let i = 0; i < files.length; i++) {
      setProgress(`Fotoğraf yükleniyor ${i + 1}/${files.length}...`);
      const created = await storage.createFile(bucketId, ID.unique(), files[i]);
      if (!firstCover) {
        firstCover = created.$id;
        setCoverId(created.$id);
      } else {
        await databases.createDocument(databaseId, collections.projectImages, ID.unique(), {
          project_id: projectId,
          file_id: created.$id,
          sort_order: order++
        });
      }
    }
    setProgress('');
    return firstCover;
  }

  async function handleSave() {
    setBusy(true);
    try {
      const files = fileInput.current?.files;
      if (!project) {
        const doc = await databases.createDocument(databaseId, collections.projects, ID.unique(), {
          ...form,
          cover_file_id: ''
        });
        let cover = '';
        if (files && files.length > 0) {
          cover = await uploadFiles(doc.$id, files);
          await databases.updateDocument(databaseId, collections.projects, doc.$id, {
            cover_file_id: cover
          });
        }
      } else {
        let cover = coverId;
        if (files && files.length > 0) {
          cover = await uploadFiles(project.$id, files);
        }
        await databases.updateDocument(databaseId, collections.projects, project.$id, {
          ...form,
          cover_file_id: cover
        });
      }
      onSaved();
    } catch (e) {
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
    if (!project) return;
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

  return (
    <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{project ? 'Projeyi düzenle' : 'Yeni proje'}</h2>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
          ← Geri
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık (FR)" value={form.title_fr} onChange={(v) => setForm({ ...form, title_fr: v })} />
        <Field label="Başlık (TR)" value={form.title_tr} onChange={(v) => setForm({ ...form, title_tr: v })} />
        <TextArea label="Açıklama (FR)" value={form.desc_fr} onChange={(v) => setForm({ ...form, desc_fr: v })} />
        <TextArea label="Açıklama (TR)" value={form.desc_tr} onChange={(v) => setForm({ ...form, desc_tr: v })} />
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
          <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>

      {/* Mevcut fotoğraflar */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-gray-700">Fotoğraflar</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {coverId && (
            <div className="relative overflow-hidden rounded-lg ring-2 ring-brand-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(coverId)} alt="kapak" className="aspect-square w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Kapak
              </span>
            </div>
          )}
          {extraImages.map((img) => (
            <div key={img.$id} className="relative overflow-hidden rounded-lg ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileViewUrl(img.file_id)} alt="foto" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5 text-[10px] text-white">
                <button onClick={() => makeCover(img)} className="hover:underline">Kapak yap</button>
                <button onClick={() => deleteExtra(img)} className="hover:underline">Sil</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Fotoğraf ekle (birden fazla seçebilirsiniz)
          </label>
          <input ref={fileInput} type="file" accept="image/*" multiple className="block w-full text-sm" />
          <p className="mt-1 text-xs text-gray-400">
            İlk fotoğraf kapak olur. Kaydet'e basınca yüklenir.
          </p>
        </div>
      </div>

      {progress && <p className="mt-3 text-sm font-medium text-ocean-600">{progress}</p>}

      <div className="mt-5 flex gap-2">
        <button onClick={handleSave} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
          {busy ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button onClick={onClose} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          İptal
        </button>
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
