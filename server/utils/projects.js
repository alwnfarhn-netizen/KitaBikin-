import crypto from 'node:crypto';
import { all, one, run, tx } from '../db.js';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // tanpa karakter ambigu

export function generateProjectCode() {
  for (let i = 0; i < 20; i++) {
    let s = '';
    const bytes = crypto.randomBytes(6);
    for (const b of bytes) s += CODE_CHARS[b % CODE_CHARS.length];
    const code = `KB-${s}`;
    if (!one('SELECT 1 AS x FROM projects WHERE code = ?', code)) return code;
  }
  throw new Error('Gagal membuat kode proyek.');
}

/** Hitung ulang progres dari milestone (jika ada). */
export function recalcProgress(projectId) {
  const row = one(
    'SELECT COUNT(*) AS total, COALESCE(SUM(done),0) AS done FROM milestones WHERE project_id = ?',
    projectId,
  );
  const project = one('SELECT stage FROM projects WHERE id = ?', projectId);
  if (!project) return;
  let progress = null;
  if (project.stage === 'selesai') progress = 100;
  else if (row.total > 0) progress = Math.round((row.done / row.total) * 100);
  if (progress !== null) {
    run("UPDATE projects SET progress = ?, updated_at = datetime('now') WHERE id = ?", progress, projectId);
  } else {
    run("UPDATE projects SET updated_at = datetime('now') WHERE id = ?", projectId);
  }
}

export const touchProject = (id) => run("UPDATE projects SET updated_at = datetime('now') WHERE id = ?", id);

const PROJECT_SELECT = `
  SELECT p.*, u.name AS client_name, u.organization AS client_org
  FROM projects p JOIN users u ON u.id = p.client_id`;

export const listProjects = (where = '', ...params) =>
  all(`${PROJECT_SELECT} ${where} ORDER BY p.updated_at DESC, p.id DESC`, ...params);

export const getProject = (id) => one(`${PROJECT_SELECT} WHERE p.id = ?`, id);

export function projectDetail(id) {
  const project = getProject(id);
  if (!project) return null;
  return {
    ...project,
    milestones: all('SELECT * FROM milestones WHERE project_id = ? ORDER BY sort_order, id', id),
    updates: all('SELECT * FROM updates WHERE project_id = ? ORDER BY created_at DESC, id DESC', id),
    messages: all(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = ? ORDER BY m.created_at, m.id`,
      id,
    ),
  };
}

export function createProject({ clientId, title, service, description, stage, budget, startDate, dueDate, milestones }) {
  return tx(() => {
    const code = generateProjectCode();
    const r = run(
      `INSERT INTO projects (code, client_id, title, service, description, stage, budget, start_date, due_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      code, clientId, title, service, description ?? null, stage ?? 'briefing', budget ?? 0, startDate ?? null, dueDate ?? null,
    );
    const id = Number(r.lastInsertRowid);
    (milestones ?? []).forEach((m, i) =>
      run('INSERT INTO milestones (project_id, title, sort_order) VALUES (?,?,?)', id, m, i),
    );
    run('INSERT INTO updates (project_id, title, body) VALUES (?,?,?)', id, 'Proyek dimulai', 'Proyek Anda telah terdaftar di sistem Kawakita.');
    recalcProgress(id);
    return id;
  });
}

export const DEFAULT_MILESTONES = [
  'Briefing & pengumpulan kebutuhan',
  'Desain UI/UX',
  'Pengembangan fitur',
  'Pengujian & revisi',
  'Peluncuran & training',
];
