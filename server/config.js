import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Muat .env jika ada (Node >= 20.12)
try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  /* .env opsional */
}

const env = process.env;
export const isProd = env.NODE_ENV === 'production';

export const config = {
  isProd,
  port: Number(env.PORT) || 4000,
  jwtSecret: env.JWT_SECRET || 'dev-secret-ganti-di-produksi',
  jwtExpires: '7d',
  adminEmail: (env.ADMIN_EMAIL || 'admin@kawakita.id').toLowerCase(),
  adminPassword: (env.ADMIN_PASSWORD || (isProd ? '' : 'Admin#12345')).trim(),
  seedDemo: false,
  dbPath: path.resolve(ROOT, env.DB_PATH || './data/kawakita.db'),
  corsOrigin: (env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  siteUrl: env.SITE_URL || 'https://kawakita.id',
  distDir: path.join(ROOT, 'dist'),
};

if (isProd) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 24) {
    throw new Error('[config] JWT_SECRET (>= 24 karakter) wajib diisi pada produksi.');
  }
  if (!config.adminPassword || config.adminPassword.length < 10) {
    throw new Error('[config] ADMIN_PASSWORD (>= 10 karakter) wajib diisi pada produksi.');
  }
}

export const STAGES = ['briefing', 'desain', 'pengembangan', 'revisi', 'peluncuran', 'selesai', 'ditunda'];
export const LEAD_STATUSES = ['baru', 'dihubungi', 'penawaran', 'deal', 'batal'];
export const INVOICE_STATUSES = ['belum', 'sebagian', 'lunas', 'batal'];
export const PAYMENT_METHODS = ['tunai', 'transfer', 'qris'];
export const SERVICES = [
  'Website Profil',
  'Sistem & Toko Online',
  'Media Pembelajaran',
  'Aplikasi Custom',
  'Lainnya',
];
