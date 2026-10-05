import { useState } from 'react';
import { Monitor, Server, Smartphone, PenTool, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Order() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    name: '',
    description: ''
  });

  const services = [
    { id: 'Website Profil', icon: <Monitor size={32} />, title: 'Web Sekolah / Bisnis' },
    { id: 'Sistem & Toko Online', icon: <Server size={32} />, title: 'Sistem & Toko Online' },
    { id: 'Media Pembelajaran', icon: <PenTool size={32} />, title: 'Media Pembelajaran' },
    { id: 'Aplikasi Custom', icon: <Smartphone size={32} />, title: 'Aplikasi Custom' },
  ];

  const handleServiceSelect = (serviceId) => {
    setFormData({ ...formData, service: serviceId });
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Halo Kawakita, saya ${formData.name}. Saya ingin konsultasi pembuatan *${formData.service}*.%0A%0ADetail kebutuhan:%0A${formData.description}`;
    window.open(`https://wa.me/6285128071828?text=${text}`, '_blank');
  };

  return (
    <div className="section" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <div style={{ width: '40px', height: '2px', background: step === 2 ? 'var(--primary)' : 'var(--border)' }}></div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 2 ? 'var(--primary)' : 'var(--border)', color: step === 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
          </div>
        </div>

        {step === 1 && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="mb-2">Pilih Layanan</h2>
              <p style={{ color: 'var(--text-muted)' }}>Pilih kategori aplikasi atau sistem yang ingin Anda buat.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {services.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => handleServiceSelect(s.id)}
                  className="card flex flex-col items-center justify-center text-center hover:border-primary" 
                  style={{ cursor: 'pointer', padding: '2.5rem 1rem', transition: 'all 0.2s', border: formData.service === s.id ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                >
                  <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{s.icon}</div>
                  <h4 style={{ margin: 0 }}>{s.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card animate-fade-up">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setStep(1)} style={{ color: 'var(--text-muted)', fontWeight: '500', display: 'inline-flex' }}>
              <ArrowLeft size={18} /> Kembali
            </div>
            <h3 className="mb-2">Lengkapi Data</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Anda memilih: <strong style={{ color: 'var(--primary)' }}>{formData.service}</strong></p>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Nama Anda / Bisnis / Instansi</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="Contoh: Budi - SMKN 1 / Toko Jaya" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="input-group mb-8">
                <label className="input-label">Ceritakan Singkat Kebutuhan Anda</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  required 
                  placeholder="Contoh: Saya butuh website profil untuk usaha/sekolah saya dengan fitur..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
                Konsultasi via WhatsApp <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </button>
            </form>
          </div>
        )}
        
      </div>
    </div>
  );
}
