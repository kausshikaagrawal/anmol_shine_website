require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const productsRouter = require('./routes/products');
const inquiriesRouter = require('./routes/inquiries');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Security middleware ----
app.use(helmet({
  contentSecurityPolicy: false // relaxed for the Tailwind CDN + Google Fonts used by the site
}));
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// Rate limit form submissions specifically, to prevent spam/abuse of the inquiries endpoint
const inquiriesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many submissions from this device. Please try again later.' }
});

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- API routes ----
app.use('/api/products', productsRouter);
app.use('/api/inquiries', inquiriesLimiter, inquiriesRouter);
app.use('/api/admin', adminRouter);

// Health check (useful for uptime monitoring / deployment platforms)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- Fallback 404 for unknown API routes ----
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Anmol Shine server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
