import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { one } from '../db.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpires });
}

export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    organization: u.organization,
  };
}

/** Wajib login. Mengisi req.user dari database (cek aktif). */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = one('SELECT * FROM users WHERE id = ?', payload.sub);
    if (!user || !user.active) return res.status(401).json({ error: 'Akun tidak aktif.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Sesi berakhir, silakan login kembali.' });
  }
}

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ error: 'Anda tidak punya akses.' });
  next();
};
