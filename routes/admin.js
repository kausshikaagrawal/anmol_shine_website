const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All routes below require a valid x-admin-key header
router.use(adminAuth);

// GET /api/admin/inquiries?status=new&type=quote - list inquiries, newest first
router.get('/inquiries', (req, res) => {
  const { status, type } = req.query;

  let query = 'SELECT * FROM inquiries WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC LIMIT 200';

  const inquiries = db.prepare(query).all(...params);
  res.json({ inquiries });
});

// PATCH /api/admin/inquiries/:id - update status (new -> contacted -> closed)
router.patch('/inquiries/:id', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'contacted', 'closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const result = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  res.json({ success: true });
});

// GET /api/admin/stats - summary numbers for the dashboard
router.get('/stats', (req, res) => {
  const totalInquiries = db.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n;
  const newInquiries = db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").get().n;
  const quoteRequests = db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE type = 'quote'").get().n;

  const last7Days = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count
    FROM inquiries
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY day
    ORDER BY day ASC
  `).all();

  const topProducts = db.prepare(`
    SELECT product_interest, COUNT(*) AS count
    FROM inquiries
    WHERE product_interest IS NOT NULL AND product_interest != ''
    GROUP BY product_interest
    ORDER BY count DESC
    LIMIT 5
  `).all();

  res.json({
    totalInquiries,
    newInquiries,
    quoteRequests,
    last7Days,
    topProducts
  });
});

module.exports = router;
