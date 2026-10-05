import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../lib/seo';
import { FormError } from '../components/ui';

export default function Login() {
  useSEO({ title: 'Masuk', description: 'Masuk ke portal klien atau panel admin KitaBikin.', path: '/masuk', noindex: true });
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const showDemo = import.meta.env.DEV;

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/klien'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(form.email, form.password);
      const home = u.role === 'admin' ? '/admin' : '/klien';
      const from = location.state?.from;
      navigate(from && from.startsWith(home) ? from : home, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <Link to="/"><img src="/logo-full.svg" alt="KitaBikin" style={{ height: '42px', width: 'auto' }} /></Link>
        <h1>Selamat datang</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Masuk untuk memantau proyek, tagihan, dan progres Anda.</p>

        <form onSubmit={submit} noValidate>
          <FormError error={error} />
          <label className="input-group">
            <span className="input-label">Email</span>
            <input id="login-email" type="email" className="input-field" autoComplete="username" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" />
          </label>
          <label className="input-group">
            <span className="input-label">Password</span>
            <input id="login-password" type="password" className="input-field" autoComplete="current-password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </label>
          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? <Loader2 className="spin" size={18} style={{ color: '#fff' }} /> : <LogIn size={18} />} Masuk
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Belum punya akun? Akun dibuat oleh tim kami setelah proyek disepakati.{' '}
          <Link to="/order" style={{ color: 'var(--primary)', fontWeight: 600 }}>Konsultasi dulu</Link>
        </p>

        {showDemo && (
          <div className="demo-box">
            <strong>Akun demo (mode pengembangan):</strong>
            <div>Admin: <button type="button" onClick={() => setForm({ email: 'admin@kitabikin.id', password: 'Admin#12345' })}>admin@kitabikin.id</button></div>
            <div>Klien: <button type="button" onClick={() => setForm({ email: 'budi@smkn1bantul.sch.id', password: 'Client#12345' })}>budi@smkn1bantul.sch.id</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
