import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { one, run } from '../db.js';
import { authenticate, publicUser, signToken } from '../middleware/auth.js';
import { HttpError, validate, wrap } from '../middleware/http.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  wrap((req, res) => {
    const { email, password } = req.body;
    const user = one('SELECT * FROM users WHERE email = ?', email);
    // Selalu jalankan compare agar waktu respons seragam
    const hash = user?.password_hash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali';
    const ok = bcrypt.compareSync(password, hash);
    if (!user || !ok || !user.active) throw new HttpError(401, 'Email atau password salah.');
    res.json({ token: signToken(user), user: publicUser(user) });
  }),
);

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

const changeSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi.'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter.').max(72),
});

router.post(
  '/change-password',
  authenticate,
  validate(changeSchema),
  wrap((req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!bcrypt.compareSync(currentPassword, req.user.password_hash)) {
      throw new HttpError(400, 'Password saat ini salah.');
    }
    run('UPDATE users SET password_hash = ? WHERE id = ?', bcrypt.hashSync(newPassword, 10), req.user.id);
    res.json({ ok: true });
  }),
);

export default router;
