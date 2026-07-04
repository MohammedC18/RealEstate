# Deployment Guide: Aayat Real Estate

This guide outlines the process to deploy the Aayat Real Estate application (FastAPI backend + Vite/React frontend) to production.

## Prerequisites

1. **MongoDB Atlas**: An active cluster.
2. **Hosting Provider**: A VPS, Vercel (for frontend), and Render/Railway (for backend).
3. **Environment Variables**:
   - `MONGO_URL`: Your MongoDB connection string.
   - `DB_NAME`: Database name (e.g., `aayat`).
   - `JWT_SECRET`: A secure random string for JWT signing.
   - `VITE_BACKEND_URL`: URL of the deployed backend.

---

## 1. Backend Deployment (Render/Railway/VPS)

The backend is built with FastAPI and runs on Python 3.9+.

### Option A: Render / Railway (PaaS)
1. Connect your GitHub repository to Render/Railway.
2. Set the root directory to `backend/`.
3. Set the build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the start command:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
5. Add the required Environment Variables (`MONGO_URL`, `DB_NAME`, `JWT_SECRET`).
6. Deploy.

### Option B: VPS (Ubuntu)
1. Clone the repository and navigate to `backend/`.
2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Set up a systemd service to run Uvicorn.
4. Set up Nginx as a reverse proxy forwarding to `http://127.0.0.1:8001`.
5. Secure with Let's Encrypt (Certbot).

---

## 2. Frontend Deployment (Vercel/Netlify)

The frontend is a Vite + React application.

1. Connect your GitHub repository to Vercel.
2. Set the root directory to `frontend/`.
3. Vercel will automatically detect Vite. The build command is `npm run build` and the output directory is `dist`.
4. Add the Environment Variable:
   - `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://api.aayat.com`).
5. Deploy.

---

## 3. Post-Deployment Verification

1. Navigate to the frontend URL.
2. Verify the Hero Banner loads correctly.
3. Attempt to access `/admin/login`.
4. Log in using the default credentials (`admin@aayat.com` / `aayat2026`).
5. **CRITICAL**: Once logged in, you should change the default password in the database, or implement a password reset flow.
6. Submit a test lead via the Contact page and verify it appears in the Admin Dashboard.
