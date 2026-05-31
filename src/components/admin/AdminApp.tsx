'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { account } from '@/lib/appwrite';
import ServicesManager from './ServicesManager';
import ProjectsManager from './ProjectsManager';
import MessagesManager from './MessagesManager';
import SettingsManager from './SettingsManager';
import PagesManager from './PagesManager';
import DesignManager from './DesignManager';

type Tab = 'projects' | 'services' | 'pages' | 'messages' | 'settings' | 'design';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'projects',  label: 'Referanslar',  icon: '📸' },
  { id: 'services',  label: 'Hizmetler',    icon: '🔧' },
  { id: 'pages',     label: 'Sayfalar',     icon: '📄' },
  { id: 'messages',  label: 'Mesajlar',     icon: '✉️' },
  { id: 'settings',  label: 'Ayarlar',      icon: '⚙️' },
  { id: 'design',    label: 'Tasarım',      icon: '🎨' }
];

export default function AdminApp() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);
  const [email, setEmail]     = useState('');
  const [tab, setTab]         = useState<Tab>('projects');

  useEffect(() => {
    account
      .get()
      .then((u) => { setAuthed(true); setEmail(u.email); })
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    try { await account.deleteSession('current'); } catch { /* ignore */ }
    setAuthed(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={(mail) => { setAuthed(true); setEmail(mail); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 font-black text-white">
              CBN
            </span>
            <span className="font-extrabold text-gray-900">Yönetim Paneli</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{email}</span>
            <a href="/fr" className="text-blue-600 hover:underline">Siteyi gör ↗</a>
            <button
              onClick={handleLogout}
              className="rounded-full bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? t.id === 'design'
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow'
                    : 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === 'projects'  && <ProjectsManager />}
          {tab === 'services'  && <ServicesManager />}
          {tab === 'pages'     && <PagesManager />}
          {tab === 'messages'  && <MessagesManager />}
          {tab === 'settings'  && <SettingsManager />}
          {tab === 'design'    && <DesignManager />}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [error, setError] = useState(false);
  const [busy, setBusy]   = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const mail = String(data.get('email') ?? '');
    const pass = String(data.get('password') ?? '');
    setError(false);
    setBusy(true);
    try {
      await account.createEmailPasswordSession(mail, pass);
      onSuccess(mail);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-blue-600 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 font-black text-white text-sm">
            CBN
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-gray-900">Yönetim Paneli</h1>
          <p className="text-sm text-gray-500">CBN Plaque</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">E-posta</label>
            <input name="email" type="email" required className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Şifre</label>
            <input name="password" type="password" required className="input-field" />
          </div>
          {error && <p className="text-sm font-medium text-red-600">E-posta veya şifre hatalı.</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
