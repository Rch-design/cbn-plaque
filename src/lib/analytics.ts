import { databases, appwriteConfig, ID, Query, Permission, Role } from '@/lib/appwrite';

const { databaseId, collections } = appwriteConfig;
const COL = collections.analytics;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Public site: record one page view (no API key required). */
export async function trackPageView(pathname: string): Promise<void> {
  const date = today();
  const page = (pathname || '/').slice(0, 200);

  try {
    const existing = await databases.listDocuments(databaseId, COL, [
      Query.equal('date', date),
      Query.equal('page', page),
      Query.limit(1)
    ]);

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      const views = typeof doc.views === 'number' ? doc.views : 0;
      await databases.updateDocument(databaseId, COL, doc.$id, { views: views + 1 });
      return;
    }

    await databases.createDocument(
      databaseId,
      COL,
      ID.unique(),
      { date, page, views: 1 },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any())
      ]
    );
  } catch {
    // silent — tracking must not break the site
  }
}

export interface AnalyticsRow {
  $id: string;
  date: string;
  page: string;
  views: number;
}

/** Admin / public read (collection allows Role.any() read). */
export async function fetchAnalyticsRows(days = 30): Promise<AnalyticsRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  try {
    const res = await databases.listDocuments(databaseId, COL, [
      Query.greaterThanEqual('date', sinceStr),
      Query.orderDesc('date'),
      Query.limit(500)
    ]);
    return res.documents as unknown as AnalyticsRow[];
  } catch {
    return [];
  }
}
