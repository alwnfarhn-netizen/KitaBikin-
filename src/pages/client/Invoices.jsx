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
  const [paying, setPaying] = useState(false);

  const handlePay = async (invoice) => {
    try {
      setPaying(true);
      const { token } = await api.post(`/client/invoices/${invoice.id}/pay`);
      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: () => {
            alert('Pembayaran berhasil!');
            window.location.reload();
          },
          onPending: () => {
            alert('Menunggu pembayaran Anda...');
          },
          onError: () => {
            alert('Pembayaran gagal, silakan coba lagi.');
          },
          onClose: () => {
            // closed popup
          }
        });
      } else {
        alert('Gagal memuat sistem pembayaran.');
      }
    } catch (e) {
      alert(e.message || 'Gagal memulai pembayaran.');
    } finally {
      setPaying(false);
    }
  };

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
                  onClick={() => handlePay(invoice)} 
                  disabled={paying}
                >
                  <CreditCard size={16} /> {paying ? 'Memproses...' : 'Bayar Online'}
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={16} /> Cetak / PDF</button>
            </div>
          </div>
          <InvoiceDocument invoice={invoice} />
        </>
      )}
    </Async>
  );
}
