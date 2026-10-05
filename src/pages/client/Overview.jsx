import { Link } from 'react-router-dom';
import { FolderKanban, Receipt, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../context/AuthContext';
import { formatDate, rupiah, timeAgo } from '../../lib/format';
import { Async, EmptyState, PageHeader, ProgressBar, StageBadge } from '../../components/ui';

export default function ClientOverview() {
  const { user } = useAuth();
  const state = useAsync(() => api.get('/client/overview'));
  return (
    <>
      <PageHeader title={`Halo, ${user.name.split(' ')[0]}! 👋`} subtitle="Pantau perkembangan proyek digital Anda di sini." />
      <Async state={state}>
        {({ projects, outstanding, unpaidInvoices }) => (
          <div className="stack">
            <div className="dash-grid cols-3">
              <div className="dash-card stat-card"><div className="stat-icon tone-blue"><FolderKanban size={24} /></div><div><div className="stat-value">{projects.length}</div><div className="stat-label">Proyek Anda</div></div></div>
              <div className="dash-card stat-card"><div className="stat-icon tone-danger"><Receipt size={24} /></div><div><div className="stat-value">{rupiah(outstanding)}</div><div className="stat-label">Tagihan belum lunas ({unpaidInvoices})</div></div></div>
              <Link to="/lacak" className="dash-card stat-card"><div className="stat-icon tone-primary"><ArrowRight size={24} /></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>Lacak publik</div><div className="stat-label">Bagikan kode ke tim Anda</div></div></Link>
            </div>

            <div className="dash-card">
              <h2>Proyek Saya</h2>
              {projects.length === 0 ? (
                <EmptyState icon={FolderKanban} title="Belum ada proyek" hint="Proyek akan tampil di sini setelah dibuat oleh tim Kawakita." />
              ) : (
                <div className="stack" style={{ gap: '1rem' }}>
                  {projects.map((p) => (
                    <Link key={p.id} to={`/klien/proyek/${p.id}`} className="dash-card" style={{ background: '#fffaf5', boxShadow: 'none' }}>
                      <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                        <div>
                          <strong style={{ color: 'var(--secondary)', fontSize: '1.05rem' }}>{p.title}</strong>
                          <span className="cell-sub">{p.code} · Target {formatDate(p.due_date)} · Diperbarui {timeAgo(p.updated_at)}</span>
                        </div>
                        <StageBadge stage={p.stage} />
                      </div>
                      <div className="flex items-center gap-4">
                        <div style={{ flex: 1 }}><ProgressBar value={p.progress} /></div>
                        <strong style={{ color: 'var(--primary)' }}>{p.progress}%</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
