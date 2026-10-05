// Smoke test API KitaBikin: menjalankan server dengan DB sementara lalu menguji alur utama.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const PORT = 4107;
const BASE = `http://localhost:${PORT}/api`;
const DB = './data/test-smoke.db';
for (const ext of ['', '-wal', '-shm']) fs.rmSync(path.resolve(DB + ext), { force: true });

const server = spawn(process.execPath, ['server/index.js'], {
  env: {
    ...process.env,
    PORT: String(PORT),
    DB_PATH: DB,
    SEED_DEMO: 'false',
    ADMIN_EMAIL: 'admin@test.id',
    ADMIN_PASSWORD: 'Admin#Test123',
    JWT_SECRET: 'test-secret-test-secret-test-secret',
  },
  stdio: ['ignore', 'pipe', 'inherit'],
});

async function waitReady() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`${BASE}/health`)).ok) return;
    } catch { /* belum siap */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Server tidak siap.');
}

const call = async (method, url, body, token) => {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

let passed = 0;
const ok = (name) => console.log(`  ✓ ${name}`) || passed++;

try {
  await waitReady();
  console.log('Menjalankan smoke test…');

  // Publik
  let r = await call('POST', '/public/leads', { name: 'Tes', service: 'Website Profil', description: 'Butuh website toko' });
  assert.equal(r.status, 201); ok('lead publik tersimpan');
  r = await call('POST', '/public/leads', { name: 'x', service: 'Salah', description: 'abc' });
  assert.equal(r.status, 400); ok('validasi lead menolak data buruk');

  // Auth
  r = await call('POST', '/auth/login', { email: 'admin@test.id', password: 'salah' });
  assert.equal(r.status, 401); ok('login salah ditolak');
  r = await call('POST', '/auth/login', { email: 'admin@test.id', password: 'Admin#Test123' });
  assert.equal(r.status, 200);
  const admin = r.data.token; ok('login admin');

  r = await call('GET', '/admin/stats');
  assert.equal(r.status, 401); ok('admin API butuh token');

  // Lead → proyek + klien
  r = await call('GET', '/admin/leads', null, admin);
  const leadId = r.data.leads[0].id;
  r = await call('POST', `/admin/leads/${leadId}/convert`, {
    newClient: { name: 'Klien Tes', email: 'klien@test.id', organization: 'Toko Tes' },
    budget: 2000000,
  }, admin);
  assert.equal(r.status, 201);
  assert.ok(r.data.generatedPassword);
  const { projectId, clientId, generatedPassword } = r.data; ok('konversi lead → proyek + akun klien');

  r = await call('POST', `/admin/leads/${leadId}/convert`, { clientId }, admin);
  assert.equal(r.status, 409); ok('lead tidak bisa dikonversi dua kali');

  // Klien login
  r = await call('POST', '/auth/login', { email: 'klien@test.id', password: generatedPassword });
  assert.equal(r.status, 200);
  const klien = r.data.token; ok('login klien (password otomatis)');

  r = await call('GET', '/admin/stats', null, klien);
  assert.equal(r.status, 403); ok('klien tidak bisa akses admin');

  // Milestone → progres
  r = await call('GET', `/admin/projects/${projectId}`, null, admin);
  const code = r.data.project.code;
  const ms = r.data.project.milestones;
  assert.equal(ms.length, 5);
  await call('PATCH', `/admin/milestones/${ms[0].id}`, { done: true }, admin);
  await call('PATCH', `/admin/milestones/${ms[1].id}`, { done: true }, admin);
  r = await call('GET', `/admin/projects/${projectId}`, null, admin);
  assert.equal(r.data.project.progress, 40); ok('progres dihitung otomatis dari milestone (40%)');

  r = await call('PATCH', `/admin/projects/${projectId}`, { stage: 'pengembangan' }, admin);
  assert.equal(r.data.project.stage, 'pengembangan'); ok('ubah tahap proyek');

  // Pelacakan publik
  r = await call('GET', `/public/track/${code}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.project.progress, 40);
  assert.ok(!('client_id' in r.data.project)); ok('lacak publik tampil tanpa data sensitif');
  r = await call('GET', '/public/track/KB-ZZZZZZ');
  assert.equal(r.status, 404); ok('kode tak dikenal → 404');

  // Klien melihat progres & kirim pesan
  r = await call('GET', `/client/projects/${projectId}`, null, klien);
  assert.equal(r.status, 200); ok('klien melihat proyeknya');
  r = await call('POST', `/client/projects/${projectId}/messages`, { body: 'Mohon update warna' }, klien);
  assert.equal(r.status, 201); ok('klien kirim pesan');

  // Klien lain tidak boleh mengintip
  r = await call('POST', '/admin/clients', { name: 'Lain', email: 'lain@test.id', password: 'Rahasia#123' }, admin);
  const lain = (await call('POST', '/auth/login', { email: 'lain@test.id', password: 'Rahasia#123' })).data.token;
  r = await call('GET', `/client/projects/${projectId}`, null, lain);
  assert.equal(r.status, 404); ok('IDOR: klien lain ditolak (404)');

  // Invoice & pembayaran
  r = await call('POST', '/admin/invoices', {
    clientId, projectId,
    items: [{ description: 'DP 50%', qty: 1, price: 1000000 }, { description: 'Domain setup', qty: 2, price: 250000 }],
  }, admin);
  assert.equal(r.status, 201);
  const inv = r.data.invoice;
  assert.equal(inv.total, 1500000);
  assert.match(inv.number, /^INV-\d{6}-001$/); ok('invoice dibuat, total & nomor benar');

  r = await call('POST', `/admin/invoices/${inv.id}/payments`, { amount: 500000, method: 'tunai' }, admin);
  assert.equal(r.data.invoice.status, 'sebagian'); ok('pembayaran sebagian → status sebagian');
  r = await call('POST', `/admin/invoices/${inv.id}/payments`, { amount: 2000000, method: 'transfer' }, admin);
  assert.equal(r.status, 400); ok('pembayaran melebihi sisa ditolak');
  r = await call('POST', `/admin/invoices/${inv.id}/payments`, { amount: 1000000, method: 'qris' }, admin);
  assert.equal(r.data.invoice.status, 'lunas'); ok('pelunasan → status lunas');
  const payId = r.data.invoice.payments[0].id;
  r = await call('DELETE', `/admin/payments/${payId}`, null, admin);
  assert.equal(r.data.invoice.status, 'sebagian'); ok('hapus pembayaran → status kembali sebagian');

  r = await call('GET', `/client/invoices/${inv.id}`, null, klien);
  assert.equal(r.status, 200);
  r = await call('GET', `/client/invoices/${inv.id}`, null, lain);
  assert.equal(r.status, 404); ok('klien hanya bisa lihat invoice miliknya');

  // Dashboard
  r = await call('GET', '/admin/stats', null, admin);
  assert.equal(r.status, 200);
  assert.equal(r.data.revenueMonth, 1000000);
  assert.equal(r.data.receivable, 500000);
  assert.equal(r.data.projectsActive, 1);
  ok('statistik dashboard (pendapatan, piutang, proyek aktif)');

  // Nonaktifkan klien
  await call('PATCH', `/admin/clients/${clientId}`, { active: false }, admin);
  r = await call('GET', '/client/overview', null, klien);
  assert.equal(r.status, 401); ok('klien nonaktif langsung ditolak');

  console.log(`\n✅ ${passed} pengujian lulus.`);
} catch (err) {
  console.error('\n❌ Gagal:', err.message);
  process.exitCode = 1;
} finally {
  server.kill();
  setTimeout(() => {
    for (const ext of ['', '-wal', '-shm']) fs.rmSync(path.resolve(DB + ext), { force: true });
  }, 300);
}
