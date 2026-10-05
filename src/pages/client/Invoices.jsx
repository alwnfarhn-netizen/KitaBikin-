import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Receipt } from 'lucide-react';
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
  const state = useAsync(() => api.get(`/client/invoices/${id}`), [id]);
  return (
    <Async state={state}>
      {({ invoice }) => (
        <>
          <div className="flex justify-between items-center flex-wrap gap-4 no-print" style={{ marginBottom: '1.25rem' }}>
            <Link to="/klien/tagihan" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} /> Semua tagihan</Link>
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={16} /> Cetak / Simpan PDF</button>
          </div>
          <InvoiceDocument invoice={invoice} />
        </>
      )}
    </Async>
  );
}
