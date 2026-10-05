import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../lib/seo';

/** Kerangka dashboard (sidebar + konten) untuk admin & klien. */
export default function DashboardLayout({ roleLabel, items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useSEO({ title: `Dashboard ${roleLabel}`, noindex: true, path: '/' });

  const handleLogout = () => {
    logout();
    navigate('/masuk');
  };

  return (
    <div className="dash">
      <header className="dash-topbar">
        <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img src="/logo-full.svg" alt="Kawakita" style={{ height: '30px', width: 'auto' }} />
      </header>

      <aside className={`dash-sidebar ${open ? 'open' : ''}`}>
        <Link to="/" className="dash-brand" onClick={() => setOpen(false)}>
          <img src="/logo-full.svg" alt="Kawakita" style={{ height: '34px', width: 'auto' }} />
          <span className="dash-role">{roleLabel}</span>
        </Link>

        <nav className="dash-nav" aria-label={`Menu ${roleLabel}`}>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-user">
          <div className="dash-avatar" aria-hidden="true">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="dash-user-info">
            <strong>{user?.name}</strong>
            <small>{user?.organization || user?.email}</small>
          </div>
        </div>
        <Link to="/" className="dash-link"><ExternalLink size={19} /> Lihat Website</Link>
        <button className="dash-link dash-logout" onClick={handleLogout}>
          <LogOut size={19} /> Keluar
        </button>
      </aside>

      {open && <div className="dash-overlay" onClick={() => setOpen(false)} />}

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
