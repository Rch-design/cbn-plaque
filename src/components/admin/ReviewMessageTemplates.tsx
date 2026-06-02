'use client';

import { useState } from 'react';
import { buildReviewRequestMessage } from '@/lib/review-share';

export default function ReviewMessageTemplates({
  googleReviewUrl
}: {
  googleReviewUrl: string;
}) {
  const [copied, setCopied] = useState<'fr' | 'tr' | null>(null);

  const url = googleReviewUrl.trim();
  if (!url) {
    return (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">WhatsApp mesaj şablonları</p>
        <p className="mt-1 text-amber-800">
          Önce yukarıya Google yorum linkini kaydedin (Google Business → Paylaş → « Yorum iste »).
        </p>
      </div>
    );
  }

  const fr = buildReviewRequestMessage('fr', url);
  const tr = buildReviewRequestMessage('tr', url);

  async function copy(text: string, lang: 'fr' | 'tr') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(lang);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="font-semibold text-gray-900">Müşteriye WhatsApp metni (kopyala-yapıştır)</p>
        <p className="mt-1 text-xs text-gray-600">
          İş bitince müşterinin sohbetine yapıştırın. Yorumu müşteri kendi yazmalı — hazır 5 yıldız metni
          göndermeyin.
        </p>
      </div>

      <TemplateBlock
        title="Fransızca (çoğu müşteri)"
        text={fr}
        copied={copied === 'fr'}
        onCopy={() => copy(fr, 'fr')}
      />
      <TemplateBlock
        title="Türkçe (gerekirse)"
        text={tr}
        copied={copied === 'tr'}
        onCopy={() => copy(tr, 'tr')}
      />

      <p className="text-xs text-gray-500">
        Canlı link:{' '}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {url.length > 50 ? `${url.slice(0, 50)}…` : url}
        </a>
      </p>
    </div>
  );
}

function TemplateBlock({
  title,
  text,
  copied,
  onCopy
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-gray-100">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
        >
          {copied ? '✓ Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
        {text}
      </pre>
    </div>
  );
}
