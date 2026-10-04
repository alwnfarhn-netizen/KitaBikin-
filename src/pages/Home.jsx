import { Link } from 'react-router-dom';
import { Monitor, BookOpen, ArrowRight, Play, Server, Palette, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page" style={{ paddingTop: '80px' }}>
      
      {/* Hero Section */}
      <section className="section hero paper-effect">
        <div className="container grid grid-cols-2 items-center gap-12">
          <div className="hero-content animate-fade-up">
            <div className="handwritten mb-4">Solusi Digital Untuk Sekolah</div>
            <h1 className="mb-6">
              Bangun Masa Depan <br/>
              Pendidikan dengan <br/>
              <span style={{ color: 'var(--primary)' }}>Teknologi Digital</span>
            </h1>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)' }}>
              Kami membantu sekolah menghadirkan website, sistem digital, media pembelajaran, dan berbagai solusi teknologi sesuai kebutuhan.
            </p>
            <div className="flex gap-4">
              <Link to="/order" className="btn btn-primary">
                Konsultasi Gratis <ArrowRight size={18} />
              </Link>
              <Link to="/portofolio" className="btn btn-outline">
                Lihat Portofolio
              </Link>
            </div>
          </div>
          <div className="hero-image animate-fade-up delay-200 relative">
            <div className="red-brush-bg" style={{ top: '-10%', right: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}></div>
            {/* Using a mockup image placeholder structure */}
            <div className="card" style={{ padding: '0', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Education Technology Mockup" style={{ display: 'block', width: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="text-center mb-12 animate-fade-up">
            <h2>Layanan Kami</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '1rem auto' }}>Solusi lengkap untuk digitalisasi dan pengembangan media pembelajaran modern.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="card animate-fade-up delay-100">
              <div style={{ backgroundColor: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Server size={32} />
              </div>
              <h3 className="mb-4">Digitalisasi Sekolah</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Solusi digital untuk membantu sekolah tampil profesional dan mengelola kebutuhan digital dengan lebih mudah.</p>
              
              <ul className="flex flex-col gap-2">
                {['Website Sekolah', 'Sistem Sekolah', 'PPDB Online', 'E-Learning', 'Landing Page', 'Custom System'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                    <CheckCircle size={18} color="var(--primary)" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card animate-fade-up delay-200">
              <div style={{ backgroundColor: 'rgba(69, 123, 157, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                <Monitor size={32} />
              </div>
              <h3 className="mb-4">Media Pembelajaran</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Media pembelajaran interaktif, menarik, dan dapat disesuaikan dengan kebutuhan pembelajaran maupun penelitian.</p>
              
              <ul className="flex flex-col gap-2">
                {['Media Web', 'Game Edukasi', 'Video & Animasi', 'E-Book', 'Kuis & Asesmen', 'Media Custom'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                    <CheckCircle size={18} color="var(--secondary)" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ backgroundColor: 'var(--primary)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="paper-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, zIndex: 0 }}></div>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white' }} className="mb-6">Siap Mendigitalisasi Sekolah Anda?</h2>
          <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Konsultasikan kebutuhan digital sekolah atau institusi Anda bersama tim kami secara gratis.
          </p>
          <Link to="/order" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            Mulai Konsultasi Sekarang
          </Link>
        </div>
      </section>

    </div>
  );
}
