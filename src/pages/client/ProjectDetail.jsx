import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../context/AuthContext';
import { formatDate, rupiah } from '../../lib/format';
import { Async, InvoiceBadge, ProgressBar, StageBadge } from '../../components/ui';
import { ChatBox, StageStepper, UpdateTimeline } from '../../components/ProjectParts';

export default function ClientProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const state = useAsync(() => api.get(`/client/projects/${id}`), [id]);

  return (
    <Async state={state}>
      {({ project: p, invoices }) => (
        <>
          <Link to="/klien" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}><ArrowLeft size={16} /> Kembali</Link>
          <div className="dash-page-header">
            <div>
              <small style={{ color: 'var(--text-muted)' }}>{p.code} · {p.service}</small>
              <h1 className="dash-title">{p.title}</h1>
              <p className="dash-subtitle">Target selesai {formatDate(p.due_date)}</p>
            </div>
            <StageBadge stage={p.stage} />
          </div>

          <div className="dash-grid main-side">
            <div className="stack">
              <div className="dash-card">
                <div className="flex justify-between mb-2" style={{ fontWeight: 600 }}><span>Progres proyek</span><span style={{ color: 'var(--primary)' }}>{p.progress}%</span></div>
                <ProgressBar value={p.progress} size="lg" />
                <StageStepper stage={p.stage} />
              </div>

              {p.milestones.length > 0 && (
                <div className="dash-card">
                  <h2>Milestone</h2>
                  <ul className="milestones">
                    {p.milestones.map((m) => (
                      <li key={m.id} className={`milestone ${m.done ? 'done' : ''}`}>
                        {m.done ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} color="#cbd5e1" />}
                        <span>{m.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="dash-card"><h2>Kabar Terbaru</h2><UpdateTimeline updates={p.updates} /></div>

              <div className="dash-card">
                <h2>Pesan & Revisi</h2>
                <ChatBox messages={p.messages} currentUserId={user.id} basePath={`/client/projects/${p.id}`} onSent={state.reload} />
              </div>
            </div>

            <div className="stack">
              {p.description && <div className="dash-card"><h2>Deskripsi</h2><p style={{ color: 'var(--text-muted)' }}>{p.description}</p></div>}
              <div className="dash-card">
                <h2>Tagihan Proyek</h2>
                {invoices.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>Belum ada tagihan.</span> : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {invoices.map((i) => (
                      <li key={i.id} className="flex justify-between items-center gap-2">
                        <div><Link className="row-link" to={`/klien/tagihan/${i.id}`}>{i.number}</Link><span className="cell-sub">{rupiah(i.total)}</span></div>
                        <InvoiceBadge status={i.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Async>
  );
}
