'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // sessionStorage ile aynı sayfayı bir session içinde bir kez say
    const key = `tracked_${pathname}`;
    if (sessionStorage.getItem(key)) return;

    // Bot filtreleme
    const ua = navigator.userAgent.toLowerCase();
    if (/bot|crawler|spider|prerender|lighthouse|headless/.test(ua)) return;

    sessionStorage.setItem(key, '1');

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname })
    }).catch(() => {});
  }, [pathname]);

  return null;
}
