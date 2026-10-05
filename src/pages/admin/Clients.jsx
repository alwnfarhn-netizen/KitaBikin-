import { useState } from 'react';
import { Plus, Users, KeyRound, Power } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatDate } from '../../lib/format';
import { Async, Badge, EmptyState, Field, FormError, Modal, PageHeader } from '../../components/ui';
import PasswordReveal from '../../components/PasswordReveal';

const blank = { name: '', email: '', phone: '', organization: '', password: '' };

function ClientModal({ client, onClose, onSaved }) {
  const editing = Boolean(client);
  const [form, setForm] = useState(client ? { ...blank, ...client, phone: client.phone ?? '', organization: client.organization ?? '' } : blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, organization: form.organization };
      if (editing) {
        await api.patch(`/admin/clients/${client.id}`, payload);
        onSaved(null);
      } else {
        const res = await api.post('/admin/clients', { ...payload, ...(form.password ? { password: form.password } : {}) });
        onSaved(res.generatedPassword ? { email: form.email, password: res.generatedPassword } : null);
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit Klien' : 'Klien Baru'} onClose={onClose}>
      <form onSubmit={submit}>
        <FormError error={error} />
        <Field label="Nama"><input className="input-field" required value={form.name} onChange={set('name')} /></Field>
        <Field label="Email (untuk login)"><input type="email" className="input-field" required value={form.email} onChange={set('email')} /></Field>
        <div className="form-row">
          <Field label="Telepon"><input className="input-field" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Instansi / Bisnis"><input className="input-field" value={form.organization} onChange={set('organization')} /></Field>
        </div>
        {!editing && (
          <Field label="Password" hint="Kosongkan agar dibuat otomatis (min. 8 karakter jika diisi)."><input type="text" minLength={8} className="input-field" value={form.password} onChange={set('password')} /></Field>
        )}
        <button className="btn btn-primary" disabled={busy}>{editing ? 'Simpan' : 'Buat Akun'}</button>
      </form>
    </Modal>
  );
}

export default function Clients() {
  const state = useAsync(() => api.get('/admin/clients'));
  const [modal, setModal] = useState(null); // null | 'new' | client
  const [reveal, setReveal] = useState(null);

  const toggle = async (c) => {
    if (c.active && !window.confirm(`Nonaktifkan akses ${c.name}?`)) return;
    await api.patch(`/admin/clients/${c.id}`, { active: !c.active });
    state.reload();
  };
  const reset = async (c) => {
    if (!window.confirm(`Reset password ${c.name}? Password lama tidak berlaku lagi.`)) return;
    const res = await api.patch(`/admin/clients/${c.id}`, { resetPassword: true });
    setReveal({ email: c.email, password: res.generatedPassword });
  };

  return (
    <>
      <PageHeader title="Klien" subtitle="Kelola akun klien untuk portal progres & tagihan."
        actions={<button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={18} /> Klien Baru</button>} />
      <div className="dash-card">
        <Async state={state}>
          {({ clients }) => clients.length === 0 ? (
            <EmptyState icon={Users} title="Belum ada klien" hint="Buat akun klien atau konversi dari lead." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Klien</th><th>Kontak</th><th>Proyek</th><th>Bergabung</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td><strong style={{ color: 'var(--secondary)' }}>{c.name}</strong><span className="cell-sub">{c.organization || '—'}</span></td>
                      <td>{c.email}<span className="cell-sub">{c.phone || '—'}</span></td>
                      <td>{c.project_count}</td>
                      <td>{formatDate(c.created_at)}</td>
                      <td><Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button className="btn-ghost" onClick={() => setModal(c)}>Edit</button>
                        <button className="icon-btn" onClick={() => reset(c)} title="Reset password" aria-label="Reset password"><KeyRound size={18} /></button>
                        <button className="icon-btn danger" onClick={() => toggle(c)} title={c.active ? 'Nonaktifkan' : 'Aktifkan'} aria-label="Ubah status akun"><Power size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </div>
      {modal && (
        <ClientModal client={modal === 'new' ? null : modal} onClose={() => setModal(null)}
          onSaved={(secret) => { setModal(null); state.reload(); if (secret) setReveal(secret); }} />
      )}
      {reveal && <PasswordReveal {...reveal} onClose={() => setReveal(null)} />}
    </>
  );
}
