import { all, one, run } from '../db.js';

const INVOICE_SELECT = `
  SELECT i.*,
    u.name AS client_name, u.organization AS client_org, u.email AS client_email, u.phone AS client_phone,
    p.title AS project_title, p.code AS project_code,
    COALESCE((SELECT SUM(qty * price) FROM invoice_items WHERE invoice_id = i.id), 0) AS total,
    COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS paid
  FROM invoices i
  JOIN users u ON u.id = i.client_id
  LEFT JOIN projects p ON p.id = i.project_id`;

export const listInvoices = (where = '', ...params) =>
  all(`${INVOICE_SELECT} ${where} ORDER BY i.issue_date DESC, i.id DESC`, ...params);

export function invoiceDetail(id, clientId = null) {
  const inv = one(`${INVOICE_SELECT} WHERE i.id = ?${clientId ? ' AND i.client_id = ?' : ''}`, ...(clientId ? [id, clientId] : [id]));
  if (!inv) return null;
  return {
    ...inv,
    items: all('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id', id),
    payments: all('SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at, id', id),
  };
}

/** Nomor berurutan per bulan: INV-202610-001 */
export function nextInvoiceNumber(date = new Date()) {
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `INV-${ym}-`;
  const last = one('SELECT number FROM invoices WHERE number LIKE ? ORDER BY number DESC LIMIT 1', `${prefix}%`);
  const n = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(3, '0')}`;
}

/** Sinkronkan status berdasarkan pembayaran (kecuali dibatalkan). */
export function syncInvoiceStatus(id) {
  const inv = one(
    `SELECT i.status,
      COALESCE((SELECT SUM(qty * price) FROM invoice_items WHERE invoice_id = i.id), 0) AS total,
      COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS paid
     FROM invoices i WHERE i.id = ?`,
    id,
  );
  if (!inv || inv.status === 'batal') return;
  let status = 'belum';
  if (inv.total > 0 && inv.paid >= inv.total) status = 'lunas';
  else if (inv.paid > 0) status = 'sebagian';
  run('UPDATE invoices SET status = ? WHERE id = ?', status, id);
}
