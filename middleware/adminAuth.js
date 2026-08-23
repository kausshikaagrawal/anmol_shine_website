// Simple shared-secret auth for the admin dashboard.
// The admin page asks for this key once and stores it in memory (not localStorage,
// since the key is sent with every request as a header, not persisted client-side
// beyond the current session's JS state).
function adminAuth(req, res, next) {
  const providedKey = req.header('x-admin-key');
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    // Fail closed: if the server has no admin key configured, refuse all admin access
    // rather than silently letting anyone in.
    return res.status(500).json({ error: 'Admin access is not configured on the server.' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing admin key.' });
  }

  next();
}

module.exports = adminAuth;
