'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  adminList, adminCreate, adminUpdate, adminDelete,
  uploadFile, deleteFile,
  loadCategories, saveCategories
} from '@/lib/admin-client';
import { assetUrl } from '@/lib/assets';
import { type ProjectDoc, type ProjectImageDoc, type ProjectCategory, DEFAULT_CATEGORIES } from '@/lib/types';
import {
  getCatLabel, getCatColorClass,
  COLOR_OPTIONS, CAT_COLOR_CLASS
} from '@/lib/categories';

type View = 'list' | 'editor' | 'categories';

/* ═══════════════════════════════════════════════════════════ Ana bileşen */
export default function ProjectsManager() {
  const [items, setItems]       = useState<ProjectDoc[]>([]);
  const [cats, setCats]         = useState<ProjectCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<View>('list');
  const [editing, setEditing]   = useState<ProjectDoc | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [projects, loadedCats] = await Promise.all([
      adminList<ProjectDoc>('projects').catch(() => [] as ProjectDoc[]),
      loadCategories()
    ]);
    setItems(projects);
    setCats(loadedCats);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function remove(project: ProjectDoc) {
    if (!confirm('Bu projeyi ve tüm fotoğraflarını silmek istediğinize emin misiniz?')) return;
    try {
      const imgs = (await adminList<ProjectImageDoc>('project-images'))
        .filter((img) => img.project_id === project.$id);
      // project_images satırları ON DELETE CASCADE ile gider; dosyalar elle silinir
      await adminDelete('projects', project.$id);
      for (const img of imgs) {
        await deleteFile(img.file_id);
      }
      await deleteFile(project.cover_file_id);
      await loadAll();
    } catch { alert('Silinemedi.'); }
  }

  async function toggleActive(project: ProjectDoc) {
    try {
      await adminUpdate('projects', project.$id, {
        is_active: !(project.is_active ?? true)
      });
      await loadAll();
    } catch { alert('Güncellenemedi.'); }
  }

  async function moveUp(index: number) {
    const list = filtered;
    if (index === 0) return;
    const [a, b] = [list[index - 1], list[index]];
    await Promise.all([
      adminUpdate('projects', a.$id, { sort_order: b.sort_order }),
      adminUpdate('projects', b.$id, { sort_order: a.sort_order })
    ]).catch(() => alert('Sıra değiştirilemedi.'));
    await loadAll();
  }

  async function moveDown(index: number) {
    const list = filtered;
    if (index === list.length - 1) return;
    const [a, b] = [list[index], list[index + 1]];
    await Promise.all([
      adminUpdate('projects', a.$id, { sort_order: b.sort_order }),
      adminUpdate('projects', b.$id, { sort_order: a.sort_order })
    ]).catch(() => alert('Sıra değiştirilemedi.'));
    await loadAll();
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  if (view === 'editor') {
    return (
      <ProjectEditor
        project={editing}
        defaultOrder={items.length}
        cats={cats}
        onClose={() => { setEditing(null); setView('list'); }}
        onSaved={() => { setEditing(null); setView('list'); loadAll(); }}
      />
    );
  }

  if (view === 'categories') {
    return (
      <CategoryManager
        cats={cats}
        onSaved={(updated) => { setCats(updated); setView('list'); }}
        onClose={() => setView('list')}
      />
    );
  }

  const filtered = filterCat === 'all' ? items : items.filter((p) => p.category === filterCat);
  const active  = items.filter((p) => p.is_active !== false).length;

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📸 Referanslar / Projeler</h2>
          <p className="text-sm text-gray-500">
            {items.length} proje · {active} aktif · {items.length - active} pasif
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('categories')}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            🏷️ Kategoriler
          </button>
          <button
            onClick={() => { setEditing(null); setView('editor'); }}
            className="btn-primary !px-5 !py-2 text-sm"
          >
            + Yeni Proje
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filterCat === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tümü ({items.length})
        </button>
        {cats.map((c) => {
          const count = items.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filterCat === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {c.fr} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">📷</div>
          <p className="mt-2 font-semibold">Henüz proje yok.</p>
          <button onClick={() => { setEditing(null); setView('editor'); }} className="btn-primary mt-4 !px-5 !py-2 text-sm">
            İlk Projeyi Ekle
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, index) => (
          <div
            key={p.$id}
            className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${(p.is_active ?? true) ? 'ring-gray-100' : 'opacity-60 ring-dashed ring-gray-300'}`}
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              {p.cover_file_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(p.cover_file_id)} alt={p.title_fr} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${getCatColorClass(cats, p.category)}`}>
                {getCatLabel(cats, p.category)}
              </span>
              {!(p.is_active ?? true) && (
                <span className="absolute right-2 top-2 rounded-full bg-gray-800/70 px-2 py-0.5 text-[10px] font-bold text-white">Pasif</span>
              )}
            </div>

            <div className="p-3">
              <p className="truncate font-semibold text-gray-900">{p.title_fr}</p>
              {p.title_tr && <p className="truncate text-xs text-gray-400">{p.title_tr}</p>}

              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-0.5">
                  <button onClick={() => moveUp(index)} disabled={index === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="Yukarı">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === filtered.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="Aşağı">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(p)} title={(p.is_active ?? true) ? 'Pasife al' : 'Aktif yap'}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                    {(p.is_active ?? true)
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                  <button onClick={() => { setEditing(p); setView('editor'); }}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">Düzenle</button>
                  <button onClick={() => remove(p)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Sil</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ Kategori Yönetimi */
function CategoryManager({
  cats,
  onSaved,
  onClose
}: {
  cats: ProjectCategory[];
  onSaved: (updated: ProjectCategory[]) => void;
  onClose: () => void;
}) {
  const [list, setList]   = useState<ProjectCategory[]>(cats.map((c) => ({ ...c })));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const newEmpty = (): ProjectCategory => ({
    id: `cat_${Date.now()}`,
    fr: '',
    tr: '',
    color: 'blue'
  });

  function add() { setList((l) => [...l, newEmpty()]); }

  function update(index: number, patch: Partial<ProjectCategory>) {
    setList((l) => l.map((c, i) => i === index ? { ...c, ...patch } : c));
  }

  function remove(index: number) {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?\nBu kategorideki projeler etkilenmez.')) return;
    setList((l) => l.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const l = [...list];
    [l[index - 1], l[index]] = [l[index], l[index - 1]];
    setList(l);
  }

  function moveDown(index: number) {
    if (index === list.length - 1) return;
    const l = [...list];
    [l[index], l[index + 1]] = [l[index + 1], l[index]];
    setList(l);
  }

  async function handleSave() {
    const invalid = list.filter((c) => !c.fr.trim());
    if (invalid.length) { alert('Tüm kategorilerin Fransızca adı zorunludur.'); return; }
    setSaving(true);
    try {
      await saveCategories(list);
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(list); }, 1200);
    } catch { alert('Kaydedilemedi.'); }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🏷️ Kategori Yönetimi</h2>
          <p className="text-sm text-gray-500">Proje kategorilerini ekle, düzenle veya sil.</p>
        </div>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Geri</button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200">
          ✅ Kategoriler kaydedildi.
        </div>
      )}

      <div className="space-y-3">
        {list.map((cat, index) => (
          <div key={cat.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Renk seçici */}
            <div className="flex flex-col gap-1 shrink-0">
              <div className={`h-8 w-8 rounded-lg ${CAT_COLOR_CLASS[cat.color]?.split(' ')[0] ?? 'bg-gray-200'} flex items-center justify-center text-xs font-bold`}>
                {cat.fr.slice(0, 1).toUpperCase() || '?'}
              </div>
              <select
                value={cat.color}
                onChange={(e) => update(index, { color: e.target.value as ProjectCategory['color'] })}
                className="w-20 rounded-lg border border-gray-300 px-1 py-1 text-[11px] focus:outline-none"
              >
                {COLOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* İsimler */}
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-0.5 block text-[11px] font-semibold text-gray-500">Ad — Fransızca 🇫🇷 *</label>
                <input
                  value={cat.fr}
                  onChange={(e) => update(index, { fr: e.target.value })}
                  placeholder="ex: Salle de bain"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] font-semibold text-gray-500">Ad — Türkçe 🇹🇷</label>
                <input
                  value={cat.tr}
                  onChange={(e) => update(index, { tr: e.target.value })}
                  placeholder="ör: Banyo"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Sıralama + Sil */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button onClick={() => moveUp(index)} disabled={index === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
              <button onClick={() => moveDown(index)} disabled={index === list.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <button onClick={() => remove(index)}
                className="rounded-lg p-1 text-red-400 hover:bg-red-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Kategori Ekle */}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
        Yeni Kategori Ekle
      </button>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}>
          {saving ? 'Kaydediliyor…' : saved ? '✅ Kaydedildi' : '💾 Kaydet'}
        </button>
        <button onClick={onClose} className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200">
          İptal
        </button>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
        💡 Kategori silseniz bile mevcut projeler silinmez. Sadece kategori listesinden çıkar.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ Proje Editörü */
function ProjectEditor({
  project,
  defaultOrder,
  cats,
  onClose,
  onSaved
}: {
  project: ProjectDoc | null;
  defaultOrder: number;
  cats: ProjectCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !project;

  const [form, setForm] = useState({
    title_fr:   project?.title_fr   ?? '',
    title_tr:   project?.title_tr   ?? '',
    desc_fr:    project?.desc_fr    ?? '',
    desc_tr:    project?.desc_tr    ?? '',
    category:   project?.category   ?? (cats[0]?.id ?? 'mur'),
    sort_order: project?.sort_order ?? defaultOrder,
    is_active:  project?.is_active  ?? true
  });

  const [busy, setBusy]         = useState(false);
  const [progress, setProgress] = useState('');
  const [coverId, setCoverId]   = useState(project?.cover_file_id ?? '');
  const [extras, setExtras]     = useState<ProjectImageDoc[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew && project) {
      adminList<ProjectImageDoc>('project-images')
        .then((rows) => setExtras(rows.filter((r) => r.project_id === project.$id)))
        .catch(() => {});
    }
  }, [project, isNew]);

  async function uploadFiles(projectId: string, files: FileList) {
    let order = extras.length;
    let firstCover = coverId;
    for (let i = 0; i < files.length; i++) {
      setProgress(`Fotoğraf yükleniyor ${i + 1}/${files.length}…`);
      const key = await uploadFile(files[i], 'projects');
      if (!firstCover) {
        firstCover = key;
        setCoverId(key);
      } else {
        await adminCreate<ProjectImageDoc>('project-images', {
          project_id: projectId, file_id: key, sort_order: order++
        });
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
        const doc = await adminCreate<ProjectDoc>('projects', { ...form, cover_file_id: '' });
        if (files?.length) {
          const cover = await uploadFiles(doc.$id, files);
          await adminUpdate('projects', doc.$id, { cover_file_id: cover });
        }
      } else {
        let cover = coverId;
        if (files?.length) cover = await uploadFiles(project!.$id, files);
        await adminUpdate('projects', project!.$id, {
          ...form, cover_file_id: cover
        });
      }
      onSaved();
    } catch {
      alert('Kaydedilemedi.');
      setBusy(false);
    }
  }

  async function deleteExtra(img: ProjectImageDoc) {
    if (!confirm('Bu fotoğrafı silmek istiyor musunuz?')) return;
    await adminDelete('project-images', img.$id);
    await deleteFile(img.file_id);
    setExtras((l) => l.filter((x) => x.$id !== img.$id));
  }

  async function makeCover(img: ProjectImageDoc) {
    if (isNew) return;
    const oldCover = coverId;
    await adminUpdate('projects', project!.$id, { cover_file_id: img.file_id });
    await adminUpdate('project-images', img.$id, { file_id: oldCover || img.file_id });
    setCoverId(img.file_id);
    setExtras((l) => l.map((x) => x.$id === img.$id ? { ...x, file_id: oldCover || img.file_id } : x));
  }

  async function removeCover() {
    if (!coverId || !confirm('Kapak fotoğrafını kaldırmak istiyor musunuz?')) return;
    if (!isNew) await adminUpdate('projects', project!.$id, { cover_file_id: '' });
    await deleteFile(coverId);
    setCoverId('');
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{isNew ? '+ Yeni Proje Ekle' : '✏️ Projeyi Düzenle'}</h2>
        <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Geri</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık — Fransızca 🇫🇷" value={form.title_fr} onChange={(v) => setForm({ ...form, title_fr: v })} placeholder="ex: Rénovation salle de bain" required />
        <Field label="Başlık — Türkçe 🇹🇷"    value={form.title_tr} onChange={(v) => setForm({ ...form, title_tr: v })} placeholder="ör: Banyo yenileme" />
        <TextArea label="Açıklama — Fransızca 🇫🇷" value={form.desc_fr} onChange={(v) => setForm({ ...form, desc_fr: v })} />
        <TextArea label="Açıklama — Türkçe 🇹🇷"    value={form.desc_tr} onChange={(v) => setForm({ ...form, desc_tr: v })} />

        {/* Kategori */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Kategori</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
          >
            {cats.map((c) => <option key={c.id} value={c.id}>{c.fr}{c.tr && c.tr !== c.fr ? ` / ${c.tr}` : ''}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Sıra No</label>
          <input type="number" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="input-field" min={0} />
        </div>
      </div>

      {/* Aktif/Pasif */}
      <div className="mt-4">
        <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
          <div className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => setForm({ ...form, is_active: !form.is_active })}>
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
          <span className="ml-2 font-normal text-xs text-gray-400">
            {coverId ? `Kapak + ${extras.length} ek fotoğraf` : 'Henüz fotoğraf yok'}
          </span>
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {coverId && (
            <div className="relative overflow-hidden rounded-xl ring-2 ring-blue-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(coverId)} alt="kapak" className="aspect-square w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Kapak</span>
              <button onClick={removeCover} className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white hover:bg-red-700">✕</button>
            </div>
          )}
          {extras.map((img) => (
            <div key={img.$id} className="relative overflow-hidden rounded-xl ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(img.file_id)} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1.5 py-1 text-[10px] text-white">
                <button onClick={() => makeCover(img)} className="hover:underline">⭐ Kapak</button>
                <button onClick={() => deleteExtra(img)} className="text-red-300 hover:underline">✕</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => fileInput.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            <span className="text-[10px]">Ekle</span>
          </button>
        </div>

        <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" />
        <p className="mt-2 text-xs text-gray-400">Birden fazla seçebilirsiniz. İlk fotoğraf kapak olur. Kaydet'e basınca yüklenir.</p>
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

/* ═══════════════════════════════════════════════════════════ Yardımcı */
function Field({ label, value, onChange, placeholder, required }: {
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

function TextArea({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="input-field resize-none" />
    </div>
  );
}
