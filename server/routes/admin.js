import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { all, one, run, tx } from '../db.js';
import { INVOICE_STATUSES, LEAD_STATUSES, PAYMENT_METHODS, SERVICES, STAGES } from '../config.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, idParam, validate, wrap } from '../middleware/http.js';
import {
  DEFAULT_MILESTONES,
  createProject,
  getProject,
  listProjects,
  projectDetail,
  recalcProgress,
  touchProject,
} from '../utils/projects.js';
import { invoiceDetail, listInvoices, nextInvoiceNumber, syncInvoiceStatus } from '../utils/invoices.js';
import { sendWhatsApp } from '../utils/whatsapp.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

const today = () => new Date().toISOString().slice(0, 10);
const optStr = (max = 200) => z.string().trim().max(max).optional().nullable().transform((v) => v || null);
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD.');
const optDate = z.union([dateStr, z.literal(''), z.null()]).optional().transform((v) => v || null);
const money = z.coerce.number().int('Harus bilangan bulat.').min(0, 'Tidak boleh negatif.');
const randomPassword = () => crypto.randomBytes(9).toString('base64url');

/* ───────────────────────────── Dashboard ───────────────────────────── */
router.get(
  '/stats',
  wrap((_req, res) => {
    const month = new Date().toISOString().slice(0, 7);
    const revenueMonth = one("SELECT COALESCE(SUM(amount),0) AS v FROM payments WHERE substr(paid_at,1,7) = ?", month).v;
    const receivable = one(
      `SELECT COALESCE(SUM(t.total - t.paid),0) AS v FROM (
         SELECT COALESCE((SELECT SUM(qty*price) FROM invoice_items WHERE invoice_id=i.id),0) AS total,
                COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id=i.id),0) AS paid
         FROM invoices i WHERE i.status IN ('belum','sebagian')) t`,
    ).v;
    res.json({
      leadsNew: one("SELECT COUNT(*) AS v FROM leads WHERE status = 'baru'").v,
      projectsActive: one("SELECT COUNT(*) AS v FROM projects WHERE stage NOT IN ('selesai','ditunda')").v,
      projectsDone: one("SELECT COUNT(*) AS v FROM projects WHERE stage = 'selesai'").v,
      clients: one("SELECT COUNT(*) AS v FROM users WHERE role = 'client' AND active = 1").v,
      revenueMonth,
      receivable,
      byStage: all('SELECT stage, COUNT(*) AS count FROM projects GROUP BY stage'),
      recentLeads: all('SELECT * FROM leads ORDER BY created_at DESC, id DESC LIMIT 5'),
      recentProjects: listProjects('', ).slice(0, 5),
    });
  }),
);

/* ─────────────────────────────── Leads ─────────────────────────────── */
router.get('/leads', wrap((_req, res) => res.json({ leads: all('SELECT * FROM leads ORDER BY created_at DESC, id DESC') })));

router.patch(
  '/leads/:id',
  validate(z.object({ status: z.enum(LEAD_STATUSES) })),
  wrap((req, res) => {
    const id = idParam(req);
    const r = run('UPDATE leads SET status = ? WHERE id = ?', req.body.status, id);
    if (!r.changes) throw new HttpError(404, 'Lead tidak ditemukan.');
    res.json({ lead: one('SELECT * FROM leads WHERE id = ?', id) });
  }),
);

router.delete(
  '/leads/:id',
  wrap((req, res) => {
    const r = run('DELETE FROM leads WHERE id = ?', idParam(req));
    if (!r.changes) throw new HttpError(404, 'Lead tidak ditemukan.');
    res.json({ ok: true });
  }),
);

const clientBase = {
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120),
  email: z.string().trim().toLowerCase().email('Email tidak valid.'),
  phone: optStr(30),
  organization: optStr(150),
};

const convertSchema = z
  .object({
    clientId: z.coerce.number().int().positive().optional(),
    newClient: z.object({ ...clientBase, password: z.string().min(8).max(72).optional() }).optional(),
    title: z.string().trim().min(3).max(200).optional(),
    budget: money.optional().default(0),
    dueDate: optDate,
    defaultMilestones: z.boolean().optional().default(true),
  })
  .refine((v) => v.clientId || v.newClient, { message: 'Pilih klien atau isi data klien baru.' });

router.post(
  '/leads/:id/convert',
  validate(convertSchema),
  wrap((req, res) => {
    const id = idParam(req);
    const lead = one('SELECT * FROM leads WHERE id = ?', id);
    if (!lead) throw new HttpError(404, 'Lead tidak ditemukan.');
    if (lead.project_id) throw new HttpError(409, 'Lead ini sudah dikonversi.');
    const { clientId, newClient, title, budget, dueDate, defaultMilestones } = req.body;

    const result = tx(() => {
      let cid = clientId;
      let generatedPassword = null;
      if (!cid) {
        generatedPassword = newClient.password ? null : randomPassword();
        const pw = newClient.password || generatedPassword;
        const r = run(
          "INSERT INTO users (name,email,password_hash,role,phone,organization) VALUES (?,?,?,'client',?,?)",
          newClient.name, newClient.email, bcrypt.hashSync(pw, 10), newClient.phone, newClient.organization,
        );
        cid = Number(r.lastInsertRowid);
      } else if (!one("SELECT 1 AS x FROM users WHERE id = ? AND role = 'client'", cid)) {
        throw new HttpError(404, 'Klien tidak ditemukan.');
      }
      const projectId = createProject({
        clientId: cid,
        title: title || `${lead.service} — ${lead.name}`,
        service: lead.service,
        description: lead.description,
        budget,
        dueDate,
        startDate: today(),
        milestones: defaultMilestones ? DEFAULT_MILESTONES : [],
      });
      run("UPDATE leads SET status = 'deal', project_id = ? WHERE id = ?", projectId, id);
      return { projectId, clientId: cid, generatedPassword };
    });
    res.status(201).json(result);
  }),
);

/* ─────────────────────────────── Klien ─────────────────────────────── */
router.get(
  '/clients',
  wrap((_req, res) => {
    const clients = all(
      `SELECT u.id, u.name, u.email, u.phone, u.organization, u.active, u.created_at,
        (SELECT COUNT(*) FROM projects WHERE client_id = u.id) AS project_count
       FROM users u WHERE u.role = 'client' ORDER BY u.created_at DESC, u.id DESC`,
    );
    res.json({ clients });
  }),
);

router.post(
  '/clients',
  validate(z.object({ ...clientBase, password: z.string().min(8, 'Password minimal 8 karakter.').max(72).optional() })),
  wrap((req, res) => {
    const { name, email, phone, organization, password } = req.body;
    const generatedPassword = password ? null : randomPassword();
    const r = run(
      "INSERT INTO users (name,email,password_hash,role,phone,organization) VALUES (?,?,?,'client',?,?)",
      name, email, bcrypt.hashSync(password || generatedPassword, 10), phone, organization,
    );
    res.status(201).json({ id: Number(r.lastInsertRowid), generatedPassword });
  }),
);

router.patch(
  '/clients/:id',
  validate(
    z.object({
      name: clientBase.name.optional(),
      email: clientBase.email.optional(),
      phone: clientBase.phone,
      organization: clientBase.organization,
      active: z.boolean().optional(),
      resetPassword: z.boolean().optional(),
    }),
  ),
  wrap((req, res) => {
    const id = idParam(req);
    const c = one("SELECT * FROM users WHERE id = ? AND role = 'client'", id);
    if (!c) throw new HttpError(404, 'Klien tidak ditemukan.');
    const b = req.body;
    let generatedPassword = null;
    let hash = c.password_hash;
    if (b.resetPassword) {
      generatedPassword = randomPassword();
      hash = bcrypt.hashSync(generatedPassword, 10);
    }
    run(
      'UPDATE users SET name=?, email=?, phone=?, organization=?, active=?, password_hash=? WHERE id=?',
      b.name ?? c.name,
      b.email ?? c.email,
      'phone' in b ? b.phone : c.phone,
      'organization' in b ? b.organization : c.organization,
      b.active === undefined ? c.active : b.active ? 1 : 0,
      hash,
      id,
    );
    res.json({ ok: true, generatedPassword });
  }),
);

/* ────────────────────────────── Proyek ─────────────────────────────── */
const projectBase = {
  title: z.string().trim().min(3, 'Judul minimal 3 karakter.').max(200),
  service: z.enum(SERVICES, { message: 'Layanan tidak valid.' }),
  description: optStr(3000),
  stage: z.enum(STAGES).optional(),
  budget: money.optional(),
  startDate: optDate,
  dueDate: optDate,
};

router.get('/projects', wrap((_req, res) => res.json({ projects: listProjects() })));

router.post(
  '/projects',
  validate(
    z.object({
      ...projectBase,
      clientId: z.coerce.number().int().positive('Pilih klien.'),
      defaultMilestones: z.boolean().optional().default(true),
    }),
  ),
  wrap((req, res) => {
    const b = req.body;
    if (!one("SELECT 1 AS x FROM users WHERE id = ? AND role = 'client'", b.clientId)) {
      throw new HttpError(404, 'Klien tidak ditemukan.');
    }
    const id = createProject({ ...b, startDate: b.startDate ?? today(), milestones: b.defaultMilestones ? DEFAULT_MILESTONES : [] });
    res.status(201).json({ id, project: getProject(id) });
  }),
);

router.get(
  '/projects/:id',
  wrap((req, res) => {
    const id = idParam(req);
    const project = projectDetail(id);
    if (!project) throw new HttpError(404, 'Proyek tidak ditemukan.');
    res.json({ project, invoices: listInvoices('WHERE i.project_id = ?', id) });
  }),
);

router.patch(
  '/projects/:id',
  validate(
    z.object({
      ...Object.fromEntries(Object.entries(projectBase).map(([k, v]) => [k, v.optional()])),
      clientId: z.coerce.number().int().positive().optional(),
      progress: z.coerce.number().int().min(0).max(100).optional(),
    }),
  ),
  wrap((req, res) => {
    const id = idParam(req);
    const p = one('SELECT * FROM projects WHERE id = ?', id);
    if (!p) throw new HttpError(404, 'Proyek tidak ditemukan.');
    const b = req.body;
    tx(() => {
      run(
        `UPDATE projects SET title=?, service=?, description=?, stage=?, budget=?, start_date=?, due_date=?, client_id=?, progress=?
         WHERE id=?`,
        b.title ?? p.title,
        b.service ?? p.service,
        'description' in b ? b.description : p.description,
        b.stage ?? p.stage,
        b.budget ?? p.budget,
        'startDate' in b ? b.startDate : p.start_date,
        'dueDate' in b ? b.dueDate : p.due_date,
        b.clientId ?? p.client_id,
        b.progress ?? p.progress,
        id,
      );
      if (b.stage && b.stage !== p.stage) {
        run('INSERT INTO updates (project_id, title, body) VALUES (?,?,?)', id, `Tahap berubah: ${b.stage}`, null);
      }
      // Jika progres tidak diatur manual, hitung ulang dari milestone / tahap selesai
      if (b.progress === undefined) recalcProgress(id);
      else touchProject(id);
    });
    const updatedProject = getProject(id);
    if (b.stage && b.stage !== p.stage && updatedProject.client.phone) {
      const msg = `Halo ${updatedProject.client.name},\n\nStatus proyek *"${updatedProject.title}"* saat ini telah beranjak ke tahap: *${b.stage.toUpperCase()}*.\n\nCek progres selengkapnya di portal klien Kawakita.`;
      sendWhatsApp(updatedProject.client.phone, msg).catch(console.error);
    }
    res.json({ project: updatedProject });
  }),
);

router.delete(
  '/projects/:id',
  wrap((req, res) => {
    const r = run('DELETE FROM projects WHERE id = ?', idParam(req));
    if (!r.changes) throw new HttpError(404, 'Proyek tidak ditemukan.');
    res.json({ ok: true });
  }),
);

/* ───────────────────── Milestone / Update / Pesan ──────────────────── */
const mustProject = (id) => {
  if (!one('SELECT 1 AS x FROM projects WHERE id = ?', id)) throw new HttpError(404, 'Proyek tidak ditemukan.');
};

router.post(
  '/projects/:id/milestones',
  validate(z.object({ title: z.string().trim().min(2).max(200) })),
  wrap((req, res) => {
    const id = idParam(req);
    mustProject(id);
    const next = one('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM milestones WHERE project_id = ?', id).n;
    run('INSERT INTO milestones (project_id, title, sort_order) VALUES (?,?,?)', id, req.body.title, next);
    recalcProgress(id);
    res.status(201).json({ ok: true });
  }),
);

router.patch(
  '/milestones/:id',
  validate(z.object({ done: z.boolean().optional(), title: z.string().trim().min(2).max(200).optional() })),
  wrap((req, res) => {
    const id = idParam(req);
    const m = one('SELECT * FROM milestones WHERE id = ?', id);
    if (!m) throw new HttpError(404, 'Milestone tidak ditemukan.');
    run('UPDATE milestones SET title = ?, done = ? WHERE id = ?', req.body.title ?? m.title, req.body.done === undefined ? m.done : req.body.done ? 1 : 0, id);
    recalcProgress(m.project_id);
    res.json({ ok: true });
  }),
);

router.delete(
  '/milestones/:id',
  wrap((req, res) => {
    const id = idParam(req);
    const m = one('SELECT project_id FROM milestones WHERE id = ?', id);
    if (!m) throw new HttpError(404, 'Milestone tidak ditemukan.');
    run('DELETE FROM milestones WHERE id = ?', id);
    recalcProgress(m.project_id);
    res.json({ ok: true });
  }),
);

router.post(
  '/projects/:id/updates',
  validate(z.object({ title: z.string().trim().min(2).max(200), body: optStr(2000) })),
  wrap((req, res) => {
    const id = idParam(req);
    mustProject(id);
    run('INSERT INTO updates (project_id, title, body) VALUES (?,?,?)', id, req.body.title, req.body.body);
    touchProject(id);
    res.status(201).json({ ok: true });
  }),
);

router.delete(
  '/updates/:id',
  wrap((req, res) => {
    const r = run('DELETE FROM updates WHERE id = ?', idParam(req));
    if (!r.changes) throw new HttpError(404, 'Update tidak ditemukan.');
    res.json({ ok: true });
  }),
);

router.post(
  '/projects/:id/messages',
  validate(z.object({ body: z.string().trim().min(1, 'Pesan kosong.').max(2000) })),
  wrap((req, res) => {
    const id = idParam(req);
    mustProject(id);
    run('INSERT INTO messages (project_id, sender_id, body) VALUES (?,?,?)', id, req.user.id, req.body.body);
    res.status(201).json({ ok: true });
  }),
);

/* ───────────────────────── Kasir / Invoice (POS) ───────────────────── */
const invoiceSchema = z.object({
  clientId: z.coerce.number().int().positive('Pilih klien.'),
  projectId: z.coerce.number().int().positive().optional().nullable(),
  issueDate: dateStr.optional(),
  dueDate: optDate,
  notes: optStr(1000),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(2, 'Deskripsi item wajib diisi.').max(300),
        qty: z.coerce.number().int().min(1).max(10000),
        price: money,
      }),
    )
    .min(1, 'Minimal satu item.'),
});

router.get(
  '/invoices',
  wrap((req, res) => {
    const status = String(req.query.status || '');
    const invoices = INVOICE_STATUSES.includes(status) ? listInvoices('WHERE i.status = ?', status) : listInvoices();
    res.json({ invoices });
  }),
);

router.post(
  '/invoices',
  validate(invoiceSchema),
  wrap((req, res) => {
    const b = req.body;
    if (!one("SELECT 1 AS x FROM users WHERE id = ? AND role = 'client'", b.clientId)) throw new HttpError(404, 'Klien tidak ditemukan.');
    if (b.projectId) {
      const p = one('SELECT client_id FROM projects WHERE id = ?', b.projectId);
      if (!p || p.client_id !== b.clientId) throw new HttpError(400, 'Proyek tidak sesuai dengan klien.');
    }
    const id = tx(() => {
      const r = run(
        'INSERT INTO invoices (number, project_id, client_id, issue_date, due_date, notes) VALUES (?,?,?,?,?,?)',
        nextInvoiceNumber(), b.projectId ?? null, b.clientId, b.issueDate ?? today(), b.dueDate, b.notes,
      );
      const invId = Number(r.lastInsertRowid);
      for (const it of b.items) {
        run('INSERT INTO invoice_items (invoice_id, description, qty, price) VALUES (?,?,?,?)', invId, it.description, it.qty, it.price);
      }
      return invId;
    });
    const inv = invoiceDetail(id);
    if (inv && inv.client.phone) {
      const msg = `Halo ${inv.client.name},\n\nTagihan baru telah diterbitkan untuk Anda sejumlah *Rp ${new Intl.NumberFormat('id-ID').format(inv.total)}*.\n\nNomor Invoice: ${inv.number}\nJatuh Tempo: ${inv.due_date || '-'}\n\nSilakan cek detail dan instruksi pembayaran di portal klien Kawakita.\n\nTerima kasih!`;
      sendWhatsApp(inv.client.phone, msg).catch(console.error);
    }
    res.status(201).json({ id, invoice: inv });
  }),
);

router.get(
  '/invoices/:id',
  wrap((req, res) => {
    const inv = invoiceDetail(idParam(req));
    if (!inv) throw new HttpError(404, 'Invoice tidak ditemukan.');
    res.json({ invoice: inv });
  }),
);

router.patch(
  '/invoices/:id',
  validate(z.object({ void: z.boolean().optional(), notes: optStr(1000), dueDate: optDate })),
  wrap((req, res) => {
    const id = idParam(req);
    const inv = one('SELECT * FROM invoices WHERE id = ?', id);
    if (!inv) throw new HttpError(404, 'Invoice tidak ditemukan.');
    const b = req.body;
    run(
      'UPDATE invoices SET notes = ?, due_date = ? WHERE id = ?',
      'notes' in b ? b.notes : inv.notes,
      'dueDate' in b ? b.dueDate : inv.due_date,
      id,
    );
    if (b.void === true) run("UPDATE invoices SET status = 'batal' WHERE id = ?", id);
    if (b.void === false && inv.status === 'batal') {
      run("UPDATE invoices SET status = 'belum' WHERE id = ?", id);
      syncInvoiceStatus(id);
    }
    res.json({ invoice: invoiceDetail(id) });
  }),
);

router.post(
  '/invoices/:id/payments',
  validate(
    z.object({
      amount: z.coerce.number().int().min(1, 'Nominal harus lebih dari 0.'),
      method: z.enum(PAYMENT_METHODS),
      paidAt: dateStr.optional(),
      note: optStr(300),
    }),
  ),
  wrap((req, res) => {
    const id = idParam(req);
    const inv = invoiceDetail(id);
    if (!inv) throw new HttpError(404, 'Invoice tidak ditemukan.');
    if (inv.status === 'batal') throw new HttpError(400, 'Invoice sudah dibatalkan.');
    const remaining = inv.total - inv.paid;
    if (req.body.amount > remaining) throw new HttpError(400, 'Nominal melebihi sisa tagihan.');
    tx(() => {
      run('INSERT INTO payments (invoice_id, amount, method, paid_at, note) VALUES (?,?,?,?,?)', id, req.body.amount, req.body.method, req.body.paidAt ?? today(), req.body.note);
      syncInvoiceStatus(id);
    });
    res.status(201).json({ invoice: invoiceDetail(id) });
  }),
);

router.delete(
  '/payments/:id',
  wrap((req, res) => {
    const id = idParam(req);
    const p = one('SELECT invoice_id FROM payments WHERE id = ?', id);
    if (!p) throw new HttpError(404, 'Pembayaran tidak ditemukan.');
    tx(() => {
      run('DELETE FROM payments WHERE id = ?', id);
      syncInvoiceStatus(p.invoice_id);
    });
    res.json({ invoice: invoiceDetail(p.invoice_id) });
  }),
);

export default router;
