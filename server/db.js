import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','client')),
  phone         TEXT,
  organization  TEXT,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  client_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title       TEXT NOT NULL,
  service     TEXT NOT NULL,
  description TEXT,
  stage       TEXT NOT NULL DEFAULT 'briefing',
  progress    INTEGER NOT NULL DEFAULT 0,
  budget      INTEGER NOT NULL DEFAULT 0,
  start_date  TEXT,
  due_date    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  contact     TEXT,
  service     TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'baru',
  project_id  INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS milestones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS updates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  number     TEXT NOT NULL UNIQUE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  client_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  issue_date TEXT NOT NULL,
  due_date   TEXT,
  status     TEXT NOT NULL DEFAULT 'belum',
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty         INTEGER NOT NULL DEFAULT 1,
  price       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  method     TEXT NOT NULL,
  paid_at    TEXT NOT NULL,
  note       TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_client   ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_proj   ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_updates_proj      ON updates(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_proj     ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client   ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv      ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status);
`);

/** Jalankan fn di dalam transaksi (mendukung nested via SAVEPOINT); rollback bila error. */
let txDepth = 0;
export function tx(fn) {
  const name = `sp_${txDepth}`;
  db.exec(txDepth === 0 ? 'BEGIN' : `SAVEPOINT ${name}`);
  txDepth++;
  try {
    const result = fn();
    txDepth--;
    db.exec(txDepth === 0 ? 'COMMIT' : `RELEASE ${name}`);
    return result;
  } catch (err) {
    txDepth--;
    db.exec(txDepth === 0 ? 'ROLLBACK' : `ROLLBACK TO ${name}; RELEASE ${name}`);
    throw err;
  }
}

export const one = (sql, ...params) => db.prepare(sql).get(...params) ?? null;
export const all = (sql, ...params) => db.prepare(sql).all(...params);
export const run = (sql, ...params) => db.prepare(sql).run(...params);
