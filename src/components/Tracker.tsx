'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const key = `tracked_${pathname}`;
    if (sessionStorage.getItem(key)) return;

    const ua = navigator.userAgent.toLowerCase();
    if (/bot|crawler|spider|prerender|lighthouse|headless/.test(ua)) return;

    sessionStorage.setItem(key, '1');
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
