import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, MessageCircle, Trash2, FolderPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { LEAD_STATUSES } from '../../lib/constants';
import { timeAgo } from '../../lib/format';
import { Async, EmptyState, Field, FormError, LeadBadge, Modal, PageHeader } from '../../components/ui';
import PasswordReveal from '../../components/PasswordReveal';

function ConvertModal({ lead, clients, onClose, onDone }) {
  const [mode, setMode] = useState('new');
  const [form, setForm] = useState({
    title: `${lead.service} — ${lead.name}`, budget: '', dueDate: '',
    clientId: clients[0]?.id ?? '',
    name: lead.name, email: '', phone: lead.contact && /^[\d+\-\s]+$/.test(lead.contact) ? lead.contact : '', organization: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { title: form.title, budget: Number(form.budget) || 0, dueDate: form.dueDate || null };
      if (mode === 'existing') body.clientId = Number(form.clientId);
      else body.newClient = { name: form.name, email: form.email, phone: form.phone, organization: form.organization };
      const res = await api.post(`/admin/leads/${lead.id}/convert`, body);
      onDone({ ...res, email: form.email });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Konversi Lead ke Proyek" onClose={onClose} wide>
      <form onSubmit={submit}>
        <FormError error={error} />
        <div className="filter-bar">
          <button type="button" className={`chip ${mode === 'new' ? 'active' : ''}`} onClick={() => setMode('new')}>Klien baru</button>
          <button type="button" className={`chip ${mode === 'existing' ? 'active' : ''}`} onClick={() => setMode('existing')} disabled={!clients.length}>Klien yang ada</button>
        </div>
        {mode === 'new' ? (
          <>
            <div className="form-row">
              <Field label="Nama klien"><input className="input-field" required value={form.name} onChange={set('name')} /></Field>
              <Field label="Email (untuk login)"><input type="email" className="input-field" required value={form.email} onChange={set('email')} /></Field>
            </div>
            <div className="form-row">
              <Field label="Telepon"><input className="input-field" value={form.phone} onChange={set('phone')} /></Field>
              <Field label="Instansi / Bisnis"><input className="input-field" value={form.organization} onChange={set('organization')} /></Field>
            </div>
          </>
        ) : (
          <Field label="Pilih klien">
            <select className="input-field" value={form.clientId} onChange={set('clientId')}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` — ${c.organization}` : ''}</option>)}
            </select>
          </Field>
        )}
        <Field label="Judul proyek"><input className="input-field" required minLength={3} value={form.title} onChange={set('title')} /></Field>
        <div className="form-row">
          <Field label="Anggaran (Rp)"><input type="number" min="0" className="input-field" value={form.budget} onChange={set('budget')} /></Field>
          <Field label="Target selesai"><input type="date" className="input-field" value={form.dueDate} onChange={set('dueDate')} /></Field>
        </div>
        <button className="btn btn-primary" disabled={busy}><FolderPlus size={16} /> Buat Proyek</button>
      </form>
    </Modal>
  );
}

export default function Leads() {
  const state = useAsync(async () => {
    const [l, c] = await Promise.all([api.get('/admin/leads'), api.get('/admin/clients')]);
    return { leads: l.leads, clients: c.clients };
  });
  const navigate = useNavigate();
  const [filter, setFilter] = useState('semua');
  const [converting, setConverting] = useState(null);
  const [reveal, setReveal] = useState(null);

  const setStatus = async (id, status) => { await api.patch(`/admin/leads/${id}`, { status }); state.reload(); };
  const remove = async (l) => {
    if (!window.confirm(`Hapus lead dari ${l.name}?`)) return;
    await api.del(`/admin/leads/${l.id}`);
    state.reload();
  };
  const wa = (l) => {
    const num = (l.contact || '').replace(/\D/g, '').replace(/^0/, '62');
    return num.length >= 9 ? `https://wa.me/${num}?text=${encodeURIComponent(`Halo ${l.name}, kami dari KitaBikin menindaklanjuti permintaan ${l.service} Anda.`)}` : null;
  };

  return (
    <>
      <PageHeader title="Leads / Pesanan Masuk" subtitle="Permintaan dari form order di website." />
      <Async state={state}>
        {({ leads, clients }) => {
          const shown = filter === 'semua' ? leads : leads.filter((l) => l.status === filter);
          return (
            <>
              <div className="filter-bar">
                {['semua', ...Object.keys(LEAD_STATUSES)].map((k) => (
                  <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
                    {k === 'semua' ? 'Semua' : LEAD_STATUSES[k].label}{' '}
                    ({k === 'semua' ? leads.length : leads.filter((l) => l.status === k).length})
                  </button>
                ))}
              </div>
              <div className="dash-card">
                {shown.length === 0 ? (
                  <EmptyState icon={Inbox} title="Tidak ada lead" hint="Lead baru muncul saat pengunjung mengisi form order." />
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Pemohon</th><th>Layanan</th><th>Kebutuhan</th><th>Status</th><th /></tr></thead>
                      <tbody>
                        {shown.map((l) => (
                          <tr key={l.id}>
                            <td><strong style={{ color: 'var(--secondary)' }}>{l.name}</strong><span className="cell-sub">{l.contact || '—'} · {timeAgo(l.created_at)}</span></td>
                            <td>{l.service}</td>
                            <td style={{ maxWidth: 320 }}>{l.description}</td>
                            <td>
                              {l.project_id ? <LeadBadge status={l.status} /> : (
                                <select className="input-field input-sm" value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} aria-label="Ubah status">
                                  {Object.entries(LEAD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              )}
                            </td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                              {wa(l) && <a className="icon-btn" href={wa(l)} target="_blank" rel="noreferrer" title="Chat WhatsApp" aria-label="Chat WhatsApp"><MessageCircle size={18} /></a>}
                              {l.project_id ? (
                                <button className="btn-ghost" onClick={() => navigate(`/admin/proyek/${l.project_id}`)}>Buka proyek</button>
                              ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => setConverting(l)}>Jadikan proyek</button>
                              )}
                              <button className="icon-btn danger" onClick={() => remove(l)} title="Hapus" aria-label="Hapus"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {converting && (
                <ConvertModal lead={converting} clients={clients} onClose={() => setConverting(null)}
                  onDone={(res) => {
                    setConverting(null);
                    state.reload();
                    if (res.generatedPassword) setReveal({ email: res.email, password: res.generatedPassword, projectId: res.projectId });
                    else navigate(`/admin/proyek/${res.projectId}`);
                  }} />
              )}
            </>
          );
        }}
      </Async>
      {reveal && <PasswordReveal email={reveal.email} password={reveal.password} onClose={() => { const id = reveal.projectId; setReveal(null); navigate(`/admin/proyek/${id}`); }} />}
    </>
  );
}
