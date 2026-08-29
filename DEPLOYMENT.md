# 🚀 PAW TRACK — Production Deployment Guide (Free Tier Architecture)

This document provides complete instructions for deploying the **PAW TRACK Platform** across production free-tier cloud infrastructure.

```
                     ┌──────────────────────────────────────┐
                     │          Vercel (Free Tier)          │
                     │       apps/web (Next.js 15 UI)       │
                     └──────────────────┬───────────────────┘
                                        │ HTTPS / WSS
                                        ▼
                     ┌──────────────────────────────────────┐
                     │          Render (Free Tier)          │
                     │     apps/api (Node/Express API)      │
                     └───────┬──────────────────────┬───────┘
                             │                      │
                  Internal   │                      │ REST API
                  HTTP / JSON│                      │
                             ▼                      ▼
         ┌────────────────────────┐    ┌────────────────────────┐
         │   Render (Free Tier)   │    │  MongoDB Atlas (M0)    │
         │ apps/nlp (FastAPI micro│    │  Cloud Database        │
         └────────────────────────┘    └────────────────────────┘
```

---

## 1. Prerequisites (All 100% Free Tier)

1. **MongoDB Atlas Account** ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
   - Free **M0 Shared Cluster** (512MB storage).
2. **Cloudinary Account** ([cloudinary.com](https://cloudinary.com))
   - Free tier (25 monthly credits / ~25,000 transformations).
3. **Render Account** ([render.com](https://render.com))
   - Free tier (Web services with 512MB RAM).
4. **Vercel Account** ([vercel.com](https://vercel.com))
   - Free tier (Hobby plan for Next.js).
5. **GitHub Repository**
   - Fork or push this repository: `https://github.com/Sriilekhaa/Paw_Track`

---

## 2. Service 1: MongoDB Atlas (Database)

1. Create a free **M0 Cluster** (select AWS / closest region to your users).
2. **Database Access**: Create a database user (e.g. `pawtrack_admin` with password).
3. **Network Access**: Add IP Access list entry `0.0.0.0/0` (Allow access from anywhere for cloud deployment).
4. **Connection String**: Copy your connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pawtrack?retryWrites=true&w=majority
   ```

---

## 3. Service 2: FastAPI NLP Microservice (`apps/nlp`) on Render

Deploy the Python AI microservice first so the Express API can point to it.

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `pawtrack-nlp`
   - **Root Directory**: `apps/nlp`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt && python -m spacy download en_core_web_sm
     ```
   - **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
     ```
   - **Instance Type**: `Free (512 MB)`
4. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.7` | Python runtime version |
   | `PORT` | `10000` | Port assigned by Render |
5. Click **Create Web Service**.
6. Note the public URL: `https://pawtrack-nlp.onrender.com` (Verify with `GET https://pawtrack-nlp.onrender.com/health`).

> [!TIP]
> **Free-Tier Memory Optimization**: The NLP service uses lightweight distilled models (`valhalla/distilbart-mnli-12-3` and `all-MiniLM-L6-v2`) which operate comfortably within Render's 512MB free tier memory limit.

---

## 4. Service 3: Node.js Express API (`apps/api`) on Render

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `pawtrack-api`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free (512 MB)`
4. **Environment Variables**:
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production environment |
   | `PORT` | `10000` | Port assigned by Render |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.../pawtrack` | Atlas connection string |
   | `JWT_ACCESS_SECRET` | `your_32char_random_access_secret_key` | Secret for short-lived JWTs |
   | `JWT_REFRESH_SECRET` | `your_32char_random_refresh_secret_key`| Secret for refresh tokens |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan |
   | `JWT_REFRESH_EXPIRES_IN`| `7d` | Refresh token lifespan |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary name |
   | `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary Secret |
   | `NLP_SERVICE_URL` | `https://pawtrack-nlp.onrender.com` | Deployed NLP service URL |
   | `CORS_ORIGIN` | `https://pawtrack.vercel.app` | Deployed Frontend domain |

5. Click **Create Web Service**.
6. Verify deployment at `https://pawtrack-api.onrender.com/health`.

### Database Seeding on Render (Post-Deploy)
Once the API is live, populate the demo data by running the seed script from your local machine pointing to the remote MongoDB Atlas database:
```bash
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.../pawtrack" NLP_SERVICE_URL="https://pawtrack-nlp.onrender.com" npm run seed --workspace=@pawtrack/api
```

---

## 5. Service 4: Next.js 15 Frontend (`apps/web`) on Vercel

1. In Vercel Dashboard, click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `apps/web`.
4. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://pawtrack-api.onrender.com/api` | Backend API URL |
   | `NEXT_PUBLIC_SOCKET_URL`| `https://pawtrack-api.onrender.com` | Backend WebSocket Gateway |
5. Click **Deploy**.
6. Vercel will build and deploy the Next.js 15 App Router interface in under 2 minutes.

---

## 6. Preconfigured Demo Accounts for Evaluators

All demo accounts are seeded with pre-filled test data across 90 days:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **City Admin** | `demo.admin@pawtrack.app` | `Password123!` | Operations Command Console, "AI Suggests" Dispatch Modal, Citywide SLA Metrics |
| **Field Officer** | `demo.officer@pawtrack.app` | `Password123!` | Assigned Dispatch Queue, AI Triage & Clinical Explainability Panel, Status Resolver |
| **Citizen User** | `demo.citizen@pawtrack.app` | `Password123!` | Incident Submission, Photo Evidence Uploader, Personal Reports History |

---

## 7. Known Free-Tier Characteristics & Hardening

- **Render Cold Starts**: Render's free tier spins down idle instances after 15 minutes of inactivity. When a new visitor accesses the app, the initial request takes ~30-50 seconds to boot.
  - *Hardening Implemented*: The frontend displays an automatic, non-blocking notification banner (`"Waking up cloud backend..."`) if an API request takes longer than 2.5 seconds, ensuring visitors are informed rather than facing blank screens.
- **WebSocket Protocol**: Socket.IO falls back gracefully from WebSockets to HTTP long-polling if intermediate cloud proxies restrict direct WebSocket upgrades.
- **Sanitization & Security**: All endpoints enforce strict Zod validation, XSS escaping, Helmet headers, and rate limiting (10 incident submissions/hr per IP).
