import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { one, run, tx } from './db.js';
import { createProject, DEFAULT_MILESTONES, recalcProgress } from './utils/projects.js';
import { nextInvoiceNumber, syncInvoiceStatus } from './utils/invoices.js';

const hash = (pw) => bcrypt.hashSync(pw, 10);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

/** Buat admin awal bila belum ada. Idempoten. */
export function seedAdmin() {
  const exists = one("SELECT 1 AS x FROM users WHERE role = 'admin' LIMIT 1");
  if (exists) return;
  run(
    "INSERT INTO users (name,email,password_hash,role,organization) VALUES (?,?,?,'admin','KitaBikin')",
    'Admin KitaBikin', config.adminEmail, hash(config.adminPassword),
  );
  console.log(`[seed] Admin dibuat: ${config.adminEmail}`);
}

/** Data contoh untuk pengembangan/demo. Hanya jika DB belum punya klien. */
export function seedDemo() {
  if (!config.seedDemo) return;
  if (one("SELECT 1 AS x FROM users WHERE role = 'client' LIMIT 1")) return;

  tx(() => {
    const mkClient = (name, email, org, phone) =>
      Number(
        run(
          "INSERT INTO users (name,email,password_hash,role,phone,organization) VALUES (?,?,?,'client',?,?)",
          name, email, hash('Client#12345'), phone, org,
        ).lastInsertRowid,
      );

    const budi = mkClient('Budi Santoso', 'budi@smkn1bantul.sch.id', 'SMKN 1 Bantul', '081234567890');
    const sari = mkClient('Sari Wulandari', 'sari@tokojaya.id', 'Toko Jaya Abadi', '081298765432');

    // Proyek 1 — web sekolah (sedang berjalan)
    const p1 = createProject({
      clientId: budi, title: 'Website Profil SMKN 1 Bantul', service: 'Website Profil',
      description: 'Website sekolah responsif dengan berita, galeri, dan PPDB.',
      stage: 'desain', budget: 3500000, startDate: daysFromNow(-20), dueDate: daysFromNow(14),
      milestones: DEFAULT_MILESTONES,
    });
    run('UPDATE milestones SET done = 1 WHERE project_id = ? AND sort_order IN (0,1)', p1);
    run('INSERT INTO updates (project_id,title,body) VALUES (?,?,?)', p1, 'Desain beranda selesai', 'Mockup halaman beranda & galeri sudah siap ditinjau.');
    recalcProgress(p1);

    // Proyek 2 — POS UMKM (pengembangan)
    const p2 = createProject({
      clientId: sari, title: 'Sistem Kasir (POS) Toko Jaya', service: 'Sistem & Toko Online',
      description: 'POS dengan stok barang, laporan harian, dan cetak struk.',
      stage: 'pengembangan', budget: 7500000, startDate: daysFromNow(-35), dueDate: daysFromNow(10),
      milestones: DEFAULT_MILESTONES,
    });
    run('UPDATE milestones SET done = 1 WHERE project_id = ? AND sort_order IN (0,1,2)', p2);
    run('INSERT INTO updates (project_id,title,body) VALUES (?,?,?)', p2, 'Modul kasir berfungsi', 'Transaksi, diskon, dan cetak struk sudah dapat dicoba.');
    recalcProgress(p2);

    // Pesan contoh
    run('INSERT INTO messages (project_id,sender_id,body) VALUES (?,?,?)', p1, budi, 'Selamat siang, bisakah warna header dibuat lebih terang?');

    // Invoice contoh
    const mkInvoice = (clientId, projectId, items, payments = []) => {
      const id = Number(
        run(
          'INSERT INTO invoices (number,project_id,client_id,issue_date,due_date,notes) VALUES (?,?,?,?,?,?)',
          nextInvoiceNumber(), projectId, clientId, daysFromNow(-15), daysFromNow(7), 'Pembayaran via transfer BCA 1234567890 a.n. KitaBikin',
        ).lastInsertRowid,
      );
      items.forEach(([d, q, p]) => run('INSERT INTO invoice_items (invoice_id,description,qty,price) VALUES (?,?,?,?)', id, d, q, p));
      payments.forEach(([a, m]) => run('INSERT INTO payments (invoice_id,amount,method,paid_at) VALUES (?,?,?,?)', id, a, m, daysFromNow(-10)));
      syncInvoiceStatus(id);
    };
    mkInvoice(budi, p1, [['DP 50% — Website Profil Sekolah', 1, 1750000]], [[1750000, 'transfer']]);
    mkInvoice(budi, p1, [['Pelunasan — Website Profil Sekolah', 1, 1750000]]);
    mkInvoice(sari, p2, [['DP 40% — Sistem POS', 1, 3000000]], [[3000000, 'tunai']]);

    // Lead contoh
    run('INSERT INTO leads (name,contact,service,description) VALUES (?,?,?,?)', 'Rina - Bimbel Cerdas', '0856-1111-2222', 'Media Pembelajaran', 'Butuh game edukasi matematika untuk SD.');
    run('INSERT INTO leads (name,contact,service,description) VALUES (?,?,?,?)', 'Andi - Warung Kopi Senja', 'andi@senja.id', 'Website Profil', 'Ingin website + menu online untuk warung kopi.');
  });
  console.log('[seed] Data demo dibuat (klien: Client#12345).');
}
