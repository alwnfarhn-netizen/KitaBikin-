import { Link } from 'react-router-dom';
import { Monitor, BookOpen, ArrowRight, Server, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page" style={{ paddingTop: '80px' }}>
      
      {/* Hero Section */}
      <section className="section hero paper-effect">
        <div className="container grid grid-cols-2 items-center gap-12">
          <div className="hero-content animate-fade-up">
            <div className="handwritten mb-4">Solusi Digital Untuk Bisnis & Pendidikan</div>
            <h1 className="mb-6">
              Kembangkan <br/>
              Bisnis & Instansi dengan <br/>
              <span style={{ color: 'var(--primary)' }}>Teknologi Digital</span>
            </h1>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)' }}>
              Kami membantu UMKM, perusahaan, maupun sekolah menghadirkan website, sistem digital, media pembelajaran, dan berbagai solusi teknologi.
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
            {/* The mascot image without any card or frame */}
            <img src="/hero-character.png" alt="Kawakita Mascot Kutai" style={{ display: 'block', width: '100%', objectFit: 'cover', mixBlendMode: 'multiply', position: 'relative', zIndex: 1 }} />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="text-center mb-12 animate-fade-up">
            <h2>Layanan Kami</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '1rem auto' }}>Solusi lengkap untuk digitalisasi bisnis, sekolah, dan pengembangan media pembelajaran.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="card animate-fade-up delay-100">
              <div style={{ backgroundColor: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Server size={32} />
              </div>
              <h3 className="mb-4">Bisnis & UMKM</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Membantu bisnis tampil profesional dengan sistem POS, manajemen, dan E-Commerce.</p>
              
              <ul className="flex flex-col gap-2">
                {['Website Profil Bisnis', 'Toko Online (E-Commerce)', 'Sistem Kasir (POS)', 'Custom System'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                    <CheckCircle size={18} color="var(--primary)" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card animate-fade-up delay-200">
              <div style={{ backgroundColor: 'rgba(69, 123, 157, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                <BookOpen size={32} />
              </div>
              <h3 className="mb-4">Digitalisasi Sekolah</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Sistem terintegrasi untuk memudahkan manajemen sekolah dan penerimaan siswa.</p>
              
              <ul className="flex flex-col gap-2">
                {['Website Sekolah', 'Sistem PPDB Online', 'E-Learning (LMS)', 'Sistem Akademik'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                    <CheckCircle size={18} color="var(--secondary)" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card animate-fade-up delay-300">
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
                <Monitor size={32} />
              </div>
              <h3 className="mb-4">Media Pembelajaran</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Media interaktif dan game edukasi yang disesuaikan dengan kurikulum pembelajaran.</p>
              
              <ul className="flex flex-col gap-2">
                {['Media Interaktif Web', 'Game Edukasi', 'Video & Animasi', 'Media Custom'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                    <CheckCircle size={18} color="var(--success)" /> {item}
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
          <h2 style={{ color: 'white' }} className="mb-6">Siap Mendigitalisasi Usaha atau Sekolah Anda?</h2>
          <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Konsultasikan kebutuhan teknologi Anda bersama tim kami secara gratis.
          </p>
          <Link to="/order" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            Mulai Konsultasi Sekarang
          </Link>
        </div>
      </section>

    </div>
  );
}
