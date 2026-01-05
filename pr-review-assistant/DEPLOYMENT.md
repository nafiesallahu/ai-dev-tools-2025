# Deployment

Minimal, realistic deployment instructions for the **PR Review Assistant**.

## Backend (Render) — Docker Web Service

Render can deploy the backend directly from this repo using the existing `backend/Dockerfile`.

### Step-by-step

1. Push your repo to GitHub.
2. In Render: **New → Web Service** → connect your repo.
3. Choose **Environment: Docker**.
4. Configure:
   - **Root Directory**: `ai-dev-tools-2025/pr-review-assistant/backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/health`
5. Start command:
   - If Render asks for a start command, use:
     - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - (Alternative) A `Procfile` is included at `backend/Procfile`.
6. Deploy.

### Environment variables (Render)

Required / recommended:

- **`PORT`**: Render provides this automatically.
- **`FRONTEND_ORIGIN`**: your deployed Vercel URL (CORS allow origin)
  - Example: `FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app`
- **`PYTHONPATH`**: `/app` (optional; Dockerfile already sets it)

### Expected live URL

Render will assign something like:
- `https://<your-render-service>.onrender.com`

Verify:
- `curl https://<your-render-service>.onrender.com/health` → `{"status":"ok"}`
- `curl https://<your-render-service>.onrender.com/` → message JSON
- `https://<your-render-service>.onrender.com/docs` (OpenAPI UI)

## Frontend (Vercel) — Vite static deploy

The frontend reads the backend base URL from **`VITE_API_BASE_URL`** at build time.

### Important note: dev proxy vs production base URL

- **Local Docker/dev**: frontend uses `VITE_API_BASE_URL=/api` and Vite proxies `/api/*` → backend container.
- **Production (Vercel)**: set `VITE_API_BASE_URL` to the full backend URL (no `/api` prefix unless you add rewrites).
  - Example: `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

### Step-by-step (Vercel)

1. Import the repo into Vercel.
2. Set project settings:
   - **Root Directory**: `ai-dev-tools-2025/pr-review-assistant/frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable (Production + Preview):
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
4. Deploy.

### Post-deploy verification

- Backend:
  - `curl <backend_url>/health` → `{"status":"ok"}`
  - `curl <backend_url>/` → message JSON
- Frontend UI:
  - Open `https://<your-vercel-app>.vercel.app`
  - Click **Health** → should show **ok**
  - Submit a diff to **Review PR** → should show summary/score/findings


