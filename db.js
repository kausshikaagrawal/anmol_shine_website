const path = require('path');

let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (e) {
  DatabaseSync = null;
}

const seedProducts = [
  {
    id: 1,
    name: 'General Purpose Thinner No. GP-50',
    tag: 'Industrial & Coating',
    description: 'High performance industrial thinner formulated for smooth application, rapid drying, and optimal finish across general metal and equipment coating.',
    image_url: '/images/products/gp-50-general-purpose-thinner.jpg'
  },
  {
    id: 2,
    name: 'Hi-Gloss Automotive & Wood Finish Thinner No. SP-56',
    tag: 'Automotive & Wood',
    description: 'Premium grade SP-56 thinner engineered for high luster, anti-blooming, and flawless gloss on automotive bodies and fine wood furniture.',
    image_url: '/images/products/sp-56-higloss-thinner.jpg'
  },
  {
    id: 3,
    name: 'Retarder - Cum - Thinner No. RT-105',
    tag: 'Specialty Retarder',
    description: 'Advanced RT-105 retarder-cum-thinner designed to delay drying speed in humid conditions, preventing blush marks and surface roughness.',
    image_url: '/images/products/rt-105-retarder-thinner.jpg'
  },
  {
    id: 4,
    name: 'Anmol Shine Thinner No. S4 / 54',
    tag: 'Commercial Grade',
    description: 'Reliable and cost-effective commercial thinner ideal for general paint dilution, brush cleaning, and spray gun maintenance.',
    image_url: '/images/products/thinner-no-54.jpg'
  },
  {
    id: 5,
    name: 'Anmol Shine Eagle Thinner',
    tag: 'NC & PU Grade',
    description: 'Heavy-duty NC and PU compatible thinner for industrial manufacturing, machinery finishing, and wood polish applications.',
    image_url: '/images/products/eagle-thinner.jpg'
  },
  {
    id: 6,
    name: 'Mineral Turpentine Oil (MTO)',
    tag: 'High Purity Solvent',
    description: 'Pure MTO refined for paint formulation, varnish thinning, dry cleaning, resin production, and heavy industrial cleaning.',
    image_url: '/images/products/mineral-turpentine-oil-mto.jpg'
  },
  {
    id: 7,
    name: 'Pure Turpentine Oil Range',
    tag: 'Refined Solvents',
    description: 'Extensive range of white tarpeen and turpentine oils packaged in 200ml, 500ml, 1L, 5L, and 200L industrial containers.',
    image_url: '/images/products/turpentine-oil-bottles.jpg'
  },
  {
    id: 8,
    name: 'Industrial Thinner & Solvent Suite',
    tag: 'Bulk Industrial Pack',
    description: 'Complete range of synthetic enamel thinners, lacquer thinners, and solvent solutions tailored for large scale industrial plants.',
    image_url: '/images/products/thinner-range-white.jpg'
  },
  {
    id: 9,
    name: 'Anmol Shine Complete Product Combo',
    tag: 'Flagship Trio',
    description: 'Our signature combination pack including RT-105, SP-56 Hi-Gloss Thinner, and Mineral Turpentine Oil for comprehensive coating needs.',
    image_url: '/images/products/thinner-combo-pack.jpg'
  }
];

const seedInquiries = [
  {
    id: 1,
    type: 'quote',
    name: 'Rajesh Verma',
    email: 'rajesh@vermaauto.com',
    phone: '+91-9811223344',
    company: 'Verma Automotive Ltd',
    product_interest: 'Paint Thinner (NC & PU Grade)',
    message: 'We require 200 Litres of NC Thinner monthly for our vehicle repaint workshop in Delhi NCR. Please send bulk pricing and MSDS.',
    status: 'new',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    type: 'quote',
    name: 'Sanjay Mehta',
    email: 'sanjay@mehtawoodcraft.com',
    phone: '+91-9876543210',
    company: 'Mehta Woodcrafts',
    product_interest: 'Wood Finish Hi-Gloss Thinner',
    message: 'Interested in 500 Litres drum supply of Hi-Gloss Wood Polish Thinner. Kindly quote FOB rates.',
    status: 'contacted',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    type: 'contact',
    name: 'Priya Sharma',
    email: 'priya@chemcorp.in',
    phone: '+91-9988776655',
    company: 'ChemCorp Distributors',
    product_interest: 'Mineral Turpentine Oil (MTO)',
    message: 'Looking for dealership / distribution partnership in Gujarat state for MTO and Kerosene solvents.',
    status: 'closed',
    created_at: new Date().toISOString()
  }
];

let db;

if (DatabaseSync) {
  try {
    const isVercel = Boolean(process.env.VERCEL);
    const DB_PATH = isVercel ? ':memory:' : (process.env.DB_PATH || path.join(__dirname, 'data.sqlite'));
    const sqliteDb = new DatabaseSync(DB_PATH);
    if (!isVercel) {
      sqliteDb.exec('PRAGMA journal_mode = WAL;');
    }

    sqliteDb.exec(`
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
    `);

    sqliteDb.exec('DELETE FROM products;');
    const insert = sqliteDb.prepare(`
      INSERT INTO products (name, tag, description, image_url)
      VALUES (?, ?, ?, ?)
    `);
    for (const p of seedProducts) {
      insert.run(p.name, p.tag, p.description, p.image_url);
    }

    const inquiryCountRow = sqliteDb.prepare('SELECT COUNT(*) AS n FROM inquiries').get();
    if (inquiryCountRow && inquiryCountRow.n === 0) {
      const insertInquiry = sqliteDb.prepare(`
        INSERT INTO inquiries (type, name, email, phone, company, product_interest, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const inq of seedInquiries) {
        insertInquiry.run(
          inq.type, inq.name, inq.email, inq.phone, inq.company, inq.product_interest, inq.message, inq.status
        );
      }
    }

    db = sqliteDb;
  } catch (err) {
    console.warn('SQLite init failed, falling back to memory database adapter:', err.message);
  }
}

// Fallback in-memory DB if DatabaseSync is unavailable or fails on serverless
if (!db) {
  let productsMem = [...seedProducts];
  let inquiriesMem = [...seedInquiries];
  let nextInquiryId = 4;

  db = {
    exec() {},
    prepare(sql) {
      const s = sql.trim().toLowerCase();
      return {
        run(...params) {
          if (s.includes('insert into inquiries')) {
            const newInq = {
              id: nextInquiryId++,
              type: params[0],
              name: params[1],
              email: params[2],
              phone: params[3] || null,
              company: params[4] || null,
              product_interest: params[5] || null,
              message: params[6] || null,
              status: params[7] || 'new',
              created_at: new Date().toISOString()
            };
            inquiriesMem.push(newInq);
            return { lastInsertRowid: newInq.id, changes: 1 };
          }
          if (s.includes('update inquiries set status')) {
            const [status, id] = params;
            const item = inquiriesMem.find(i => String(i.id) === String(id));
            if (item) {
              item.status = status;
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          return { lastInsertRowid: 1, changes: 1 };
        },
        get(...params) {
          if (s.includes('from products where id =')) {
            return productsMem.find(p => String(p.id) === String(params[0]));
          }
          if (s.includes('select count(*) as n from inquiries where status = \'new\'')) {
            return { n: inquiriesMem.filter(i => i.status === 'new').length };
          }
          if (s.includes('select count(*) as n from inquiries where type = \'quote\'')) {
            return { n: inquiriesMem.filter(i => i.type === 'quote').length };
          }
          if (s.includes('select count(*) as n from inquiries')) {
            return { n: inquiriesMem.length };
          }
          return undefined;
        },
        all(...params) {
          if (s.includes('from products')) {
            return productsMem;
          }
          if (s.includes('from inquiries')) {
            let res = [...inquiriesMem];
            if (params.length === 2 && s.includes('status = ?') && s.includes('type = ?')) {
              res = res.filter(i => i.status === params[0] && i.type === params[1]);
            } else if (params.length === 1 && s.includes('status = ?')) {
              res = res.filter(i => i.status === params[0]);
            } else if (params.length === 1 && s.includes('type = ?')) {
              res = res.filter(i => i.type === params[0]);
            }
            return res.reverse();
          }
          if (s.includes('date(created_at)')) {
            return [];
          }
          if (s.includes('product_interest')) {
            return [];
          }
          return [];
        }
      };
    }
  };
}

module.exports = db;
