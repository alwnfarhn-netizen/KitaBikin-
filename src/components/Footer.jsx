import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--secondary)', color: 'white', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container grid grid-cols-3 gap-8 mb-12">
        <div>
          <div className="logo mb-4">
            <img src="/logo-full-light.svg" alt="KitaBikin" style={{ height: '48px' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Solusi digital terbaik untuk UMKM dan Perusahaan. Membantu bisnis Anda bertransformasi di era teknologi dengan mudah dan efisien.
          </p>
        </div>
        
        <div>
          <h4 className="mb-4" style={{ color: 'white' }}>Layanan</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="/layanan" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Website Profil Bisnis</Link></li>
            <li><Link to="/layanan" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Toko Online (E-Commerce)</Link></li>
            <li><Link to="/layanan" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Sistem Kasir & POS</Link></li>
            <li><Link to="/layanan" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Aplikasi Mobile Custom</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4" style={{ color: 'white' }}>Hubungi Kami</h4>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <MapPin size={18} style={{ flexShrink: 0 }} /> Kutai Kartanegara, Tenggarong
            </li>
            <li className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <Phone size={18} /> +62 851 2807 1828
            </li>
            <li className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <Mail size={18} style={{ flexShrink: 0 }} /> <a href="mailto:alwnfarhn@gmail.com" className="hover:text-white" style={{ transition: 'color 0.2s' }}>alwnfarhn@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} KitaBikin. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Instagram</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
