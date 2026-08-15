'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      body: String(data.get('message') ?? '').trim()
    };

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = (await res.json()) as { ok?: boolean };

      if (json.ok) {
        setStatus('success');
        form.reset();
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">{t('name')}</label>
          <input name="name" required className="input-field" autoComplete="name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">{t('phone')}</label>
          <input name="phone" type="tel" className="input-field" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">{t('email')}</label>
        <input name="email" type="email" required className="input-field" autoComplete="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">{t('message')}</label>
        <textarea name="message" required rows={5} className="input-field resize-none" />
      </div>

      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60">
        {status === 'sending' ? t('sending') : t('send')}
      </button>

      {status === 'success' && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t('success')}
        </p>
      )}
      {status === 'error' && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{t('error')}</p>
      )}
    </form>
  );
}
