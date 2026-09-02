const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/admin/login - authenticate/verify admin key
router.post('/login', (req, res) => {
  const { key } = req.body || {};
  const expectedKey = process.env.ADMIN_KEY || 'Anmol@123';

  if (key && key.trim() === expectedKey) {
    return res.json({ success: true, message: 'Authenticated successfully.' });
  }

  return res.status(401).json({ error: 'Invalid secret admin key. Please try again.' });
});

// All routes below require a valid x-admin-key header
router.use(adminAuth);

// GET /api/admin/inquiries?status=new&type=quote&q=searchterm - list inquiries, newest first
router.get('/inquiries', (req, res) => {
  const { status, type, q } = req.query;

  let inquiries = db.prepare('SELECT * FROM inquiries ORDER BY id DESC LIMIT 300').all();

  if (status) {
    inquiries = inquiries.filter(i => i.status === status);
  }
  if (type) {
    inquiries = inquiries.filter(i => i.type === type);
  }
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    inquiries = inquiries.filter(i =>
      (i.name && i.name.toLowerCase().includes(term)) ||
      (i.email && i.email.toLowerCase().includes(term)) ||
      (i.phone && i.phone.toLowerCase().includes(term)) ||
      (i.company && i.company.toLowerCase().includes(term)) ||
      (i.product_interest && i.product_interest.toLowerCase().includes(term)) ||
      (i.message && i.message.toLowerCase().includes(term))
    );
  }

  res.json({ inquiries });
});

// POST /api/admin/inquiries - manually add a customer contact
router.post('/inquiries', (req, res) => {
  const { type, name, email, phone, company, product_interest, message, notes } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required.' });
  }

  const result = db.prepare(`
    INSERT INTO inquiries (type, name, email, phone, company, product_interest, message, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    type || 'contact',
    name,
    email,
    phone || null,
    company || null,
    product_interest || null,
    message || 'Manually logged contact from Admin Dashboard',
    notes || null
  );

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// PATCH /api/admin/inquiries/:id - update status and/or notes
router.patch('/inquiries/:id', (req, res) => {
  const { status, notes } = req.body;

  if (status) {
    const validStatuses = ['new', 'contacted', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  }

  if (notes !== undefined) {
    db.prepare('UPDATE inquiries SET notes = ? WHERE id = ?').run(notes, req.params.id);
  }

  res.json({ success: true });
});

// DELETE /api/admin/inquiries/:id - delete a contact
router.delete('/inquiries/:id', (req, res) => {
  const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }
  res.json({ success: true });
});

// GET /api/admin/stats - full dashboard statistics & analytics
router.get('/stats', (req, res) => {
  try {
    const totalInquiriesRow = db.prepare('SELECT COUNT(*) AS n FROM inquiries').get();
    const totalInquiries = totalInquiriesRow ? totalInquiriesRow.n : 0;

    const newInquiriesRow = db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").get();
    const newInquiries = newInquiriesRow ? newInquiriesRow.n : 0;

    const quoteRequestsRow = db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE type = 'quote'").get();
    const quoteRequests = quoteRequestsRow ? quoteRequestsRow.n : 0;

    const topProducts = db.prepare(`
      SELECT product_interest, COUNT(*) AS count
      FROM inquiries
      WHERE product_interest IS NOT NULL AND product_interest != ''
      GROUP BY product_interest
      ORDER BY count DESC
      LIMIT 10
    `).all() || [];

    const visitorLogs = typeof db.getVisitorLogs === 'function' ? db.getVisitorLogs() : [];
    const totalVisitors = visitorLogs.length;

    res.json({
      totalInquiries,
      newInquiries,
      quoteRequests,
      totalVisitors,
      topProducts,
      visitorLogs: visitorLogs.slice(0, 50)
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to compute admin statistics.' });
  }
});

module.exports = router;
