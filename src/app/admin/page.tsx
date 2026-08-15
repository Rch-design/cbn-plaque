import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminApp from '@/components/admin/AdminApp';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Admin - CBN Plaque',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  return <AdminApp initialEmail={session?.email ?? ''} />;
}
