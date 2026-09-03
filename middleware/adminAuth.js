// Shared-secret auth for the admin dashboard.
function adminAuth(req, res, next) {
  const providedKey = req.headers['x-admin-key'] || (req.get && req.get('x-admin-key'));
  const expectedKey = process.env.ADMIN_KEY || 'Anmol@12345';

  if (!providedKey || !providedKey.trim()) {
    return res.status(401).json({ error: 'Please enter an admin key to sign in.' });
  }

  if (providedKey.trim() !== expectedKey) {
    return res.status(401).json({ error: 'Invalid secret admin key.' });
  }

  next();
}

module.exports = adminAuth;
