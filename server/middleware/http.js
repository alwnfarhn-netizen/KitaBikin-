import { ZodError } from 'zod';

/** Parse req.body dengan skema Zod; hasil menggantikan req.body. */
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return next(parsed.error);
  req.body = parsed.data;
  next();
};

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Data tidak valid.',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.code === 'ERR_SQLITE_ERROR' && /UNIQUE/i.test(err.message)) {
    return res.status(409).json({ error: 'Data sudah ada (duplikat).' });
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid.' });
  console.error('[error]', err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
}

/** Bungkus handler async agar error diteruskan ke errorHandler. */
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const idParam = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID tidak valid.');
  return id;
};
