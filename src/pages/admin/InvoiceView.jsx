import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Printer, Trash2, Ban, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { PAYMENT_METHODS } from '../../lib/constants';
import { formatDate, rupiah, todayISO } from '../../lib/format';
import { Async, Field, FormError } from '../../components/ui';
import InvoiceDocument from '../../components/InvoiceDocument';

export default function InvoiceView() {
  const { id } = useParams();
  const state = useAsync(() => api.get(`/admin/invoices/${id}`), [id]);
  const [pay, setPay] = useState({ amount: '', method: 'transfer', paidAt: todayISO(), note: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setError('');
    setBusy(true);
    try { await fn(); await state.reload(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Async state={state}>
      {({ invoice: inv }) => {
        const remaining = inv.total - inv.paid;
        const canPay = inv.status !== 'batal' && remaining > 0;
        return (
          <>
            <div className="flex justify-between items-center flex-wrap gap-4 no-print" style={{ marginBottom: '1.25rem' }}>
              <Link to="/admin/kasir" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} /> Semua invoice</Link>
              <div className="dash-actions">
                <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={16} /> Cetak</button>
                {inv.status === 'batal'
                  ? <button className="btn btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/invoices/${inv.id}`, { void: false }))}><RotateCcw size={16} /> Aktifkan lagi</button>
                  : <button className="btn btn-outline btn-sm btn-danger-ghost" onClick={() => window.confirm('Batalkan invoice ini?') && act(() => api.patch(`/admin/invoices/${inv.id}`, { void: true }))}><Ban size={16} /> Batalkan</button>}
              </div>
            </div>
            <FormError error={error} />

            <div className="dash-grid main-side">
              <InvoiceDocument invoice={inv} />

              <div className="stack no-print">
                <div className="dash-card">
                  <h2>Catat Pembayaran</h2>
                  {!canPay ? (
                    <p style={{ color: 'var(--text-muted)' }}>{inv.status === 'batal' ? 'Invoice dibatalkan.' : 'Invoice sudah lunas. 🎉'}</p>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      act(async () => { await api.post(`/admin/invoices/${inv.id}/payments`, { ...pay, amount: Number(pay.amount) }); setPay({ ...pay, amount: '', note: '' }); });
                    }}>
                      <Field label="Nominal (Rp)" hint={`Sisa tagihan ${rupiah(remaining)}`}>
                        <input type="number" min="1" max={remaining} required className="input-field" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                      </Field>
                      <button type="button" className="btn-ghost" style={{ marginTop: '-0.75rem', marginBottom: '1rem' }} onClick={() => setPay({ ...pay, amount: String(remaining) })}>Isi sisa tagihan</button>
                      <div className="form-row">
                        <Field label="Metode">
                          <select className="input-field" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                            {Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </Field>
                        <Field label="Tanggal"><input type="date" required className="input-field" value={pay.paidAt} onChange={(e) => setPay({ ...pay, paidAt: e.target.value })} /></Field>
                      </div>
                      <Field label="Catatan"><input className="input-field" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} placeholder="Opsional" /></Field>
                      <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}><Banknote size={16} /> Catat Pembayaran</button>
                    </form>
                  )}
                </div>

                {inv.payments.length > 0 && (
                  <div className="dash-card">
                    <h2>Riwayat</h2>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {inv.payments.map((p) => (
                        <li key={p.id} className="flex justify-between items-center gap-2">
                          <div><strong>{rupiah(p.amount)}</strong><span className="cell-sub">{PAYMENT_METHODS[p.method]} · {formatDate(p.paid_at)}</span></div>
                          <button className="icon-btn danger" aria-label="Hapus pembayaran" onClick={() => window.confirm('Batalkan pembayaran ini?') && act(() => api.del(`/admin/payments/${p.id}`))}><Trash2 size={16} /></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }}
    </Async>
  );
}
