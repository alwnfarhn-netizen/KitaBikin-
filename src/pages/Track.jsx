import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, Circle, Loader2, PackageSearch } from 'lucide-react';
import { api } from '../lib/api';
import { useSEO } from '../lib/seo';
import { formatDate, timeAgo } from '../lib/format';
import { ProgressBar, StageBadge, FormError } from '../components/ui';
import { StageStepper } from '../components/ProjectParts';

export default function Track() {
  useSEO({
    title: 'Lacak Progres Proyek',
    description: 'Cek progres pembuatan website, sistem, atau media pembelajaran Anda secara real-time dengan kode proyek KitaBikin.',
    path: '/lacak',
  });
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('kode') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async (value) => {
    const c = value.trim().toUpperCase();
    if (!c) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await api.get(`/public/track/${encodeURIComponent(c)}`));
      setParams({ kode: c }, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const initial = params.get('kode');
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    lookup(code);
  };

  return (
    <div className="section" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div className="text-center mb-8">
          <div className="handwritten mb-2">Transparan & Real-time</div>
          <h1>Lacak Progres Proyek</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Masukkan kode proyek yang Anda terima dari tim KitaBikin (contoh: <strong>KB-7F3K2A</strong>).
          </p>
        </div>

        <form onSubmit={submit} className="card" style={{ flexDirection: 'row', gap: '0.75rem', padding: '1rem', height: 'auto' }}>
          <input id="track-code" className="input-field" style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            placeholder="KB-XXXXXX" value={code} onChange={(e) => setCode(e.target.value)} maxLength={12} aria-label="Kode proyek" />
          <button id="track-submit" className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? <Loader2 className="spin" size={18} style={{ color: '#fff' }} /> : <Search size={18} />} Lacak
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <FormError error={error} />
        </div>

        {result && (
          <div className="card animate-fade-up" style={{ marginTop: '1.5rem', height: 'auto' }}>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
              <div>
                <small style={{ color: 'var(--text-muted)' }}>{result.project.code} · {result.project.service}</small>
                <h2 style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>{result.project.title}</h2>
              </div>
              <StageBadge stage={result.project.stage} />
            </div>

            <div className="flex justify-between mb-2" style={{ fontWeight: 600 }}>
              <span>Progres</span><span style={{ color: 'var(--primary)' }}>{result.project.progress}%</span>
            </div>
            <ProgressBar value={result.project.progress} size="lg" />
            <StageStepper stage={result.project.stage} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Target selesai: {formatDate(result.project.due_date)} · Diperbarui {timeAgo(result.project.updated_at)}
            </p>

            {result.milestones.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.1rem', margin: '1.75rem 0 0.75rem' }}>Milestone</h3>
                <ul className="milestones">
                  {result.milestones.map((m) => (
                    <li key={m.title} className={`milestone ${m.done ? 'done' : ''}`}>
                      {m.done ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} color="var(--border)" />}
                      <span>{m.title}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.updates.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.1rem', margin: '1.75rem 0 0.75rem' }}>Kabar Terbaru</h3>
                <ul className="timeline">
                  {result.updates.map((u) => (
                    <li key={u.title + u.created_at}>
                      <strong>{u.title}</strong>
                      <small>{timeAgo(u.created_at)}</small>
                      {u.body && <p>{u.body}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {!result && !error && !busy && (
          <div className="dash-state" style={{ marginTop: '2rem' }}>
            <PackageSearch size={48} strokeWidth={1.3} />
            <span>Hasil pelacakan akan tampil di sini.</span>
          </div>
        )}
      </div>
    </div>
  );
}
