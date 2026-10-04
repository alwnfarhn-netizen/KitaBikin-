import { Server, Monitor, CheckCircle, Smartphone } from 'lucide-react';

export default function Services() {
  return (
    <div className="services-page paper-effect" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh' }}>
      <div className="container">
        <div className="text-center mb-12 animate-fade-up">
          <div className="handwritten mb-4">Solusi Terbaik Kami</div>
          <h1 className="mb-4">Layanan <span style={{ color: 'var(--primary)' }}>Digital</span></h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Kami menyediakan berbagai layanan pengembangan teknologi digital untuk membantu institusi pendidikan Anda berkembang lebih cepat.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="card animate-fade-up delay-100">
            <div style={{ backgroundColor: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <Server size={32} />
            </div>
            <h3 className="mb-4">Digitalisasi Sekolah</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Membantu sekolah Anda go-digital dengan sistem terintegrasi yang memudahkan manajemen.</p>
            <ul className="flex flex-col gap-2">
              {['Website Profil Sekolah', 'Sistem PPDB Online', 'E-Learning (LMS)', 'Sistem Informasi Akademik', 'Portal Alumni'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  <CheckCircle size={16} color="var(--primary)" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2 */}
          <div className="card animate-fade-up delay-200">
            <div style={{ backgroundColor: 'rgba(69, 123, 157, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
              <Monitor size={32} />
            </div>
            <h3 className="mb-4">Media Pembelajaran</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pembuatan media interaktif yang membuat proses belajar-mengajar menjadi lebih menyenangkan.</p>
            <ul className="flex flex-col gap-2" style={{ marginTop: 'auto' }}>
              {['Media Interaktif Web', 'Game Edukasi 2D/3D', 'Video & Animasi Pembelajaran', 'Kuis & Asesmen Digital', 'Aplikasi AR/VR Edukasi'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  <CheckCircle size={16} color="var(--secondary)" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3 */}
          <div className="card animate-fade-up delay-300">
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
              <Smartphone size={32} />
            </div>
            <h3 className="mb-4">Aplikasi Mobile</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pengembangan aplikasi Android dan iOS khusus untuk kebutuhan sekolah dan pembelajaran.</p>
            <ul className="flex flex-col gap-2">
              {['Aplikasi Informasi Sekolah', 'Aplikasi Presensi Siswa', 'E-Rapor Mobile', 'Perpustakaan Digital', 'Aplikasi Keuangan Sekolah'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  <CheckCircle size={16} color="var(--success)" /> {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
