const rupiahFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
export const rupiah = (n) => rupiahFmt.format(Number(n) || 0);

/** SQLite `datetime('now')` menghasilkan UTC tanpa zona → tandai sebagai UTC. */
const toDate = (s) => {
  if (!s) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s.includes('T') ? s : `${s.replace(' ', 'T')}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (s) => {
  const d = toDate(s);
  return d ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
};

export const formatDateTime = (s) => {
  const d = toDate(s);
  return d
    ? d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
};

export function timeAgo(s) {
  const d = toDate(s);
  if (!d) return '—';
  const sec = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (sec < 60) return 'baru saja';
  if (sec < 3600) return `${Math.floor(sec / 60)} menit lalu`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} jam lalu`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)} hari lalu`;
  return formatDate(s);
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
