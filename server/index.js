import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import './db.js';
import { seedAdmin, seedDemo } from './seed.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import { errorHandler, notFound } from './middleware/http.js';

seedAdmin();
seedDemo();

const app = express();
app.disable('x-powered-by');
if (config.isProd) app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api', notFound);

// SEO dinamis (mengikuti SITE_URL)
const PUBLIC_PATHS = ['/', '/layanan', '/portofolio', '/harga', '/order', '/lacak'];
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /klien\nDisallow: /masuk\nDisallow: /api\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`,
  );
});
app.get('/sitemap.xml', (_req, res) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PATHS.map(
    (p) =>
      `  <url><loc>${config.siteUrl}${p === '/' ? '' : p}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`,
  ).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

// Sajikan build SPA bila tersedia
if (fs.existsSync(path.join(config.distDir, 'index.html'))) {
  app.use(express.static(config.distDir, { maxAge: '7d', index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(config.distDir, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] KitaBikin API berjalan di http://localhost:${config.port}`);
});

export default app;
