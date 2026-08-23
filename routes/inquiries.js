const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

const validateInquiry = [
  body('type').isIn(['quote', 'contact']).withMessage('Type must be "quote" or "contact".'),
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('company').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('product_interest').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 2000 })
];

// POST /api/inquiries - submit a quote request or contact message
router.post('/', validateInquiry, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, name, email, phone, company, product_interest, message } = req.body;

  const insert = db.prepare(`
    INSERT INTO inquiries (type, name, email, phone, company, product_interest, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    type,
    name,
    email,
    phone || null,
    company || null,
    product_interest || null,
    message
  );

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid,
    message: type === 'quote'
      ? "Thanks — we've received your quote request and will get back to you shortly."
      : "Thanks for reaching out — we'll respond as soon as possible."
  });
});

// POST /api/inquiries/whatsapp - log WhatsApp inquiry clicks into the database
router.post('/whatsapp', (req, res) => {
  const { product_interest, page } = req.body;

  const insert = db.prepare(`
    INSERT INTO inquiries (type, name, email, phone, company, product_interest, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    'quote',
    'WhatsApp Visitor',
    'whatsapp@lead.local',
    null,
    'WhatsApp Click',
    product_interest || 'General WhatsApp Inquiry',
    `Visitor initiated WhatsApp inquiry from page: ${page || 'website'}`
  );

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

module.exports = router;

