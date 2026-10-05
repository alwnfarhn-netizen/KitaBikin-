import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { INVOICE_STATUSES } from '../../lib/constants';
import { formatDate, rupiah, todayISO } from '../../lib/format';
import { Async, EmptyState, Field, FormError, InvoiceBadge, Modal, PageHeader } from '../../components/ui';

function NewInvoiceModal({ clients, projects, presetProject, onClose }) {
  const navigate = useNavigate();
  const preset = projects.find((p) => p.id === Number(presetProject));
  const [clientId, setClientId] = useState(preset?.client_id ?? clients[0]?.id ?? '');
  const [projectId, setProjectId] = useState(preset?.id ?? '');
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ description: '', qty: 1, price: '' }]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const clientProjects = projects.filter((p) => p.client_id === Number(clientId));
  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const setItem = (idx, k, v) => setItems(items.map((it, i) => (i === idx ? { ...it, [k]: v } : it)));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/admin/invoices', {
        clientId: Number(clientId), projectId: projectId ? Number(projectId) : null, issueDate, dueDate: dueDate || null, notes,
        items: items.map((i) => ({ description: i.description, qty: Number(i.qty) || 1, price: Number(i.price) || 0 })),
      });
      navigate(`/admin/kasir/${res.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Invoice Baru (Kasir)" onClose={onClose} wide>
      <form onSubmit={submit}>
        <FormError error={error} />
        <div className="form-row">
          <Field label="Klien">
            <select className="input-field" required value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId(''); }}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` — ${c.organization}` : ''}</option>)}
            </select>
          </Field>
          <Field label="Proyek (opsional)">
            <select className="input-field" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— Tanpa proyek —</option>
              {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Tanggal terbit"><input type="date" className="input-field" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></Field>
          <Field label="Jatuh tempo"><input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
        </div>

        <span className="input-label">Item</span>
        <div className="pos-items">
          {items.map((it, idx) => (
            <div className="pos-row" key={idx}>
              <input className="input-field" required placeholder="Deskripsi (mis. DP 50% Website)" value={it.description} onChange={(e) => setItem(idx, 'description', e.target.value)} aria-label="Deskripsi item" />
              <input className="input-field" type="number" min="1" value={it.qty} onChange={(e) => setItem(idx, 'qty', e.target.value)} aria-label="Qty" />
              <input className="input-field" type="number" min="0" required placeholder="Harga" value={it.price} onChange={(e) => setItem(idx, 'price', e.target.value)} aria-label="Harga" />
              <button type="button" className="icon-btn danger" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== idx))} aria-label="Hapus item"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost" style={{ marginTop: '0.5rem' }} onClick={() => setItems([...items, { description: '', qty: 1, price: '' }])}><Plus size={14} /> Tambah item</button>

        <div className="pos-total"><span>Total</span><span>{rupiah(total)}</span></div>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Catatan"><textarea rows="2" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Info rekening, syarat pembayaran, dll." /></Field>
        </div>
        <button className="btn btn-primary" disabled={busy || total <= 0}><Receipt size={16} /> Terbitkan Invoice</button>
      </form>
    </Modal>
  );
}

export default function Invoices() {
  const [params, setParams] = useSearchParams();
  const state = useAsync(async () => {
    const [i, c, p] = await Promise.all([api.get('/admin/invoices'), api.get('/admin/clients'), api.get('/admin/projects')]);
    return { invoices: i.invoices, clients: c.clients.filter((x) => x.active), projects: p.projects };
  });
  const [filter, setFilter] = useState(params.get('status') || 'semua');
  const [creating, setCreating] = useState(params.get('baru') === '1');

  useEffect(() => { if (params.get('baru')) { const n = new URLSearchParams(params); n.delete('baru'); setParams(n, { replace: true }); } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return (
    <>
      <PageHeader title="Kasir / POS" subtitle="Terbitkan invoice, catat pembayaran tunai, transfer, atau QRIS."
        actions={<button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={18} /> Invoice Baru</button>} />
      <Async state={state}>
        {({ invoices, clients, projects }) => {
          const shown = filter === 'semua' ? invoices : invoices.filter((i) => i.status === filter);
          const outstanding = invoices.filter((i) => ['belum', 'sebagian'].includes(i.status)).reduce((s, i) => s + i.total - i.paid, 0);
          return (
            <>
              <div className="dash-grid cols-3" style={{ marginBottom: '1.5rem' }}>
                <div className="dash-card"><div className="stat-value">{rupiah(invoices.filter((i) => i.status !== 'batal').reduce((s, i) => s + i.total, 0))}</div><div className="stat-label">Total ditagihkan</div></div>
                <div className="dash-card"><div className="stat-value" style={{ color: '#059669' }}>{rupiah(invoices.reduce((s, i) => s + i.paid, 0))}</div><div className="stat-label">Total diterima</div></div>
                <div className="dash-card"><div className="stat-value" style={{ color: '#dc2626' }}>{rupiah(outstanding)}</div><div className="stat-label">Belum dibayar</div></div>
              </div>
              <div className="filter-bar">
                {['semua', ...Object.keys(INVOICE_STATUSES)].map((k) => (
                  <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
                    {k === 'semua' ? 'Semua' : INVOICE_STATUSES[k].label} ({k === 'semua' ? invoices.length : invoices.filter((i) => i.status === k).length})
                  </button>
                ))}
              </div>
              <div className="dash-card">
                {shown.length === 0 ? <EmptyState icon={Receipt} title="Belum ada invoice" hint="Klik “Invoice Baru” untuk menerbitkan tagihan." /> : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Nomor</th><th>Klien</th><th>Terbit</th><th className="num">Total</th><th className="num">Dibayar</th><th>Status</th></tr></thead>
                      <tbody>
                        {shown.map((i) => (
                          <tr key={i.id}>
                            <td><Link className="row-link" to={`/admin/kasir/${i.id}`}>{i.number}</Link><span className="cell-sub">{i.project_title || '—'}</span></td>
                            <td>{i.client_name}<span className="cell-sub">{i.client_org || ''}</span></td>
                            <td>{formatDate(i.issue_date)}</td>
                            <td className="num">{rupiah(i.total)}</td>
                            <td className="num">{rupiah(i.paid)}</td>
                            <td><InvoiceBadge status={i.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {creating && (clients.length
                ? <NewInvoiceModal clients={clients} projects={projects} presetProject={params.get('proyek')} onClose={() => setCreating(false)} />
                : <Modal title="Belum ada klien" onClose={() => setCreating(false)}><p className="mb-4">Buat akun klien terlebih dahulu.</p><Link className="btn btn-primary" to="/admin/klien">Ke halaman Klien</Link></Modal>)}
            </>
          );
        }}
      </Async>
    </>
  );
}
