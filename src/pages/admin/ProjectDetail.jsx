import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Trash2, Copy, ExternalLink, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../context/AuthContext';
import { SERVICES, STAGES } from '../../lib/constants';
import { formatDate, rupiah } from '../../lib/format';
import { Async, Field, FormError, InvoiceBadge, Modal, ProgressBar, StageBadge } from '../../components/ui';
import { ChatBox, StageStepper, UpdateTimeline } from '../../components/ProjectParts';

function EditModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title, service: project.service, description: project.description ?? '',
    budget: project.budget, startDate: project.start_date ?? '', dueDate: project.due_date ?? '',
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/projects/${project.id}`, { ...form, budget: Number(form.budget) || 0, startDate: form.startDate || null, dueDate: form.dueDate || null });
      onSaved();
    } catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Edit Proyek" onClose={onClose}>
      <form onSubmit={submit}>
        <FormError error={error} />
        <Field label="Judul"><input className="input-field" required value={form.title} onChange={set('title')} /></Field>
        <Field label="Layanan"><select className="input-field" value={form.service} onChange={set('service')}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <div className="form-row">
          <Field label="Mulai"><input type="date" className="input-field" value={form.startDate} onChange={set('startDate')} /></Field>
          <Field label="Target selesai"><input type="date" className="input-field" value={form.dueDate} onChange={set('dueDate')} /></Field>
        </div>
        <Field label="Anggaran (Rp)"><input type="number" min="0" className="input-field" value={form.budget} onChange={set('budget')} /></Field>
        <Field label="Deskripsi"><textarea rows="3" className="input-field" value={form.description} onChange={set('description')} /></Field>
        <button className="btn btn-primary">Simpan</button>
      </form>
    </Modal>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useAsync(() => api.get(`/admin/projects/${id}`), [id]);
  const [msTitle, setMsTitle] = useState('');
  const [upd, setUpd] = useState({ title: '', body: '' });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const act = async (fn) => {
    setError('');
    try { await fn(); await state.reload(); } catch (err) { setError(err.message); }
  };

  return (
    <Async state={state}>
      {({ project: p, invoices }) => {
        const trackUrl = `${window.location.origin}/lacak?kode=${p.code}`;
        return (
          <>
            <Link to="/admin/proyek" className="btn-ghost no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}><ArrowLeft size={16} /> Semua proyek</Link>
            <div className="dash-page-header">
              <div>
                <small style={{ color: 'var(--text-muted)' }}>{p.code} · {p.service}</small>
                <h1 className="dash-title">{p.title}</h1>
                <p className="dash-subtitle">{p.client_name}{p.client_org ? ` — ${p.client_org}` : ''}</p>
              </div>
              <div className="dash-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-outline btn-sm btn-danger-ghost" onClick={async () => {
                  if (!window.confirm('Hapus proyek ini beserta milestone & update-nya?')) return;
                  await api.del(`/admin/projects/${p.id}`);
                  navigate('/admin/proyek');
                }}>Hapus</button>
              </div>
            </div>
            <FormError error={error} />

            <div className="dash-grid main-side">
              <div className="stack">
                <div className="dash-card">
                  <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                    <h2 style={{ margin: 0 }}>Progres</h2>
                    <select className="input-field input-sm" value={p.stage} aria-label="Tahap proyek"
                      onChange={(e) => act(() => api.patch(`/admin/projects/${p.id}`, { stage: e.target.value }))}>
                      {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between mb-2" style={{ fontWeight: 600 }}><span>Penyelesaian</span><span style={{ color: 'var(--primary)' }}>{p.progress}%</span></div>
                  <ProgressBar value={p.progress} size="lg" />
                  <StageStepper stage={p.stage} />
                  {p.milestones.length === 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <Field label="Progres manual (tanpa milestone)">
                        <input type="range" min="0" max="100" value={p.progress} style={{ width: '100%' }}
                          onChange={(e) => act(() => api.patch(`/admin/projects/${p.id}`, { progress: Number(e.target.value) }))} />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="dash-card">
                  <h2>Milestone</h2>
                  <ul className="milestones">
                    {p.milestones.map((m) => (
                      <li key={m.id} className={`milestone ${m.done ? 'done' : ''}`}>
                        <button className={`check ${m.done ? 'on' : ''}`} aria-label={m.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                          onClick={() => act(() => api.patch(`/admin/milestones/${m.id}`, { done: !m.done }))}><Check size={14} /></button>
                        <span>{m.title}</span>
                        <button className="icon-btn danger" aria-label="Hapus milestone" onClick={() => act(() => api.del(`/admin/milestones/${m.id}`))}><Trash2 size={16} /></button>
                      </li>
                    ))}
                  </ul>
                  <form className="chat-form" style={{ marginTop: '1rem' }} onSubmit={(e) => {
                    e.preventDefault();
                    if (!msTitle.trim()) return;
                    act(async () => { await api.post(`/admin/projects/${p.id}/milestones`, { title: msTitle }); setMsTitle(''); });
                  }}>
                    <input className="input-field" placeholder="Tambah milestone baru…" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} aria-label="Judul milestone" />
                    <button className="btn btn-outline btn-sm" type="submit"><Plus size={16} /> Tambah</button>
                  </form>
                </div>

                <div className="dash-card">
                  <h2>Update untuk Klien</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    act(async () => { await api.post(`/admin/projects/${p.id}/updates`, upd); setUpd({ title: '', body: '' }); });
                  }} style={{ marginBottom: '1.5rem' }}>
                    <Field label="Judul update"><input className="input-field" required minLength={2} value={upd.title} onChange={(e) => setUpd({ ...upd, title: e.target.value })} placeholder="Contoh: Desain halaman beranda selesai" /></Field>
                    <Field label="Keterangan (opsional)"><textarea rows="2" className="input-field" value={upd.body} onChange={(e) => setUpd({ ...upd, body: e.target.value })} /></Field>
                    <button className="btn btn-primary btn-sm">Posting Update</button>
                  </form>
                  <UpdateTimeline updates={p.updates} onDelete={(u) => act(() => api.del(`/admin/updates/${u.id}`))} />
                </div>

                <div className="dash-card">
                  <h2>Pesan dengan Klien</h2>
                  <ChatBox messages={p.messages} currentUserId={user.id} basePath={`/admin/projects/${p.id}`} onSent={state.reload} />
                </div>
              </div>

              <div className="stack">
                <div className="dash-card">
                  <h2>Detail</h2>
                  <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.6rem 1rem', fontSize: '0.93rem' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>Tahap</dt><dd><StageBadge stage={p.stage} /></dd>
                    <dt style={{ color: 'var(--text-muted)' }}>Anggaran</dt><dd>{rupiah(p.budget)}</dd>
                    <dt style={{ color: 'var(--text-muted)' }}>Mulai</dt><dd>{formatDate(p.start_date)}</dd>
                    <dt style={{ color: 'var(--text-muted)' }}>Target</dt><dd>{formatDate(p.due_date)}</dd>
                  </dl>
                  {p.description && <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.93rem' }}>{p.description}</p>}
                </div>

                <div className="dash-card">
                  <h2>Tautan Pelacakan</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Bagikan ke klien agar bisa cek progres tanpa login.</p>
                  <code style={{ display: 'block', background: '#faf8f4', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.8rem', wordBreak: 'break-all' }}>{trackUrl}</code>
                  <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={async () => { await navigator.clipboard?.writeText(trackUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Tersalin' : 'Salin'}
                    </button>
                    <a className="btn btn-outline btn-sm" href={trackUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Buka</a>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 style={{ margin: 0 }}>Tagihan</h2>
                    <Link to={`/admin/kasir?baru=1&proyek=${p.id}`} className="btn-ghost"><Receipt size={14} /> Buat</Link>
                  </div>
                  {invoices.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>Belum ada tagihan.</span> : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {invoices.map((i) => (
                        <li key={i.id} className="flex justify-between items-center gap-2">
                          <div><Link className="row-link" to={`/admin/kasir/${i.id}`}>{i.number}</Link><span className="cell-sub">{rupiah(i.total)}</span></div>
                          <InvoiceBadge status={i.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            {editing && <EditModal project={p} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); state.reload(); }} />}
          </>
        );
      }}
    </Async>
  );
}
