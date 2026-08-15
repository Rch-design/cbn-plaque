'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { adminList, login as apiLogin, logout as apiLogout } from '@/lib/admin-client';
import ServicesManager from './ServicesManager';
import ProjectsManager from './ProjectsManager';
import MessagesManager from './MessagesManager';
import SettingsManager from './SettingsManager';
import PagesManager from './PagesManager';
import DesignManager from './DesignManager';
import ReviewsManager from './ReviewsManager';
import BannersManager from './BannersManager';
import AnalyticsPanel from './AnalyticsPanel';

type Tab = 'projects' | 'services' | 'pages' | 'reviews' | 'banners' | 'messages' | 'settings' | 'design' | 'analytics';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'analytics', label: 'İstatistikler',      icon: '📊' },
  { id: 'projects',  label: 'Referanslar',         icon: '📸' },
  { id: 'services',  label: 'Hizmetler',           icon: '🔧' },
  { id: 'pages',     label: 'Sayfalar',            icon: '📄' },
  { id: 'reviews',   label: 'Değerlendirmeler',    icon: '⭐' },
  { id: 'banners',   label: 'Bannerlar',           icon: '🎯' },
  { id: 'messages',  label: 'Mesajlar',            icon: '✉️' },
  { id: 'settings',  label: 'Ayarlar',             icon: '⚙️' },
  { id: 'design',    label: 'Tasarım',             icon: '🎨' }
];

/** Oturum sunucuda dogrulanir; initialEmail bos ise giris formu gosterilir. */
export default function AdminApp({ initialEmail = '' }: { initialEmail?: string }) {
  const [authed, setAuthed]         = useState(Boolean(initialEmail));
  const [email, setEmail]           = useState(initialEmail);
  const [tab, setTab]               = useState<Tab>('projects');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const messages = await adminList<{ is_read: boolean }>('messages');
      setUnreadCount(messages.filter((m) => !m.is_read).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  // Okunmamış sayısını her 60 saniyede yenile
  useEffect(() => {
    if (!authed) return;
    fetchUnread();
    const timer = setInterval(fetchUnread, 60_000);
    return () => clearInterval(timer);
  }, [authed, fetchUnread]);

  // Mesajlar sekmesine girilince sayıyı güncelle
  useEffect(() => {
    if (tab === 'messages') fetchUnread();
  }, [tab, fetchUnread]);

  async function handleLogout() {
    await apiLogout();
    setAuthed(false);
    setEmail('');
  }

  if (!authed) {
    return <LoginForm onSuccess={(mail) => { setAuthed(true); setEmail(mail); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 font-black text-white text-sm">
              CBN
            </span>
            <span className="font-extrabold text-gray-900">Yönetim Paneli</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{email}</span>
            {unreadCount > 0 && (
              <button
                onClick={() => setTab('messages')}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow animate-pulse hover:bg-red-600 transition"
                title="Okunmamış mesajlar"
              >
                ✉️ {unreadCount} yeni mesaj
              </button>
            )}
            <a href="/" className="text-blue-600 hover:underline">Siteyi gör ↗</a>
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
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? t.id === 'design'
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow'
                    : 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {/* Okunmamış badge */}
              {t.id === 'messages' && unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === 'projects'  && <ProjectsManager />}
          {tab === 'services'  && <ServicesManager />}
          {tab === 'analytics' && <AnalyticsPanel />}
          {tab === 'pages'     && <PagesManager />}
          {tab === 'reviews'   && <ReviewsManager />}
          {tab === 'banners'   && <BannersManager />}
          {tab === 'messages'  && <MessagesManager onCountChange={setUnreadCount} />}
          {tab === 'settings'  && <SettingsManager />}
          {tab === 'design'    && <DesignManager />}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const mail = String(data.get('email') ?? '');
    const pass = String(data.get('password') ?? '');
    setError('');
    setBusy(true);
    try {
      onSuccess(await apiLogin(mail, pass));
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'not_configured'
          ? 'Sunucu ayarlari eksik (ADMIN_SESSION_SECRET / Cloudflare).'
          : 'E-posta veya şifre hatalı.'
      );
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
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
