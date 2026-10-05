export const SITE_NAME = 'Kawakita';
export const SITE_URL = 'https://kawakita.id';
export const WA_NUMBER = '6285128071828';

export const SERVICES = [
  'Website Profil',
  'Sistem & Toko Online',
  'Media Pembelajaran',
  'Aplikasi Custom',
  'Lainnya',
];

export const STAGES = {
  briefing: { label: 'Briefing', tone: 'neutral' },
  desain: { label: 'Desain', tone: 'blue' },
  pengembangan: { label: 'Pengembangan', tone: 'primary' },
  revisi: { label: 'Revisi', tone: 'warning' },
  peluncuran: { label: 'Peluncuran', tone: 'purple' },
  selesai: { label: 'Selesai', tone: 'success' },
  ditunda: { label: 'Ditunda', tone: 'danger' },
};
export const STAGE_FLOW = ['briefing', 'desain', 'pengembangan', 'revisi', 'peluncuran', 'selesai'];

export const LEAD_STATUSES = {
  baru: { label: 'Baru', tone: 'primary' },
  dihubungi: { label: 'Dihubungi', tone: 'blue' },
  penawaran: { label: 'Penawaran', tone: 'warning' },
  deal: { label: 'Deal', tone: 'success' },
  batal: { label: 'Batal', tone: 'danger' },
};

export const INVOICE_STATUSES = {
  belum: { label: 'Belum Bayar', tone: 'danger' },
  sebagian: { label: 'Dibayar Sebagian', tone: 'warning' },
  lunas: { label: 'Lunas', tone: 'success' },
  batal: { label: 'Dibatalkan', tone: 'neutral' },
};

export const PAYMENT_METHODS = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' };
