'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteConfig, Query } from '@/lib/appwrite';
import type { MessageDoc } from '@/lib/types';

const { databaseId, collections } = appwriteConfig;

export default function MessagesManager() {
  const [items, setItems] = useState<MessageDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, collections.messages, [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]);
      setItems(res.documents as unknown as MessageDoc[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(msg: MessageDoc) {
    try {
      await databases.updateDocument(databaseId, collections.messages, msg.$id, {
        is_read: !msg.is_read
      });
      setItems((list) => list.map((m) => (m.$id === msg.$id ? { ...m, is_read: !m.is_read } : m)));
    } catch {
      alert('Güncellenemedi.');
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu mesajı silmek istiyor musunuz?')) return;
    try {
      await databases.deleteDocument(databaseId, collections.messages, id);
      setItems((list) => list.filter((m) => m.$id !== id));
    } catch {
      alert('Silinemedi.');
    }
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Mesajlar {items.length > 0 && <span className="text-sm font-normal text-gray-500">({items.length})</span>}
      </h2>

      {items.length === 0 && <p className="text-gray-500">Henüz mesaj yok.</p>}

      <div className="space-y-3">
        {items.map((m) => (
          <div
            key={m.$id}
            className={`rounded-xl p-4 shadow-sm ring-1 ${
              m.is_read ? 'bg-white ring-gray-100' : 'bg-brand-50 ring-brand-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {m.name}
                  {!m.is_read && (
                    <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      YENİ
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                  {m.phone && (
                    <>
                      {' · '}
                      <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a>
                    </>
                  )}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(m.$createdAt).toLocaleString('fr-FR')}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-gray-700">{m.body}</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => toggleRead(m)} className="text-sm font-semibold text-ocean-600 hover:underline">
                {m.is_read ? 'Okunmadı işaretle' : 'Okundu işaretle'}
              </button>
              <button onClick={() => remove(m.$id)} className="text-sm font-semibold text-red-600 hover:underline">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
