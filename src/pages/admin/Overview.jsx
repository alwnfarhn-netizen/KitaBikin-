import { Link } from 'react-router-dom';
import { Inbox, FolderKanban, Users, Wallet, Receipt, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { rupiah, timeAgo } from '../../lib/format';
import { Async, EmptyState, LeadBadge, PageHeader, ProgressBar, StageBadge } from '../../components/ui';

const Stat = ({ icon: Icon, tone, value, label, to }) => {
  const body = (
    <div className="dash-card stat-card">
      <div className={`stat-icon tone-${tone}`}><Icon size={24} /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

export default function Overview() {
  const state = useAsync(() => api.get('/admin/stats'));
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Ringkasan bisnis Kawakita hari ini." />
      <Async state={state}>
        {(s) => (
          <div className="stack">
            <div className="dash-grid cols-3">
              <Stat to="/admin/leads" icon={Inbox} tone="primary" value={s.leadsNew} label="Leads baru" />
              <Stat to="/admin/proyek" icon={FolderKanban} tone="blue" value={s.projectsActive} label="Proyek berjalan" />
              <Stat icon={CheckCircle2} tone="success" value={s.projectsDone} label="Proyek selesai" />
              <Stat to="/admin/klien" icon={Users} tone="blue" value={s.clients} label="Klien aktif" />
              <Stat to="/admin/kasir" icon={Wallet} tone="success" value={rupiah(s.revenueMonth)} label="Pendapatan bulan ini" />
              <Stat to="/admin/kasir?status=belum" icon={Receipt} tone="danger" value={rupiah(s.receivable)} label="Piutang (belum dibayar)" />
            </div>

            <div className="dash-grid main-side">
              <div className="dash-card">
                <div className="flex justify-between items-center mb-4">
                  <h2 style={{ margin: 0 }}>Proyek Terbaru</h2>
                  <Link to="/admin/proyek" className="btn-ghost">Lihat semua</Link>
                </div>
                {s.recentProjects.length === 0 ? (
                  <EmptyState title="Belum ada proyek" hint="Konversi lead menjadi proyek untuk memulai." />
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Proyek</th><th>Tahap</th><th style={{ width: 140 }}>Progres</th></tr></thead>
                      <tbody>
                        {s.recentProjects.map((p) => (
                          <tr key={p.id}>
                            <td><Link className="row-link" to={`/admin/proyek/${p.id}`}>{p.title}</Link><span className="cell-sub">{p.client_org || p.client_name} · {p.code}</span></td>
                            <td><StageBadge stage={p.stage} /></td>
                            <td><ProgressBar value={p.progress} /><span className="cell-sub">{p.progress}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="stack">
                <div className="dash-card">
                  <h2>Leads Terbaru</h2>
                  {s.recentLeads.length === 0 ? (
                    <EmptyState title="Belum ada lead" />
                  ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                      {s.recentLeads.map((l) => (
                        <li key={l.id} className="flex justify-between items-center gap-2">
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ color: 'var(--secondary)' }}>{l.name}</strong>
                            <span className="cell-sub">{l.service} · {timeAgo(l.created_at)}</span>
                          </div>
                          <LeadBadge status={l.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="dash-card">
                  <h2>Proyek per Tahap</h2>
                  {s.byStage.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>Belum ada data.</span> : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {s.byStage.map((b) => (
                        <li key={b.stage} className="flex justify-between items-center">
                          <StageBadge stage={b.stage} /><strong>{b.count}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
