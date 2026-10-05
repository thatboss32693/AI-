export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token || token !== process.env.PENTAGI_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
