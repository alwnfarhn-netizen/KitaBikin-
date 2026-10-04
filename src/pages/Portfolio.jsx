import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const projects = [
  { id: 1, title: 'Website PT. Abadi Jaya', category: 'Website', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
  { id: 2, title: 'Kopi Kita E-Commerce', category: 'Toko Online', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80' },
  { id: 3, title: 'Aplikasi Reservasi Klinik', category: 'Aplikasi Mobile', img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80' },
  { id: 4, title: 'Sistem Kasir Warung', category: 'Sistem / POS', img: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80' },
  { id: 5, title: 'Landing Page Event', category: 'Website', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
  { id: 6, title: 'Manajemen Inventaris', category: 'Sistem / POS', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' }
];

const categories = ['Semua', 'Website', 'Toko Online', 'Aplikasi Mobile', 'Sistem / POS'];

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('Semua');

  const filteredProjects = activeTab === 'Semua' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  return (
    <div className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h1>Portofolio Kami</h1>
          <p style={{ color: 'var(--text-muted)' }}>Hasil karya terbaik kami dalam mewujudkan solusi digital untuk berbagai industri.</p>
        </div>

        <div className="flex gap-4 mb-12 scroll-x portfolio-filters" style={{ paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(cat)}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <div key={project.id} className="card animate-fade-up" style={{ padding: '0', cursor: 'pointer' }}>
              <img src={project.img} alt={project.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem' }}>
                <span className="badge badge-primary mb-2">{project.category}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{project.title}</h3>
                <span className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                  Lihat Detail <ArrowRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
