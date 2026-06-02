export const CONSENT_KEY = 'cbn_cookie_consent';
export const CONSENT_EVENT = 'cbn-consent-change';
export const CONSENT_OPEN_EVENT = 'cbn-consent-open';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getConsent(): ConsentStatus {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'accepted' || v === 'rejected') return v;
  return null;
}

export function setConsent(value: 'accepted' | 'rejected'): void {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}

export function openConsentBanner(): void {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** FR mobile → wa.me international format */
export function whatsAppUrl(phone: string, message?: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `33${digits.slice(1)}`;
  else if (!digits.startsWith('33')) digits = `33${digits}`;

  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
