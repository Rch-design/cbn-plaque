-- CBN Plaque — Cloudflare D1 şeması
-- Uygulamak için: npm run db:setup
--
-- Notlar:
--  * D1 (SQLite) boolean tutmaz; is_active / is_read / is_published INTEGER 0|1.
--  * id alanları Appwrite $id değerleriyle aynı kalır — /realisations/[id]
--    bağlantıları ve mevcut SEO korunur.
--  * Tarihler ISO 8601 metin (Appwrite $createdAt ile aynı biçim).

CREATE TABLE IF NOT EXISTS services (
  id            TEXT PRIMARY KEY,
  title_fr      TEXT NOT NULL DEFAULT '',
  title_tr      TEXT NOT NULL DEFAULT '',
  desc_fr       TEXT NOT NULL DEFAULT '',
  desc_tr       TEXT NOT NULL DEFAULT '',
  icon          TEXT NOT NULL DEFAULT '',
  image_file_id TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services (is_active, sort_order);

CREATE TABLE IF NOT EXISTS projects (
  id            TEXT PRIMARY KEY,
  title_fr      TEXT NOT NULL DEFAULT '',
  title_tr      TEXT NOT NULL DEFAULT '',
  desc_fr       TEXT NOT NULL DEFAULT '',
  desc_tr       TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT '',
  cover_file_id TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category, sort_order);

CREATE TABLE IF NOT EXISTS project_images (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  file_id    TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images (project_id, sort_order);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (is_read);

CREATE TABLE IF NOT EXISTS settings (
  id         TEXT PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value_fr   TEXT NOT NULL DEFAULT '',
  value_tr   TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title_fr     TEXT NOT NULL DEFAULT '',
  title_tr     TEXT NOT NULL DEFAULT '',
  content_fr   TEXT NOT NULL DEFAULT '',
  content_tr   TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages (is_published, sort_order);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL DEFAULT 5,
  body       TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  is_active  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reviews_sort ON reviews (is_active, sort_order);

CREATE TABLE IF NOT EXISTS analytics (
  id    TEXT PRIMARY KEY,
  date  TEXT NOT NULL,
  page  TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_date_page ON analytics (date, page);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics (date DESC);

CREATE TABLE IF NOT EXISTS banners (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL DEFAULT '',
  subtitle      TEXT NOT NULL DEFAULT '',
  cta_text      TEXT NOT NULL DEFAULT '',
  cta_link      TEXT NOT NULL DEFAULT '',
  bg_color      TEXT NOT NULL DEFAULT '',
  text_color    TEXT NOT NULL DEFAULT '',
  image_file_id TEXT NOT NULL DEFAULT '',
  pages         TEXT NOT NULL DEFAULT 'all',
  is_active     INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON banners (is_active, sort_order);

CREATE TABLE IF NOT EXISTS admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
