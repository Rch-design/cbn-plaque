'use client';

import { useEffect, useState } from 'react';
import { adminList, adminUpdate, adminDelete } from '@/lib/admin-client';
import type { MessageDoc } from '@/lib/types';

export default function MessagesManager({
  onCountChange
}: {
  onCountChange?: (count: number) => void;
}) {
  const [items, setItems]   = useState<MessageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'unread' | 'read'>('all');

  function updateCount(list: MessageDoc[]) {
    const n = list.filter((m) => !m.is_read).length;
    onCountChange?.(n);
  }

  async function load() {
    setLoading(true);
    try {
      const docs = await adminList<MessageDoc>('messages');
      setItems(docs);
      updateCount(docs);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleRead(msg: MessageDoc) {
    try {
      await adminUpdate('messages', msg.$id, { is_read: !msg.is_read });
      setItems((list) => {
        const updated = list.map((m) => m.$id === msg.$id ? { ...m, is_read: !m.is_read } : m);
        updateCount(updated);
        return updated;
      });
    } catch {
      alert('Güncellenemedi.');
    }
  }

  async function markAllRead() {
    const unread = items.filter((m) => !m.is_read);
    if (!unread.length) return;
    try {
      await Promise.all(
        unread.map((m) => adminUpdate('messages', m.$id, { is_read: true }))
      );
      setItems((list) => {
        const updated = list.map((m) => ({ ...m, is_read: true }));
        updateCount(updated);
        return updated;
      });
    } catch {
      alert('Güncellenemedi.');
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu mesajı silmek istiyor musunuz?')) return;
    try {
      await adminDelete('messages', id);
      setItems((list) => {
        const updated = list.filter((m) => m.$id !== id);
        updateCount(updated);
        return updated;
      });
    } catch {
      alert('Silinemedi.');
    }
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Yükleniyor…</p>;

  const unreadCount = items.filter((m) => !m.is_read).length;
  const filtered = filter === 'unread'
    ? items.filter((m) => !m.is_read)
    : filter === 'read'
      ? items.filter((m) => m.is_read)
      : items;

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">✉️ Mesajlar</h2>
          <p className="text-sm text-gray-500">
            {items.length} mesaj
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount} okunmamış
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ✓ Tümünü okundu işaretle
          </button>
        )}
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {([
          { key: 'all',    label: `Tümü (${items.length})` },
          { key: 'unread', label: `Okunmamış (${unreadCount})` },
          { key: 'read',   label: `Okunmuş (${items.length - unreadCount})` }
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? f.key === 'unread' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <div className="text-4xl">📭</div>
          <p className="mt-2 font-semibold">
            {filter === 'unread' ? 'Okunmamış mesaj yok.' : 'Mesaj yok.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((m) => (
          <div
            key={m.$id}
            className={`rounded-2xl p-4 shadow-sm ring-1 transition ${
              m.is_read
                ? 'bg-white ring-gray-100'
                : 'bg-orange-50 ring-orange-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{m.name}</p>
                  {!m.is_read && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wide">
                      Yeni
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <a href={`mailto:${m.email}`} className="hover:text-blue-600 hover:underline">
                    📧 {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="hover:text-blue-600 hover:underline">
                      📞 {m.phone}
                    </a>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(m.$createdAt).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-gray-700 text-sm leading-relaxed">
              {m.body}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => toggleRead(m)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  m.is_read
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {m.is_read ? '↩ Okunmadı işaretle' : '✓ Okundu işaretle'}
              </button>
              <a
                href={`mailto:${m.email}`}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                ↗ Yanıtla
              </a>
              <button
                onClick={() => remove(m.$id)}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
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
