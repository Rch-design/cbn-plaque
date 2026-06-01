import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query, ID } from 'node-appwrite';

/**
 * Optional server-side tracking (requires APPWRITE_API_KEY on Vercel).
 * Public site uses Appwrite client SDK directly — see src/lib/analytics.ts
 */
const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT    ?? 'https://cloud.appwrite.io/v1';
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID  ?? '';
const apiKey     = process.env.APPWRITE_API_KEY                 ?? '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main';
const colId      = process.env.NEXT_PUBLIC_APPWRITE_COL_ANALYTICS ?? 'analytics';

function getServerClient() {
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return new Databases(client);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const { page } = await req.json() as { page?: string };
    if (!page || !projectId || !apiKey) {
      return NextResponse.json(
        { ok: false, hint: 'Use client-side tracking or set APPWRITE_API_KEY' },
        { status: 400 }
      );
    }

    const db   = getServerClient();
    const date = today();
    const slug = page.slice(0, 200) || '/';

    const existing = await db.listDocuments(databaseId, colId, [
      Query.equal('date', date),
      Query.equal('page', slug),
      Query.limit(1)
    ]);

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      await db.updateDocument(databaseId, colId, doc.$id, {
        views: (doc.views as number) + 1
      });
    } else {
      await db.createDocument(databaseId, colId, ID.unique(), {
        date,
        page: slug,
        views: 1
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!projectId || !apiKey) return NextResponse.json({ rows: [] });

    const db = getServerClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString().slice(0, 10);

    const res = await db.listDocuments(databaseId, colId, [
      Query.greaterThanEqual('date', since),
      Query.orderDesc('date'),
      Query.limit(500)
    ]);

    return NextResponse.json({ rows: res.documents });
  } catch (e) {
    return NextResponse.json({ rows: [], error: String(e) });
  }
}
