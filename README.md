# PawTrack 🐾
### Urban Animal Welfare & Public Safety Platform

PawTrack is a multi-species urban animal welfare and municipal public safety platform connecting citizens, field response units, veterinary partners, and municipal administrators.

---

## 🏗 Monorepo Architecture

```
paw-track/
├── apps/
│   ├── web/        # Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide icons
│   ├── api/        # Node.js + Express, TypeScript, Mongoose, JWT Auth + RBAC
│   └── nlp/        # Python / FastAPI placeholder stub (Multi-Species & AI Triage)
├── package.json    # Root npm workspaces configuration
└── README.md       # Project architecture and developer guide
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React |
| **Backend API** | Node.js, Express, TypeScript, Helmet, Express-Rate-Limit, Zod |
| **Database & ODM**| MongoDB Atlas, Mongoose 8.x with `2dsphere` geospatial indexing |
| **Authentication** | Dual JWT (Short-lived Access + Hashed Rotated Refresh Tokens), bcrypt |
| **Authorization** | Enforced API-level RBAC Middleware (`citizen`, `field_worker`, `admin`) |
| **AI / NLP Service**| Python / FastAPI (Stubbed for subsequent milestone) |

---

## 🗄 Data Models (Mongoose)

### 1. User Model (`apps/api/src/models/User.ts`)
- `name`: String (2-100 chars)
- `email`: String (Unique, validated)
- `password`: String (Hashed with `bcryptjs` cost factor 10, excluded from JSON/queries by default)
- `role`: Enum `['citizen', 'field_worker', 'admin']` (default: `'citizen'`)
- `organization`: Optional reference / string
- `refreshToken`: String (Hashed SHA-256 token for secure rotation & revocation)
- `createdAt`, `updatedAt`

### 2. Report Model (`apps/api/src/models/Report.ts`)
- `species`: Enum `['dog', 'cat', 'cattle', 'monkey', 'bird', 'other']`
- `category`: Enum `['injury', 'bite_incident', 'stray_sighting', 'sterilization_request', 'cruelty_report', 'roadkill', 'adoption_inquiry']`
- `description`: String (5-2000 chars)
- `photos`: Array of URLs
- `location`: `{ type: "Point", coordinates: [lng, lat], address: String, zone: String }` (Indexed with `2dsphere`)
- `status`: Enum `['submitted', 'classified', 'assigned', 'in_progress', 'resolved']`
- `statusHistory`: Array of `{ status, timestamp, updatedBy, note }` for SLA tracking
- `reportedBy`: Ref `User`
- `assignedTo`: Optional Ref `User`
- **Future NLP Placeholders:** `urgencyScore`, `sentiment`, `entities`, `embedding`, `isDuplicate`, `originalReport`

---

## 🔒 Authentication & RBAC Flow

1. **Registration / Login:**
   - `POST /api/auth/register` & `POST /api/auth/login`
   - Returns short-lived `accessToken` (15m) + longer-lived `refreshToken` (7d).
   - Stores cryptographic SHA-256 hash of refresh token in MongoDB.
2. **Refresh Token Rotation:**
   - `POST /api/auth/refresh`
   - Compares incoming token hash against DB. If matched, issues a **brand new access token AND a new rotated refresh token**, updating the stored hash.
   - Prevents token reuse; if an old token is presented, the user session is immediately revoked.
3. **API-Level RBAC Enforcement:**
   - Middleware `requireRole(['admin'])`, `requireRole(['field_worker', 'admin'])`, `requireRole(['citizen', 'admin'])` protects endpoints at the backend layer.
4. **Rate Limiting:**
   - Express rate limiter on auth endpoints (30 req / 15 min window) to prevent brute force.

---

## 🖥 Frontend Portals (Stitch UI Shells)

| Route | Protected Role | Stitch Design Screen |
|---|---|---|
| `/` | Public | **Landing Page** (Hero, 12,450 Reports Stat, 94% Resolution, <2h Response) |
| `/login` | Public | **Sign In** (with 1-click Demo Persona Switcher) |
| `/signup` | Public | **Sign Up** (Role selector with Citizen, Field Worker, Admin) |
| `/dashboard/citizen` | `citizen`, `admin` | **Citizen Portal** (Species selector, map pin, report draft form, Track My Reports) |
| `/dashboard/field-worker` | `field_worker`, `admin` | **Field Operations** (Active queue, optimal route map, In-Transit/On-Site/Resolve control, AI Insights case inspector) |
| `/dashboard/admin` | `admin` | **Admin Oversight** (Analytics overview, Thermal Heatmap, Species breakdown, Field reports data table) |

---

## 🛠 Local Development Quickstart

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB instance or Atlas URI (optional for UI preview)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `apps/api`:
```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Run Development Servers
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
npm run dev:api   # Express API at http://localhost:5001
npm run dev:web   # Next.js App at http://localhost:3000
```

---

## 📋 Multi-Step Roadmap

- [x] **Step 1 (Foundation):** Monorepo setup, Mongoose schemas (User & Report), JWT Auth with refresh token rotation, Express RBAC, Next.js 15 UI shells matching Stitch designs.
- [x] **Step 2 (Report Submission & Media Pipeline):** Cloudinary photo uploads (free-tier with 1-retry fallback), Multer 5MB/MIME validation, Zod validation & XSS sanitization, 2dsphere spatial nearby search, per-user rate limiting (10/hr), server-side RBAC, real-time citizen portal integration, and 13 Jest/Supertest automated tests.
- [x] **Step 3 (NLP & AI Intelligence Service):** Python/FastAPI microservice (`apps/nlp`), Zero-Shot HuggingFace category classifier (91.67% accuracy), Species-aware spaCy domain NER, Explainable Urgency/Sentiment scoring, SentenceTransformers semantic duplicate detection (100% precision at threshold 0.70), and resilient Node.js Express async enrichment queue.
- [ ] **Step 4 (Field Dispatch & Live Status Workflow):** Real-time dispatch updates, SLA timer calculations, Field Worker case management, and AI triage explainability panel.
- [ ] **Step 5 (Admin Analytics & Public Reporting):** Live Heatmap aggregation, export pipelines (CSV/PDF), and Public Transparency portal.