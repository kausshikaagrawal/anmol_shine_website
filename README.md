# Anmol Shine — Backend + Website

Backend and website for **M/S Anmol Enterprises** ("Anmol Shine"), built to sit behind the
existing frontend design. Node.js/Express API, SQLite database, and three pages: the
homepage (data-driven product catalog), a quote/contact form, and a password-protected
admin dashboard.

## What this adds on top of the static site

- **Product catalog API** — products live in a SQLite table, not hardcoded HTML. The
  homepage fetches them at runtime, so adding/editing a product is a database row, not a
  code change.
- **Quote & contact form** — `contact.html` posts to a real endpoint, validates input on
  the server, and stores every submission.
- **Admin dashboard** (`/admin.html`) — a key-protected view of all incoming inquiries,
  with basic stats (totals, new vs. contacted, most-requested products) and status
  tracking (new → contacted → closed).
- **Security basics** — input validation, rate limiting on the form endpoint, Helmet
  security headers, and a fail-closed admin auth check.

## Project structure

```
anmol-shine/
├── server.js              # Express app entry point
├── db.js                  # SQLite connection, schema, product seed data
├── routes/
│   ├── products.js        # GET /api/products, GET /api/products/:id
│   ├── inquiries.js       # POST /api/inquiries (quote/contact form submissions)
│   └── admin.js            # Protected: list/update inquiries, dashboard stats
├── middleware/
│   └── adminAuth.js        # Checks the x-admin-key header against ADMIN_KEY
└── public/
    ├── index.html           # Homepage (dynamic product section)
    ├── contact.html         # Quote/contact form
    ├── admin.html            # Admin dashboard (login gate + table)
    └── js/
        ├── products.js       # Fetches & renders products on the homepage
        ├── contact.js         # Handles form submit + validation feedback
        └── admin.js            # Dashboard login, stats, inquiries table
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and set `ADMIN_KEY` to a long random string (e.g. run
   `openssl rand -hex 16` and paste the result). This key is what protects
   `/admin.html` and all `/api/admin/*` routes.

3. **Run it**
   ```bash
   npm start        # production
   npm run dev       # auto-restarts on file changes
   ```
   Visit `http://localhost:3000`. The SQLite database (`data.sqlite`) and its
   tables are created automatically on first run, with the four products
   pre-seeded.

4. **Try the admin dashboard**
   Go to `http://localhost:3000/admin.html` and sign in with the `ADMIN_KEY`
   you set in `.env`.

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | none | List all products |
| GET | `/api/products/:id` | none | Get one product |
| POST | `/api/inquiries` | none (rate-limited: 10 / 15 min per IP) | Submit a quote request or contact message |
| GET | `/api/admin/inquiries?status=&type=` | `x-admin-key` header | List inquiries, optionally filtered |
| PATCH | `/api/admin/inquiries/:id` | `x-admin-key` header | Update an inquiry's status |
| GET | `/api/admin/stats` | `x-admin-key` header | Dashboard summary numbers |
| GET | `/api/health` | none | Uptime check |

**Example — submitting a quote request:**
```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "type": "quote",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "product_interest": "Paint Thinner",
    "message": "Need 50 litres monthly for our workshop."
  }'
```

## Pages not included

The uploaded homepage links to `About Us` and `Products` pages
(`about.html`, `products.html`) that weren't provided, so those links currently
point at filenames that don't exist yet. If you generate those pages with Stitch
too, drop the exported HTML into `public/about.html` and `public/products.html`
and the nav links will resolve automatically — no other changes needed. For the
products page specifically, consider reusing the pattern in `public/js/products.js`
so it's also pulled from `/api/products` instead of hardcoded.

## Known things to fix before going live

- **Product images** are currently the original Stitch/AI-preview CDN links
  (`lh3.googleusercontent.com/aida/...`). These are temporary preview assets and
  may stop working outside the Stitch environment. Replace them with real
  product photos hosted in `public/images/` and update the `image_url` values
  in `db.js` (or add an admin route to manage products, if you want to extend this).
- **Email notifications**: right now, submitted inquiries only land in the
  database and the admin dashboard — nobody gets emailed. If you want an email
  alert on new submissions, the simplest add is a transactional email service
  like Resend or SendGrid, called inside `routes/inquiries.js` after the insert.
- **WhatsApp link**: the floating WhatsApp button in `index.html` points to
  `+91-9936431461` — double check this is the right number to receive inquiries.

## Deployment notes

This uses a **file-based SQLite database**, which needs a server with a
persistent filesystem — it will *not* work on serverless/edge platforms like
Vercel's default deployment, since the filesystem resets between requests there.

Straightforward options:
- **Render** or **Railway** — both support long-running Node processes with a
  persistent disk; deploy the repo, add `ADMIN_KEY` as an environment variable,
  set the start command to `npm start`.
- If you want to stay within Vercel/Netlify's model, swap SQLite for a hosted
  Postgres (e.g. Supabase or Neon's free tier) — the code changes are isolated
  to `db.js`; the routes wouldn't need to change much since they use plain SQL.

Either way, **never commit `.env`** — it's already in `.gitignore`, but double
check before pushing to a public GitHub repo, since that's where `ADMIN_KEY`
lives.

## For your resume

This gives you concrete, honest bullet points:
```
- Built a full-stack business website for [company] using Node.js, Express,
  and SQLite, with a REST API serving a dynamic product catalog
- Implemented a quote-request system with server-side validation, rate
  limiting, and a password-protected admin dashboard for lead management
- Designed the dashboard to surface actionable metrics (inquiry volume,
  most-requested products, response status) for business use
```
