export const schema = `
CREATE TABLE datasets(id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE research_posts(id TEXT NOT NULL, dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE, payload TEXT NOT NULL, content_expiry_at TEXT, PRIMARY KEY(id,dataset_id));
CREATE TABLE drafts(id TEXT PRIMARY KEY, dataset_id TEXT REFERENCES datasets(id) ON DELETE SET NULL, payload TEXT NOT NULL);
CREATE TABLE settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX posts_expiry ON research_posts(content_expiry_at);
PRAGMA user_version=1;`;

