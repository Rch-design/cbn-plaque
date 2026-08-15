'use client';

import { useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '@/lib/admin-client';
import type { SettingDoc } from '@/lib/types';
import ReviewMessageTemplates from '@/components/admin/ReviewMessageTemplates';

const KEYS: {
  key: string;
  label: string;
  bilingual: boolean;
  hint?: string;
  inputType?: string;
}[] = [
  { key: 'phone', label: 'Telefon', bilingual: false },
  { key: 'email', label: 'E-posta', bilingual: false },
  { key: 'zone', label: 'Hizmet bölgesi', bilingual: true },
  {
    key: 'google_review_url',
    label: 'Google yorum linki',
    bilingual: false,
    hint: 'Google Business → Paylaş → « Yorum iste » linkini yapıştırın',
    inputType: 'url'
  }
];

export default function SettingsManager() {
  const [values, setValues] = useState<Record<string, { fr: string; tr: string }>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const map: Record<string, SettingDoc> = {};
      for (const d of await loadSettings()) map[d.key] = d;
      const v: Record<string, { fr: string; tr: string }> = {};
      for (const k of KEYS) {
        v[k.key] = { fr: map[k.key]?.value_fr ?? '', tr: map[k.key]?.value_tr ?? '' };
      }
      setValues(v);
    } catch {
      setValues({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveAll() {
    setBusy(true);
    setSaved(false);
    try {
      await saveSettings(
        KEYS.map((k) => {
          const v = values[k.key];
          return {
            key: k.key,
            value_fr: v.fr,
            value_tr: k.bilingual ? v.tr : v.fr
          };
        })
      );
      setSaved(true);
      await load();
    } catch {
      alert('Kaydedilemedi. Bağlantı/izin ayarlarını kontrol edin.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Site ayarları</h2>
      <div className="space-y-5 rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200">
        {KEYS.map((k) => (
          <div key={k.key}>
            <label className="mb-1 block text-sm font-semibold text-gray-700">{k.label}</label>
            {k.hint && <p className="mb-2 text-xs text-gray-500">{k.hint}</p>}
            {k.bilingual ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Fransızca"
                  value={values[k.key]?.fr ?? ''}
                  onChange={(e) =>
                    setValues({ ...values, [k.key]: { ...values[k.key], fr: e.target.value } })
                  }
                  className="input-field"
                />
                <input
                  placeholder="Türkçe"
                  value={values[k.key]?.tr ?? ''}
                  onChange={(e) =>
                    setValues({ ...values, [k.key]: { ...values[k.key], tr: e.target.value } })
                  }
                  className="input-field"
                />
              </div>
            ) : (
              <input
                type={k.inputType ?? 'text'}
                value={values[k.key]?.fr ?? ''}
                onChange={(e) =>
                  setValues({ ...values, [k.key]: { fr: e.target.value, tr: e.target.value } })
                }
                className="input-field"
                placeholder={k.key === 'google_review_url' ? 'https://g.page/r/...' : undefined}
              />
            )}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button onClick={saveAll} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
            {busy ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {saved && <span className="text-sm font-medium text-green-600">Kaydedildi ✓</span>}
        </div>

        <ReviewMessageTemplates googleReviewUrl={values.google_review_url?.fr ?? ''} />
      </div>
    </div>
  );
}
