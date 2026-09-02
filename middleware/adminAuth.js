// Simple shared-secret auth for the admin dashboard.
// The admin page asks for this key once and stores it in memory (not localStorage,
// since the key is sent with every request as a header, not persisted client-side
// beyond the current session's JS state).
function adminAuth(req, res, next) {
  const providedKey = req.header('x-admin-key');
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
