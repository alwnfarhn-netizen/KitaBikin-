export const sendWhatsApp = async (target, message) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn('⚠️ FONNTE_TOKEN tidak diatur. Pesan WA tidak dikirim:');
    console.warn(message);
    return false;
  }

  // Bersihkan target dari karakter selain angka dan ganti awalan 0 menjadi 62 atau 08...
  let phone = target.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: phone,
        message: message,
      }),
    });
    
    const data = await response.json();
    if (!data.status) {
      console.error('❌ Gagal mengirim WA:', data.reason);
      return false;
    }
    
    console.log(`✅ WA terkirim ke ${phone}`);
    return true;
  } catch (error) {
    console.error('❌ Error API Fonnte:', error);
    return false;
  }
};
