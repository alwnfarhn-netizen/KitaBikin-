import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Receipt, CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatDate, rupiah } from '../../lib/format';
import { Async, EmptyState, InvoiceBadge, PageHeader } from '../../components/ui';
import InvoiceDocument from '../../components/InvoiceDocument';

export function ClientInvoices() {
  const state = useAsync(() => api.get('/client/invoices'));
  return (
    <>
      <PageHeader title="Tagihan" subtitle="Riwayat invoice dan status pembayaran Anda." />
      <div className="dash-card">
        <Async state={state}>
          {({ invoices }) => invoices.length === 0 ? <EmptyState icon={Receipt} title="Belum ada tagihan" /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Nomor</th><th>Proyek</th><th>Jatuh tempo</th><th className="num">Total</th><th className="num">Sisa</th><th>Status</th></tr></thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td><Link className="row-link" to={`/klien/tagihan/${i.id}`}>{i.number}</Link><span className="cell-sub">{formatDate(i.issue_date)}</span></td>
                      <td>{i.project_title || '—'}</td>
                      <td>{formatDate(i.due_date)}</td>
                      <td className="num">{rupiah(i.total)}</td>
                      <td className="num">{rupiah(i.status === 'batal' ? 0 : i.total - i.paid)}</td>
                      <td><InvoiceBadge status={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </div>
    </>
  );
}

export function ClientInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAsync(() => api.get(`/client/invoices/${id}`), [id]);
  const [showModal, setShowModal] = useState(false);

  return (
    <Async state={state}>
      {({ invoice }) => (
        <>
          <div className="flex justify-between items-center flex-wrap gap-4 no-print" style={{ marginBottom: '1.25rem' }}>
            <Link to="/klien/tagihan" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} /> Semua tagihan</Link>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {(invoice.status === 'belum' || invoice.status === 'sebagian') && (
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setShowModal(true)} 
                >
                  <CreditCard size={16} /> Bayar Sekarang
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={16} /> Cetak / PDF</button>
            </div>
          </div>
          <InvoiceDocument invoice={invoice} />

          {/* Modal Transfer Manual */}
          {showModal && (
            <div className="modal-backdrop" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
              <div className="modal-content dash-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, width: '90%', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Instruksi Pembayaran</h3>
                <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Untuk sementara, silakan lakukan transfer manual ke rekening berikut:
                  <br /><br />
                  <strong>Bank:</strong> SeaBank<br />
                  <strong>No. Rekening:</strong> 9012345678 (Ganti ini nanti)<br />
                  <strong>Atas Nama:</strong> Alwan Farhan
                </p>
                <div style={{ backgroundColor: 'rgba(255,165,0,0.1)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
                  <small style={{ color: '#F97316' }}>
                    Mohon transfer sesuai dengan nominal tagihan (<strong>{rupiah(invoice.total - invoice.paid)}</strong>). Setelah transfer, mohon infokan melalui WhatsApp agar kami dapat memproses tagihan Anda.
                  </small>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>Tutup</button>
                  <a href="https://wa.me/6285128071828" target="_blank" rel="noreferrer" className="btn btn-primary">Konfirmasi ke WA</a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Async>
  );
}
