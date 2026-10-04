import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container text-center animate-fade-up">
        <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1 }}>404</h1>
        <h2 className="mb-4">Halaman Tidak Ditemukan</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
