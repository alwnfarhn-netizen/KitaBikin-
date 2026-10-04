import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h1>Paket Harga</h1>
          <p style={{ color: 'var(--text-muted)' }}>Investasi terbaik untuk kemajuan bisnis Anda.</p>
        </div>

        <div className="grid grid-cols-3 gap-8 items-center">
          
          <div className="card">
            <h3 className="mb-2">Media & E-Commerce</h3>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem' }}>Custom</div>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Toko online / Media pembelajaran.</p>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Fitur Interaktif</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Integrasi Sistem / Payment</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Desain Custom Premium</li>
            </ul>
            <Link to="/order" className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }}>Konsultasi</Link>
          </div>

          <div className="card" style={{ transform: 'scale(1.05)', borderColor: 'var(--primary)', boxShadow: 'var(--shadow-primary)', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '0.875rem' }}>Paling Populer</div>
            <h3 className="mb-2">Web Sekolah/Bisnis</h3>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Mulai</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem', lineHeight: 1 }}>Rp800K</div>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Desain modern & Responsive</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Halaman Profil & Layanan</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> SEO & Optimasi Kecepatan</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Galeri, Testimoni & Kontak</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Domain & Hosting (1 Tahun)</li>
            </ul>
            <Link to="/order" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Mulai Proyek</Link>
          </div>

          <div className="card">
            <h3 className="mb-2">Sistem & Aplikasi</h3>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem' }}>Custom</div>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Disesuaikan dengan kebutuhan.</p>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> PPDB Online / Akademik</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Sistem POS & Inventaris Bisnis</li>
              <li className="flex gap-2"><CheckCircle size={20} color="var(--primary)" /> Aplikasi Mobile Custom</li>
            </ul>
            <Link to="/order" className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }}>Konsultasi</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
