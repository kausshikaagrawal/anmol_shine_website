const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrency
db.exec('PRAGMA journal_mode = WAL;');

// ---- Schema ----
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tag TEXT,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('quote', 'contact')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    product_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
  CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
`);

// ---- Seed products ----
// Refresh products table with accurate Anmol Shine catalog
db.exec('DELETE FROM products;');

const insert = db.prepare(`
  INSERT INTO products (name, tag, description, image_url)
  VALUES (?, ?, ?, ?)
`);

const seedProducts = [
  {
    name: 'General Purpose Thinner No. GP-50',
    tag: 'Industrial & Coating',
    description: 'High performance industrial thinner formulated for smooth application, rapid drying, and optimal finish across general metal and equipment coating.',
    image_url: '/images/products/gp-50-general-purpose-thinner.jpg'
  },
  {
    name: 'Hi-Gloss Automotive & Wood Finish Thinner No. SP-56',
    tag: 'Automotive & Wood',
    description: 'Premium grade SP-56 thinner engineered for high luster, anti-blooming, and flawless gloss on automotive bodies and fine wood furniture.',
    image_url: '/images/products/sp-56-higloss-thinner.jpg'
  },
  {
    name: 'Retarder - Cum - Thinner No. RT-105',
    tag: 'Specialty Retarder',
    description: 'Advanced RT-105 retarder-cum-thinner designed to delay drying speed in humid conditions, preventing blush marks and surface roughness.',
    image_url: '/images/products/rt-105-retarder-thinner.jpg'
  },
  {
    name: 'Anmol Shine Thinner No. S4 / 54',
    tag: 'Commercial Grade',
    description: 'Reliable and cost-effective commercial thinner ideal for general paint dilution, brush cleaning, and spray gun maintenance.',
    image_url: '/images/products/thinner-no-54.jpg'
  },
  {
    name: 'Anmol Shine Eagle Thinner',
    tag: 'NC & PU Grade',
    description: 'Heavy-duty NC and PU compatible thinner for industrial manufacturing, machinery finishing, and wood polish applications.',
    image_url: '/images/products/eagle-thinner.jpg'
  },
  {
    name: 'Mineral Turpentine Oil (MTO)',
    tag: 'High Purity Solvent',
    description: 'Pure MTO refined for paint formulation, varnish thinning, dry cleaning, resin production, and heavy industrial cleaning.',
    image_url: '/images/products/mineral-turpentine-oil-mto.jpg'
  },
  {
    name: 'Pure Turpentine Oil Range',
    tag: 'Refined Solvents',
    description: 'Extensive range of white tarpeen and turpentine oils packaged in 200ml, 500ml, 1L, 5L, and 200L industrial containers.',
    image_url: '/images/products/turpentine-oil-bottles.jpg'
  },
  {
    name: 'Industrial Thinner & Solvent Suite',
    tag: 'Bulk Industrial Pack',
    description: 'Complete range of synthetic enamel thinners, lacquer thinners, and solvent solutions tailored for large scale industrial plants.',
    image_url: '/images/products/thinner-range-white.jpg'
  },
  {
    name: 'Anmol Shine Complete Product Combo',
    tag: 'Flagship Trio',
    description: 'Our signature combination pack including RT-105, SP-56 Hi-Gloss Thinner, and Mineral Turpentine Oil for comprehensive coating needs.',
    image_url: '/images/products/thinner-combo-pack.jpg'
  }
];

for (const p of seedProducts) {
  insert.run(p.name, p.tag, p.description, p.image_url);
}

// Seed sample inquiries if inquiries table is empty
const inquiryCountRow = db.prepare('SELECT COUNT(*) AS n FROM inquiries').get();
if (inquiryCountRow && inquiryCountRow.n === 0) {
  const insertInquiry = db.prepare(`
    INSERT INTO inquiries (type, name, email, phone, company, product_interest, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInquiry.run(
    'quote',
    'Rajesh Verma',
    'rajesh@vermaauto.com',
    '+91-9811223344',
    'Verma Automotive Ltd',
    'Paint Thinner (NC & PU Grade)',
    'We require 200 Litres of NC Thinner monthly for our vehicle repaint workshop in Delhi NCR. Please send bulk pricing and MSDS.',
    'new'
  );

  insertInquiry.run(
    'quote',
    'Sanjay Mehta',
    'sanjay@mehtawoodcraft.com',
    '+91-9876543210',
    'Mehta Woodcrafts',
    'Wood Finish Hi-Gloss Thinner',
    'Interested in 500 Litres drum supply of Hi-Gloss Wood Polish Thinner. Kindly quote FOB rates.',
    'contacted'
  );

  insertInquiry.run(
    'contact',
    'Priya Sharma',
    'priya@chemcorp.in',
    '+91-9988776655',
    'ChemCorp Distributors',
    'Mineral Turpentine Oil (MTO)',
    'Looking for dealership / distribution partnership in Gujarat state for MTO and Kerosene solvents.',
    'closed'
  );
}

module.exports = db;
