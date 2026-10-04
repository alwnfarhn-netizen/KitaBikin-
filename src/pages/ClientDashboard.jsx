import { Link, useNavigate } from 'react-router-dom';
import { Home, FileText, MessageSquare, LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="logo mb-8">
          <img src="/logo-full.svg" alt="KitaBikin" style={{ height: '36px' }} />
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '8px', alignSelf: 'flex-end' }}>Client</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/client" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>
            <Home size={20} /> Area Klien
          </Link>
          <Link to="/client" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
            <FileText size={20} /> Proyek Saya
          </Link>
          <Link to="/client" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={20} /> Tiket Dukungan
          </Link>
        </nav>
        
        <button onClick={() => navigate('/')} className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)', fontWeight: '500', marginTop: 'auto' }}>
          <LogOut size={20} /> Kembali ke Web
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow" style={{ padding: '2rem' }}>
        <h2 className="mb-2">Selamat Datang, Budi!</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Pantau perkembangan proyek digital Anda di sini.</p>
        
        <div className="card mb-8">
          <h3 className="mb-4">Proyek Aktif</h3>
          <div className="flex items-center justify-between" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <h4 className="mb-1">Pembuatan Website Profil Sekolah</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SMKN 1 Bantul • Diperbarui 2 jam yang lalu</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Progress: 65%</span>
                <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                </div>
              </div>
              <span className="badge badge-warning">Tahap Desain</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
