import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token || token !== config.apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
