# Deployment

This guide shows a minimal, realistic deployment path for the **PR Review Assistant**.

## Backend (Render) — Docker Web Service

Render can deploy the backend directly from the repo using the existing `backend/Dockerfile`.

### Steps

1. Push your repo to GitHub.
2. In Render, create a **New → Web Service**.
3. Select your GitHub repo.
4. Choose **Environment: Docker**.
5. Configure:
   - **Root Directory**: `ai-dev-tools-2025/pr-review-assistant/backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/health`
6. Deploy.

### Environment variables

Render will provide `PORT` automatically (not required by this app since the container listens on 8000), but you can keep configuration explicit if you prefer:

- **`PYTHONPATH`**: `/app` (already set in the Dockerfile; optional in Render)
- **`CORS_ALLOW_ORIGINS`**: comma-separated list of allowed frontend origins
  - Example:
    - `CORS_ALLOW_ORIGINS="https://your-frontend.vercel.app,https://your-frontend.netlify.app"`

### Expected live URLs

Render assigns a URL like:
- `https://<your-service-name>.onrender.com`

Once deployed, verify:
- Health: `https://<your-service-name>.onrender.com/health`
- Docs: `https://<your-service-name>.onrender.com/docs`
- OpenAPI: `https://<your-service-name>.onrender.com/openapi.json`

## Frontend (Vercel or Netlify) — static hosting (recommended)

The frontend can be deployed as a static Vite build. You’ll point it at the deployed backend using `VITE_API_BASE_URL`.

### Key environment variable

- **`VITE_API_BASE_URL`**: set this to the **backend base URL**
  - Example: `VITE_API_BASE_URL="https://<your-service-name>.onrender.com"`

> Note: In local Docker Compose we use `VITE_API_BASE_URL=/api` and Vite proxies `/api` to the backend container. On hosted static deployments, you typically set `VITE_API_BASE_URL` to the full backend URL instead.

### Vercel (example)

1. Import the repo in Vercel.
2. Set project settings:
   - **Root Directory**: `ai-dev-tools-2025/pr-review-assistant/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-service-name>.onrender.com`
4. Deploy.

### Netlify (example)

1. New site from Git → select repo.
2. Configure:
   - **Base directory**: `ai-dev-tools-2025/pr-review-assistant/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-service-name>.onrender.com`
4. Deploy.

## Post-deploy checklist

- Backend responds at `/health` and `/docs`
- Frontend loads and can:
  - run the **Health** check successfully
  - submit a diff to **/review** and display results
- `CORS_ALLOW_ORIGINS` includes your hosted frontend URL(s)


