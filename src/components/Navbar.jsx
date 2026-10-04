import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo" onClick={closeMenu} style={{ textDecoration: 'none' }}>
          <img src="/logo-full.svg" alt="KitaBikin" style={{ height: '40px' }} />
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ display: 'none' }}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Links */}
        <div className={`nav-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Beranda</Link>
            <Link to="/layanan" className={`nav-link ${isActive('/layanan')}`} onClick={closeMenu}>Layanan</Link>
            <Link to="/portofolio" className={`nav-link ${isActive('/portofolio')}`} onClick={closeMenu}>Portofolio</Link>
            <Link to="/harga" className={`nav-link ${isActive('/harga')}`} onClick={closeMenu}>Harga</Link>
          </div>
          <div className="nav-actions">
            <Link to="/order" className="btn btn-primary" onClick={closeMenu}>Konsultasi Gratis</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
