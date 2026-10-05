import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { all, one, run, tx } from '../db.js';
import crypto from 'node:crypto';
import { SERVICES } from '../config.js';
import { HttpError, validate, wrap } from '../middleware/http.js';

const router = Router();

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak pengiriman. Coba lagi nanti.' },
});

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
});

import { sendWhatsApp } from '../utils/whatsapp.js';
import { syncInvoiceStatus } from '../utils/invoices.js';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120),
  contact: z.string().trim().max(120).optional().default(''),
  service: z.enum(SERVICES, { message: 'Layanan tidak valid.' }),
  description: z.string().trim().min(5, 'Ceritakan kebutuhan Anda (min. 5 karakter).').max(2000),
  website: z.string().max(0).optional(), // honeypot — harus kosong
});

router.post(
  '/leads',
  leadLimiter,
  validate(leadSchema),
  wrap((req, res) => {
    const { name, contact, service, description, website } = req.body;
    if (website) return res.status(201).json({ ok: true }); // bot: pura-pura sukses
    run('INSERT INTO leads (name, contact, service, description) VALUES (?,?,?,?)', name, contact || null, service, description);
    
    // Notifikasi ke Admin via WA (jika nomor admin diatur)
    if (process.env.ADMIN_PHONE) {
      const msg = `🔔 *LEAD BARU MASUK*\n\nNama: ${name}\nLayanan: ${service}\nKontak: ${contact || '-'}\n\nPesan:\n"${description}"\n\nSilakan cek panel Admin Kawakita.`;
      sendWhatsApp(process.env.ADMIN_PHONE, msg).catch(console.error);
    }
    
    res.status(201).json({ ok: true });
  }),
);

router.get(
  '/track/:code',
  trackLimiter,
  wrap((req, res) => {
    const code = String(req.params.code || '').trim().toUpperCase();
    if (!/^KB-[A-Z0-9]{6}$/.test(code)) throw new HttpError(404, 'Kode proyek tidak ditemukan.');
    const p = one('SELECT id, code, title, service, stage, progress, start_date, due_date, updated_at FROM projects WHERE code = ?', code);
    if (!p) throw new HttpError(404, 'Kode proyek tidak ditemukan.');
    res.json({
      project: p,
      milestones: all('SELECT title, done FROM milestones WHERE project_id = ? ORDER BY sort_order, id', p.id),
      updates: all('SELECT title, body, created_at FROM updates WHERE project_id = ? ORDER BY created_at DESC, id DESC LIMIT 5', p.id),
    });
  }),
);
router.post(
  '/midtrans',
  wrap(async (req, res) => {
    const data = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Verifikasi Signature Midtrans
    const hash = crypto.createHash('sha512').update(data.order_id + data.status_code + data.gross_amount + serverKey).digest('hex');
    if (hash !== data.signature_key) {
      throw new HttpError(403, 'Invalid signature');
    }

    const invoiceId = Number(data.custom_field1);
    if (!invoiceId) return res.json({ ok: true });

    const status = data.transaction_status;
    const fraud = data.fraud_status;

    if (status === 'capture' || status === 'settlement') {
      if (fraud === 'challenge') return res.json({ ok: true });
      tx(() => {
        // Mencegah duplikasi pembayaran
        const exists = one('SELECT 1 AS x FROM payments WHERE note = ?', data.transaction_id);
        if (!exists) {
          run('INSERT INTO payments (invoice_id, amount, method, paid_at, note) VALUES (?,?,?,?,?)', 
            invoiceId, Math.floor(Number(data.gross_amount)), data.payment_type || 'midtrans', (data.transaction_time || '').slice(0,10) || new Date().toISOString().slice(0,10), data.transaction_id);
          syncInvoiceStatus(invoiceId);
        }
      });
    }
    res.json({ ok: true });
  }),
);

export default router;
