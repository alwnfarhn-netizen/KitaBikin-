import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { SERVICES, STAGES } from '../../lib/constants';
import { formatDate, rupiah } from '../../lib/format';
import { Async, EmptyState, Field, FormError, Modal, PageHeader, ProgressBar, StageBadge } from '../../components/ui';

function NewProjectModal({ clients, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ clientId: clients[0]?.id ?? '', title: '', service: SERVICES[0], budget: '', dueDate: '', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/admin/projects', {
        ...form, clientId: Number(form.clientId), budget: Number(form.budget) || 0, dueDate: form.dueDate || null,
      });
      navigate(`/admin/proyek/${res.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Proyek Baru" onClose={onClose} wide>
      <form onSubmit={submit}>
        <FormError error={error} />
        <div className="form-row">
          <Field label="Klien">
            <select className="input-field" required value={form.clientId} onChange={set('clientId')}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` — ${c.organization}` : ''}</option>)}
            </select>
          </Field>
          <Field label="Layanan">
            <select className="input-field" value={form.service} onChange={set('service')}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        </div>
        <Field label="Judul proyek"><input className="input-field" required minLength={3} value={form.title} onChange={set('title')} placeholder="Contoh: Website Profil Sekolah" /></Field>
        <div className="form-row">
          <Field label="Anggaran (Rp)"><input type="number" min="0" className="input-field" value={form.budget} onChange={set('budget')} /></Field>
          <Field label="Target selesai"><input type="date" className="input-field" value={form.dueDate} onChange={set('dueDate')} /></Field>
        </div>
        <Field label="Deskripsi"><textarea rows="3" className="input-field" value={form.description} onChange={set('description')} /></Field>
        <button className="btn btn-primary" disabled={busy}><Plus size={16} /> Buat Proyek</button>
      </form>
    </Modal>
  );
}

export default function Projects() {
  const state = useAsync(async () => {
    const [p, c] = await Promise.all([api.get('/admin/projects'), api.get('/admin/clients')]);
    return { projects: p.projects, clients: c.clients.filter((x) => x.active) };
  });
  const [filter, setFilter] = useState('semua');
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader title="Proyek" subtitle="Semua proyek klien beserta progresnya."
        actions={<button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={18} /> Proyek Baru</button>} />
      <Async state={state}>
        {({ projects, clients }) => {
          const shown = filter === 'semua' ? projects : projects.filter((p) => p.stage === filter);
          return (
            <>
              <div className="filter-bar">
                {['semua', ...Object.keys(STAGES)].map((k) => (
                  <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
                    {k === 'semua' ? 'Semua' : STAGES[k].label} ({k === 'semua' ? projects.length : projects.filter((p) => p.stage === k).length})
                  </button>
                ))}
              </div>
              <div className="dash-card">
                {shown.length === 0 ? (
                  <EmptyState icon={FolderKanban} title="Belum ada proyek" hint="Buat proyek baru atau konversi dari Leads." />
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Proyek</th><th>Klien</th><th>Tahap</th><th style={{ width: 150 }}>Progres</th><th>Target</th><th className="num">Anggaran</th></tr></thead>
                      <tbody>
                        {shown.map((p) => (
                          <tr key={p.id}>
                            <td><Link className="row-link" to={`/admin/proyek/${p.id}`}>{p.title}</Link><span className="cell-sub">{p.code} · {p.service}</span></td>
                            <td>{p.client_name}<span className="cell-sub">{p.client_org || '—'}</span></td>
                            <td><StageBadge stage={p.stage} /></td>
                            <td><ProgressBar value={p.progress} /><span className="cell-sub">{p.progress}%</span></td>
                            <td>{formatDate(p.due_date)}</td>
                            <td className="num">{rupiah(p.budget)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {creating && (clients.length ? <NewProjectModal clients={clients} onClose={() => setCreating(false)} /> : (
                <Modal title="Belum ada klien" onClose={() => setCreating(false)}>
                  <p className="mb-4">Buat akun klien terlebih dahulu sebelum membuat proyek.</p>
                  <Link className="btn btn-primary" to="/admin/klien">Ke halaman Klien</Link>
                </Modal>
              ))}
            </>
          );
        }}
      </Async>
    </>
  );
}
