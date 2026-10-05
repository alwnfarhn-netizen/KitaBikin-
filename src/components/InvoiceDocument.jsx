import { formatDate, rupiah } from '../lib/format';
import { PAYMENT_METHODS } from '../lib/constants';
import { InvoiceBadge } from './ui';

/** Dokumen invoice siap cetak (dipakai admin & klien). */
export default function InvoiceDocument({ invoice: inv }) {
  const remaining = inv.total - inv.paid;
  return (
    <div className="invoice-paper">
      <div className="invoice-head">
        <div>
          <img src="/logo-full.svg" alt="Kawakita" height="44" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Solusi Digital untuk Bisnis & Pendidikan<br />WhatsApp 0851-2807-1828</p>
        </div>
        <div className="invoice-meta">
          <h2>INVOICE</h2>
          <div><strong>{inv.number}</strong></div>
          <div>Terbit: {formatDate(inv.issue_date)}</div>
          <div>Jatuh tempo: {formatDate(inv.due_date)}</div>
          <div style={{ marginTop: 6 }}><InvoiceBadge status={inv.status} /></div>
        </div>
      </div>

      <div className="invoice-parties">
        <div>
          <h4>Ditagihkan kepada</h4>
          <strong style={{ color: 'var(--secondary)' }}>{inv.client_name}</strong>
          {inv.client_org && <div>{inv.client_org}</div>}
          <div>{inv.client_email}</div>
          {inv.client_phone && <div>{inv.client_phone}</div>}
        </div>
        <div>
          <h4>Proyek</h4>
          {inv.project_title ? <><strong style={{ color: 'var(--secondary)' }}>{inv.project_title}</strong><div>{inv.project_code}</div></> : <span>—</span>}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Deskripsi</th><th className="num">Qty</th><th className="num">Harga</th><th className="num">Jumlah</th></tr></thead>
          <tbody>
            {inv.items.map((it) => (
              <tr key={it.id}><td>{it.description}</td><td className="num">{it.qty}</td><td className="num">{rupiah(it.price)}</td><td className="num">{rupiah(it.qty * it.price)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-sum">
        <div><span>Subtotal</span><span>{rupiah(inv.total)}</span></div>
        <div><span>Dibayar</span><span>− {rupiah(inv.paid)}</span></div>
        <div className="grand"><span>Sisa tagihan</span><span>{rupiah(inv.status === 'batal' ? 0 : remaining)}</span></div>
      </div>

      {inv.payments.length > 0 && (
        <div style={{ marginTop: '1.75rem' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Riwayat pembayaran</h4>
          <table className="table">
            <tbody>
              {inv.payments.map((p) => (
                <tr key={p.id}><td>{formatDate(p.paid_at)}</td><td>{PAYMENT_METHODS[p.method] ?? p.method}{p.note ? ` — ${p.note}` : ''}</td><td className="num">{rupiah(p.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inv.notes && <p style={{ marginTop: '1.5rem', padding: '1rem', background: '#faf8f4', borderRadius: 8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}><strong>Catatan:</strong> {inv.notes}</p>}
      <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terima kasih atas kepercayaan Anda kepada Kawakita 🧡</p>
    </div>
  );
}
