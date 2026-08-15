/**
 * Admin panelinin sunucu uçlarıyla konuşma katmanı.
 *
 * Panel bileşenleri veritabanına doğrudan erişmez; her işlem
 * `/api/admin/*` üzerinden, oturum çerezi ile yapılır.
 */
import type { ProjectCategory, SettingDoc } from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T;

  if (!res.ok || data.ok === false) {
    if (res.status === 401) throw new Error('Oturum sona erdi, tekrar giriş yapın.');
    throw new Error(data.error || `İstek başarısız (${res.status})`);
  }
  return data;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

/* ---------------------------------- CRUD --------------------------------- */

export async function adminList<T>(resource: string): Promise<T[]> {
  const data = await request<{ documents: T[] }>(`/api/admin/${resource}`);
  return data.documents ?? [];
}

export async function adminCreate<T>(
  resource: string,
  values: Record<string, unknown>
): Promise<T> {
  const data = await request<{ document: T }>(`/api/admin/${resource}`, jsonInit('POST', values));
  return data.document;
}

export async function adminUpdate<T>(
  resource: string,
  id: string,
  values: Record<string, unknown>
): Promise<T> {
  const data = await request<{ document: T }>(
    `/api/admin/${resource}/${encodeURIComponent(id)}`,
    jsonInit('PATCH', values)
  );
  return data.document;
}

export async function adminDelete(resource: string, id: string): Promise<void> {
  await request(`/api/admin/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/* --------------------------------- ayarlar -------------------------------- */

export async function loadSettings(): Promise<SettingDoc[]> {
  const data = await request<{ documents: SettingDoc[] }>('/api/admin/settings');
  return data.documents ?? [];
}

export async function saveSetting(
  key: string,
  valueFr: string,
  valueTr = valueFr
): Promise<void> {
  await request('/api/admin/settings', jsonInit('PUT', { key, value_fr: valueFr, value_tr: valueTr }));
}

export async function saveSettings(
  items: { key: string; value_fr: string; value_tr?: string }[]
): Promise<void> {
  await request(
    '/api/admin/settings',
    jsonInit('PUT', {
      items: items.map((i) => ({ ...i, value_tr: i.value_tr ?? i.value_fr }))
    })
  );
}

/* ------------------------------- kategoriler ------------------------------ */

export async function loadCategories(): Promise<ProjectCategory[]> {
  const data = await request<{ categories: ProjectCategory[] }>('/api/admin/categories');
  return data.categories ?? [];
}

export async function saveCategories(categories: ProjectCategory[]): Promise<void> {
  await request('/api/admin/categories', jsonInit('PUT', { categories }));
}

/* --------------------------------- dosya ---------------------------------- */

/** Dosyayı R2'ye yükler ve nesne anahtarını döndürür. */
export async function uploadFile(file: File, folder = 'images'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const data = await request<{ key: string }>('/api/admin/upload', { method: 'POST', body: form });
  return data.key;
}

/** R2'deki nesneyi siler. Hata yutulur: eksik dosya akışı durdurmamalı. */
export async function deleteFile(key?: string): Promise<void> {
  const k = (key ?? '').trim();
  if (!k) return;
  try {
    await request(`/api/admin/upload?key=${encodeURIComponent(k)}`, { method: 'DELETE' });
  } catch {
    // yoksay
  }
}

/* --------------------------------- oturum --------------------------------- */

export async function login(email: string, password: string): Promise<string> {
  const data = await request<{ email: string }>(
    '/api/auth/login',
    jsonInit('POST', { email, password })
  );
  return data.email;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // yoksay
  }
}
