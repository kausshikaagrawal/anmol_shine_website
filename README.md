# 🧪 Anmol Shine — Enterprise B2B Manufacturing Platform & Admin CRM

> **Live Demo:** [anmolshine.com](https://anmolshine.com) | Deployed on Vercel Serverless Architecture  
> **Tech Stack:** Node.js, Express, SQLite (Dual Native/Serverless Memory Engine), Vercel Edge Runtime, Tailwind CSS, Google Fonts, Chart & Analytics Engine

A production-grade, full-stack B2B enterprise web application and Customer Relationship Management (CRM) platform engineered for **M/S Anmol Enterprises** ("Anmol Shine") — a premier industrial chemical and solvent manufacturer in Kanpur, UP, exporting to 10+ countries.

---

## 🌟 Key Features & Portfolio Highlights

### ⚡ 1. Edge & Visitor Analytics Engine
- **Automated Edge Request Tracking**: Middleware intercepts and logs page requests, IP addresses, country/city geolocation headers (`x-vercel-ip-country`), device User-Agent, and referrer metadata.
- **Real-Time Traffic Dashboard**: Live visualization of active edge sessions and visitor activity on the admin dashboard.

### 🏢 2. Executive CRM & Lead Pipeline
- **Searchable Customer Database**: Instant search by customer name, email, phone number, company, or product interest.
- **Status Pipeline Management**: Track customer leads from `New` → `Contacted` → `Closed / Deal`.
- **1-Click Sales Communication**: Integrated direct action buttons for **1-click Phone Calls** (`tel:`), **Custom WhatsApp Conversations** (`https://wa.me/...`), and **Email** (`mailto:`).
- **Manual Lead Logger**: Integrated modal allowing plant management to log walk-in, phone, or offline client inquiries.
- **Data Export**: One-click **Export to CSV** generating clean Excel-ready reports (`anmol_shine_customers.csv`).

### 📦 3. Data-Driven Dynamic Product Catalog
- **RESTful Product API**: Decoupled database schema serving products (`GP-50`, `SP-56 Hi-Gloss`, `RT-105 Retarder`, `MTO`, `Thinner No. 54`, etc.) with instant searching and tab filtering.
- **Packaging Container Matrix**: Technical showcase covering 200ml PET bottles, 5L jerry cans, 20L commercial drums, and 200L industrial barrels.

### 🎨 4. Ultra-Premium Responsive Design System
- **Hero Product Slider**: Automated cross-fading hero slideshow featuring pure product renders.
- **Interactive SVG Global Connectivity Map**: Custom animated SVG globe depicting Kanpur HQ supply arcs to UAE, Germany, UK, USA, Kenya, Singapore, Japan, and Australia.
- **Industrial Timeline**: Interactive milestone card journey tracing company expansion from 2000 to 2018+.

---

## 🛠️ Architecture & Tech Stack

- **Backend Framework**: Node.js, Express.js
- **Database Architecture**: SQLite via `node:sqlite` Native DatabaseSync + Ephemeral In-Memory Adapter for Vercel Serverless compatibility.
- **Security & Reliability**: Helmet Content Security Policy, Express Rate Limiting (10 req / 15 min), Input Sanitization & Validation via `express-validator`.
- **Frontend Architecture**: Vanilla JS ES6+, Tailwind CSS (v3 with Custom Theme Extensions), Material Symbols, Inter Typography.

---

## 📂 Repository Structure

```
anmol-shine-website/
├── server.js               # Express application entry point & middleware pipeline
├── db.js                   # Dual SQLite / Serverless Memory Database & Visitor Logger
├── vercel.json             # Vercel deployment configuration
├── .env                    # Local environment variables
├── middleware/
│   └── adminAuth.js        # Flexible Session Key authentication middleware
├── routes/
│   ├── products.js         # GET /api/products, GET /api/products/:id
│   ├── inquiries.js        # POST /api/inquiries, POST /api/inquiries/whatsapp
│   └── admin.js            # Protected CRM & Analytics endpoints (GET/POST/PATCH/DELETE)
└── public/
    ├── index.html          # Homepage with Hero Slider & Interactive SVG Globe
    ├── about.html          # Company Profile, Milestone Timeline & Leadership
    ├── products.html       # Searchable & Filterable Product Catalog
    ├── contact.html        # Quote Request & Contact Form with Validation Modal
    ├── admin.html          # Executive Admin Portal (CRM + Analytics + Visitor Logs)
    ├── js/
    │   ├── products.js     # Product catalog rendering script
    │   ├── contact.js      # Contact form handling & modal logic
    │   └── admin.js        # Admin dashboard CRM engine, search & CSV export
    └── images/             # Product photos & company media assets
```

---

## 🚀 Local Development Setup

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/your-username/anmol-shine-website.git
   cd anmol-shine-website
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   ADMIN_KEY=anmol123
   ```

3. **Start Local Dev Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Access Admin Portal**
   Navigate to `http://localhost:3000/admin.html` and sign in with default key: `anmol123`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve list of all industrial thinners & solvents |
| `GET` | `/api/products/:id` | Fetch specific product details |
| `POST` | `/api/inquiries` | Submit customer quote request or contact message |
| `POST` | `/api/inquiries/whatsapp` | Track visitor WhatsApp click interactions |
| `GET` | `/api/admin/inquiries` | List all customer inquiries (filterable by status, type, query) |
| `POST` | `/api/admin/inquiries` | Manually record a customer contact lead |
| `PATCH` | `/api/admin/inquiries/:id` | Update inquiry status (`new`, `contacted`, `closed`) & internal notes |
| `DELETE` | `/api/admin/inquiries/:id` | Delete a customer contact record |
| `GET` | `/api/admin/stats` | Executive KPI numbers, product demand metrics & live visitor traffic logs |
| `GET` | `/api/health` | Service status check |

---

## 🎯 Resume & Portfolio Bullet Points

```
• Developed a full-stack B2B industrial e-commerce platform & CRM for Anmol Enterprises (anmolshine.com) using Node.js, Express, SQLite, and Tailwind CSS.
• Built a real-time Admin CRM featuring customer lead search, status pipeline tracking, 1-click WhatsApp/Call integrations, and automated CSV data exports.
• Designed an Edge Traffic Logging Engine capturing visitor sessions, IP geolocations, device metrics, and request volumes for executive analytics.
• Implemented dual native/serverless SQLite memory adapters ensuring zero-downtime deployment compatibility on Vercel.
```

---

## 📄 License & Attribution

© 2026 M/S Anmol Enterprises. Built for Industrial Excellence.
