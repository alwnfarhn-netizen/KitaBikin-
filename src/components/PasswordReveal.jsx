import { useState } from 'react';
import { Copy, Check, KeyRound } from 'lucide-react';
import { Modal } from './ui';

/** Menampilkan password yang dibuat otomatis (hanya sekali). */
export default function PasswordReveal({ email, password, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = `Email: ${email}\nPassword: ${password}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard tidak tersedia */ }
  };
  return (
    <Modal title="Akun klien siap" onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <KeyRound color="var(--primary)" />
        <p>Bagikan kredensial ini ke klien. <strong>Password hanya ditampilkan sekali.</strong></p>
      </div>
      <pre style={{ background: '#faf8f4', border: '1px dashed var(--border)', borderRadius: 8, padding: '1rem', fontSize: '0.95rem', whiteSpace: 'pre-wrap', userSelect: 'all' }}>{text}</pre>
      <div className="flex gap-2" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-primary" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Tersalin' : 'Salin'}</button>
        <button className="btn btn-outline" onClick={onClose}>Selesai</button>
      </div>
    </Modal>
  );
}
