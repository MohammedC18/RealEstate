# 🚀 Aayat Real Estate — Deployment Guide

This guide walks you through deploying your **Frontend** on Vercel and your **Backend** on Render.com. Follow the steps in order.

---

## Overview

| Part | Platform | URL (after deploy) |
|------|----------|--------------------|
| Frontend (React/Vite) | **Vercel** | `https://your-app.vercel.app` |
| Backend (FastAPI/Python) | **Render.com** | `https://your-api.onrender.com` |
| Database (MongoDB) | **MongoDB Atlas** | Already set up ✅ |

---

## Part 1 — Deploy Backend on Render.com

### Step 1: Create Account
Go to **[render.com](https://render.com)** → Sign up (free) → Connect your GitHub account.

### Step 2: New Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your repo: `MohammedC18/RealEstate`
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `aayat-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

### Step 3: Add Environment Variables
In Render → Your Service → **"Environment"** tab → Add these one by one:

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://AayatRealEstate:910uMmC967fE5IMv@cluster0.vfjle33.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority` |
| `DB_NAME` | `AayatRealEstate` |
| `CORS_ORIGINS` | `*` |
| `JWT_SECRET` | `super-secret-key-aayat-2026` |

> [!IMPORTANT]
> After deploying, Render gives you a URL like `https://aayat-backend.onrender.com`. **Copy this URL** — you need it in Part 2.

> [!WARNING]
> Free tier Render services **spin down after 15 minutes of inactivity**. The first request after idle takes ~30 seconds to wake up. Upgrade to a paid plan ($7/mo) to avoid this.

---

## Part 2 — Deploy Frontend on Vercel

### Step 1: Create Account
Go to **[vercel.com](https://vercel.com)** → Sign up (free) → Connect your GitHub account.

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select repo: `MohammedC18/RealEstate`
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |

### Step 3: Add Environment Variables
In the same import screen → expand **"Environment Variables"** → add:

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | `https://aayat-backend.onrender.com` ← paste your Render URL here |

> [!IMPORTANT]
> Replace `https://aayat-backend.onrender.com` with the **actual URL** from Part 1 Step 3.

### Step 4: Deploy
Click **"Deploy"**. Vercel will build and publish your site. Takes about 2 minutes.

---

## Part 3 — Fix CORS After Deployment

Once both are live, update your backend's `CORS_ORIGINS` environment variable on Render to only allow your Vercel domain (more secure):

1. Go to Render → your backend service → **Environment**
2. Update `CORS_ORIGINS` from `*` to your Vercel URL:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
3. Click **"Save Changes"** → Render will auto-redeploy.

---

## Part 4 — MongoDB Atlas: Allow Cloud IPs

By default, MongoDB Atlas only allows connections from specific IPs. You need to allow Render's servers.

1. Go to **[cloud.mongodb.com](https://cloud.mongodb.com)**
2. Go to **Network Access** → **"Add IP Address"**
3. Click **"Allow Access From Anywhere"** → `0.0.0.0/0`
4. Click **"Confirm"**

> [!TIP]
> This is already set to `0.0.0.0/0` if your local dev was working. You can skip this step if your backend on Render can connect to MongoDB.

---

## Part 5 — Verify Everything Works

After deploying, test these URLs:

| Check | URL | Expected |
|-------|-----|----------|
| Backend alive | `https://your-api.onrender.com/api/` | `{"message":"Aayat Real Estate API"}` |
| Properties load | `https://your-api.onrender.com/api/properties` | JSON list of properties |
| Frontend live | `https://your-app.vercel.app` | Your website loads |
| Admin login | Go to `/admin/login` | Login with `admin@aayat.com` / `aayat2026` |

---

## Summary Checklist

- [ ] Render account created & backend deployed
- [ ] All 4 environment variables added on Render
- [ ] Render backend URL copied
- [ ] Vercel account created & frontend deployed
- [ ] `VITE_BACKEND_URL` set on Vercel with Render URL
- [ ] MongoDB Atlas allows all IPs (`0.0.0.0/0`)
- [ ] CORS updated to your Vercel domain
- [ ] All verify checks pass ✅

---

## Local Development (for reference)

To run locally, just double-click **`start.bat`** in the project root. It starts both servers automatically.

| Server | URL |
|--------|-----|
| Frontend | `http://localhost:3000` |
| Backend | `http://127.0.0.1:8002` |
| Admin | `http://localhost:3000/admin/login` |
| API Docs | `http://127.0.0.1:8002/docs` |
