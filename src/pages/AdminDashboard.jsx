import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="logo mb-8">DEVDe<span className="logo-dot">.</span><span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '8px' }}>Admin</span></div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/admin" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
            <ShoppingCart size={20} /> Pesanan
          </Link>
          <Link to="/admin" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
            <Users size={20} /> Klien
          </Link>
          <Link to="/admin" className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
            <Settings size={20} /> Pengaturan
          </Link>
        </nav>
        
        <button onClick={() => navigate('/')} className="flex items-center gap-3" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)', fontWeight: '500', marginTop: 'auto' }}>
          <LogOut size={20} /> Kembali ke Web
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow" style={{ padding: '2rem' }}>
        <h2 className="mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h4 style={{ color: 'var(--text-muted)' }}>Total Pesanan</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary)' }}>24</div>
          </div>
          <div className="card">
            <h4 style={{ color: 'var(--text-muted)' }}>Klien Aktif</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary)' }}>12</div>
          </div>
          <div className="card">
            <h4 style={{ color: 'var(--text-muted)' }}>Pendapatan Bulan Ini</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary)' }}>Rp 15M</div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Pesanan Terbaru</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 0' }}>ID</th>
                  <th style={{ padding: '1rem 0' }}>Klien</th>
                  <th style={{ padding: '1rem 0' }}>Layanan</th>
                  <th style={{ padding: '1rem 0' }}>Status</th>
                  <th style={{ padding: '1rem 0' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0' }}>#ORD-001</td>
                  <td style={{ padding: '1rem 0' }}>SMKN 1 Bantul</td>
                  <td style={{ padding: '1rem 0' }}>Pembuatan Website</td>
                  <td style={{ padding: '1rem 0' }}><span className="badge badge-warning">Proses</span></td>
                  <td style={{ padding: '1rem 0' }}><button style={{ color: 'var(--primary)', fontWeight: '600' }}>Detail</button></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0' }}>#ORD-002</td>
                  <td style={{ padding: '1rem 0' }}>Universitas Gadjah Mada</td>
                  <td style={{ padding: '1rem 0' }}>Game Edukasi 3D</td>
                  <td style={{ padding: '1rem 0' }}><span className="badge badge-success">Selesai</span></td>
                  <td style={{ padding: '1rem 0' }}><button style={{ color: 'var(--primary)', fontWeight: '600' }}>Detail</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
