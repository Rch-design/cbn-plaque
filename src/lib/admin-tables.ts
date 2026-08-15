/**
 * `/api/admin/[resource]` uçlarının çalıştığı tablo kayıt defteri.
 *
 * Sütunlar burada açıkça sayılır: istemciden gelen gövde bu listeye göre
 * süzülür, böylece SQL'e yalnızca bilinen alan adları girer.
 */

export type ColumnType = 'text' | 'int' | 'bool';

export interface TableSpec {
  table: string;
  /** Yazılabilir sütunlar (id ve created_at hariç). */
  columns: Record<string, ColumnType>;
  orderBy: string;
  limit: number;
  /** Güncellemede updated_at sütunu var mı? */
  touchUpdatedAt?: boolean;
}

export const ADMIN_TABLES: Record<string, TableSpec> = {
  services: {
    table: 'services',
    columns: {
      title_fr: 'text', title_tr: 'text', desc_fr: 'text', desc_tr: 'text',
      icon: 'text', image_file_id: 'text', sort_order: 'int', is_active: 'bool'
    },
    orderBy: 'sort_order ASC',
    limit: 200,
    touchUpdatedAt: true
  },
  projects: {
    table: 'projects',
    columns: {
      title_fr: 'text', title_tr: 'text', desc_fr: 'text', desc_tr: 'text',
      category: 'text', cover_file_id: 'text', sort_order: 'int', is_active: 'bool'
    },
    orderBy: 'sort_order ASC',
    limit: 500,
    touchUpdatedAt: true
  },
  'project-images': {
    table: 'project_images',
    columns: { project_id: 'text', file_id: 'text', sort_order: 'int' },
    orderBy: 'sort_order ASC',
    limit: 500
  },
  messages: {
    table: 'messages',
    columns: { name: 'text', email: 'text', phone: 'text', body: 'text', is_read: 'bool' },
    orderBy: 'created_at DESC',
    limit: 500
  },
  pages: {
    table: 'pages',
    columns: {
      slug: 'text', title_fr: 'text', title_tr: 'text',
      content_fr: 'text', content_tr: 'text', is_published: 'bool', sort_order: 'int'
    },
    orderBy: 'sort_order ASC',
    limit: 200,
    touchUpdatedAt: true
  },
  reviews: {
    table: 'reviews',
    columns: {
      name: 'text', rating: 'int', body: 'text', source: 'text',
      date_label: 'text', is_active: 'bool', sort_order: 'int'
    },
    orderBy: 'sort_order ASC',
    limit: 500
  },
  banners: {
    table: 'banners',
    columns: {
      title: 'text', subtitle: 'text', cta_text: 'text', cta_link: 'text',
      bg_color: 'text', text_color: 'text', image_file_id: 'text',
      pages: 'text', is_active: 'bool', sort_order: 'int'
    },
    orderBy: 'sort_order ASC',
    limit: 100
  }
};

export function getTableSpec(resource: string): TableSpec | null {
  return ADMIN_TABLES[resource] ?? null;
}

/** Gövdeyi kayıt defterine göre süzer ve SQL değerlerine çevirir. */
export function pickColumns(
  spec: TableSpec,
  body: Record<string, unknown>
): { names: string[]; values: (string | number)[] } {
  const names: string[] = [];
  const values: (string | number)[] = [];

  for (const [name, type] of Object.entries(spec.columns)) {
    if (!(name in body)) continue;
    const raw = body[name];

    if (type === 'bool') values.push(raw ? 1 : 0);
    else if (type === 'int') values.push(Number.isFinite(Number(raw)) ? Number(raw) : 0);
    else values.push(raw === null || raw === undefined ? '' : String(raw));

    names.push(name);
  }

  return { names, values };
}

/** D1 satırını admin arayüzünün beklediği biçime çevirir. */
export function rowToDoc(spec: TableSpec, row: Record<string, unknown>): Record<string, unknown> {
  const doc: Record<string, unknown> = { ...row, $id: String(row.id ?? '') };
  if (row.created_at !== undefined) doc.$createdAt = String(row.created_at);
  if (row.updated_at !== undefined) doc.$updatedAt = String(row.updated_at);

  for (const [name, type] of Object.entries(spec.columns)) {
    if (type === 'bool' && name in row) doc[name] = Number(row[name]) === 1;
  }
  return doc;
}
