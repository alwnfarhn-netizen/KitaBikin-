import { Router } from 'express';
import { z } from 'zod';
import { one, run } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, idParam, validate, wrap } from '../middleware/http.js';
import { listProjects, projectDetail } from '../utils/projects.js';
import { invoiceDetail, listInvoices } from '../utils/invoices.js';
import { snap } from '../utils/midtrans.js';

const router = Router();
router.use(authenticate, requireRole('client'));

router.get(
  '/overview',
  wrap((req, res) => {
    const uid = req.user.id;
    const projects = listProjects('WHERE p.client_id = ?', uid);
    const invoices = listInvoices('WHERE i.client_id = ? AND i.status IN (\'belum\',\'sebagian\')', uid);
    res.json({
      projects,
      outstanding: invoices.reduce((s, i) => s + (i.total - i.paid), 0),
      unpaidInvoices: invoices.length,
    });
  }),
);

router.get('/projects', wrap((req, res) => res.json({ projects: listProjects('WHERE p.client_id = ?', req.user.id) })));

router.get(
  '/projects/:id',
  wrap((req, res) => {
    const id = idParam(req);
    const own = one('SELECT 1 AS x FROM projects WHERE id = ? AND client_id = ?', id, req.user.id);
    if (!own) throw new HttpError(404, 'Proyek tidak ditemukan.');
    res.json({
      project: projectDetail(id),
      invoices: listInvoices('WHERE i.project_id = ? AND i.client_id = ?', id, req.user.id),
    });
  }),
);

router.post(
  '/projects/:id/messages',
  validate(z.object({ body: z.string().trim().min(1, 'Pesan kosong.').max(2000) })),
  wrap((req, res) => {
    const id = idParam(req);
    const own = one('SELECT 1 AS x FROM projects WHERE id = ? AND client_id = ?', id, req.user.id);
    if (!own) throw new HttpError(404, 'Proyek tidak ditemukan.');
    run('INSERT INTO messages (project_id, sender_id, body) VALUES (?,?,?)', id, req.user.id, req.body.body);
    run("UPDATE projects SET updated_at = datetime('now') WHERE id = ?", id);
    res.status(201).json({ ok: true });
  }),
);

router.get('/invoices', wrap((req, res) => res.json({ invoices: listInvoices('WHERE i.client_id = ?', req.user.id) })));

router.get(
  '/invoices/:id',
  wrap((req, res) => {
    const inv = invoiceDetail(idParam(req), req.user.id);
    if (!inv) throw new HttpError(404, 'Tagihan tidak ditemukan.');
    res.json({ invoice: inv });
  }),
);
router.post(
  '/invoices/:id/pay',
  wrap(async (req, res) => {
    const inv = invoiceDetail(idParam(req), req.user.id);
    if (!inv) throw new HttpError(404, 'Tagihan tidak ditemukan.');
    if (inv.status === 'lunas' || inv.status === 'batal') {
      throw new HttpError(400, 'Tagihan ini tidak dapat dibayar.');
    }

    const remaining = inv.total - inv.paid;
    const orderId = `INV-${inv.id}-${Date.now()}`;

    const parameters = {
      transaction_details: {
        order_id: orderId,
        gross_amount: remaining,
      },
      item_details: inv.items.map(it => ({
        id: it.id,
        price: it.price,
        quantity: it.qty,
        name: it.description.substring(0, 50),
      })),
      customer_details: {
        first_name: inv.client.name,
        email: inv.client.email,
        phone: inv.client.phone || '',
      },
      custom_field1: String(inv.id),
    };

    const transaction = await snap.createTransaction(parameters);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  }),
);

export default router;
