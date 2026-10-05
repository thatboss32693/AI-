export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedKey = process.env.PENTAGI_API_KEY || 'pentagi_dev_key';

  if (!token || token !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
