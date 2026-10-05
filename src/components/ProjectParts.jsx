import { useState } from 'react';
import { Send } from 'lucide-react';
import { STAGE_FLOW } from '../lib/constants';
import { timeAgo } from '../lib/format';
import { api } from '../lib/api';
import { FormError } from './ui';

export function StageStepper({ stage }) {
  const idx = STAGE_FLOW.indexOf(stage);
  const labels = { briefing: 'Briefing', desain: 'Desain', pengembangan: 'Coding', revisi: 'Revisi', peluncuran: 'Rilis', selesai: 'Selesai' };
  return (
    <div className="stepper" aria-label="Tahapan proyek">
      {STAGE_FLOW.map((s, i) => (
        <div key={s} className={`step ${i < idx || stage === 'selesai' ? 'past' : ''} ${i === idx ? 'current' : ''}`}>
          {labels[s]}
        </div>
      ))}
    </div>
  );
}

export function UpdateTimeline({ updates, onDelete }) {
  if (!updates.length) return <p style={{ color: 'var(--text-muted)' }}>Belum ada update.</p>;
  return (
    <ul className="timeline">
      {updates.map((u) => (
        <li key={u.id}>
          <div className="flex justify-between items-center gap-2">
            <strong>{u.title}</strong>
            {onDelete && (
              <button className="btn-ghost btn-danger-ghost" onClick={() => onDelete(u)}>Hapus</button>
            )}
          </div>
          <small>{timeAgo(u.created_at)}</small>
          {u.body && <p>{u.body}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Obrolan per proyek. `basePath` contoh: /admin/projects/3 atau /client/projects/3 */
export function ChatBox({ messages, currentUserId, basePath, onSent }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError('');
    try {
      await api.post(`${basePath}/messages`, { body });
      setBody('');
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="chat">
        {messages.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Belum ada pesan. Mulai percakapan di bawah.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.sender_id === currentUserId ? 'me' : ''}`}>
            {m.body}
            <small>{m.sender_name}{m.sender_role === 'admin' ? ' (Tim KitaBikin)' : ''} · {timeAgo(m.created_at)}</small>
          </div>
        ))}
      </div>
      <FormError error={error} />
      <form className="chat-form" onSubmit={send}>
        <input className="input-field" placeholder="Tulis pesan atau permintaan revisi…" value={body}
          onChange={(e) => setBody(e.target.value)} maxLength={2000} aria-label="Pesan" />
        <button className="btn btn-primary" type="submit" disabled={busy || !body.trim()} aria-label="Kirim pesan">
          <Send size={16} /> Kirim
        </button>
      </form>
    </div>
  );
}
