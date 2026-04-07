# Deployment Guide

This application uses **Render** for the backend and **Vercel** for the frontend.

---

## Quick Start (5 Minutes)

### Step 1: Generate JWT Secret
Open PowerShell/Terminal and run:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output — you'll need it for Render.

### Step 2: Deploy Backend to Render (5 min)

1. Go to **https://render.com** → Sign up if needed
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Connect GitHub:
   - Click **"Connect account"** 
   - Authorize Render to access your GitHub
   - Select **"varshinisrikavitha-ai/RequestTracker"** repo
5. Fill in service details:
   - **Name:** `request-tracker-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Choose "Standard" (pays per usage)

6. Add **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV = production
   PORT = 5000
   JWT_SECRET = [Paste the secret from Step 1]
   JWT_EXPIRES_IN = 7d
   BCRYPT_ROUNDS = 12
   UPLOAD_DIR = uploads
   MAX_FILE_SIZE_MB = 10
   EMAIL_ENABLED = false
   CLIENT_URL = https://request-tracker-frontend.vercel.app
   ```

7. Click **"Create Web Service"** → Wait for deployment (2-3 min)

8. Once deployed, you'll see a URL like: `https://request-tracker-backend.onrender.com`
   - **Copy this URL** — you'll need it for the frontend!

9. **Create Database** while backend deploys:
   - In Render dashboard, click **"New +"**
   - Select **"PostgreSQL"**
   - **Name:** `request_tracker_db`
   - **Plan:** Standard
   - **Region:** Same as backend
   - Click **"Create Database"**

10. **Connect Database to Backend Service:**
    - Go back to your backend service
    - Click **"Environment"** tab
    - Add new env var:
      ```
      DATABASE_URL = [Copy the connection string from PostgreSQL details]
      ```
    - Click **"Save"** — backend will redeploy automatically

11. **Initialize Database:**
    - In your backend service, click **"Shell"** tab
    - Run these commands one by one:
      ```bash
      npm run db:migrate:prod
      npm run db:seed
      ```
    - Wait for each to complete

✅ **Backend is now live!**

---

### Step 3: Deploy Frontend to Vercel (3 min)

1. Go to **https://vercel.com** → Sign up if needed
2. Click **"Add New"** (top right)
3. Select **"Project"**
4. **Import GitHub repo:**
   - Search for **"RequestTracker"**
   - Click import
5. **Configure project:**
   - **Framework Preset:** Vercel auto-detects Vite ✓
   - **Root Directory:** `/` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add:
     ```
     VITE_API_URL = https://request-tracker-backend.onrender.com/api
     ```
     (Replace with your actual Render backend URL from Step 2)

7. Click **"Deploy"** → Wait 1-2 minutes

8. Once deployed, you'll see your frontend URL:
   - Example: `https://request-tracker-frontend.vercel.app`

✅ **Frontend is now live!**

---

### Step 4: Test It Works

1. Open your frontend URL: `https://request-tracker-frontend.vercel.app`
2. Try logging in with demo credentials (from SETUP.md)
3. Submit a request, check approvals, etc.
4. Everything should work!

---

## Backend Deployment (Render)

### Prerequisites
- Render account (https://render.com)
- GitHub repository connected to Render

### Steps

1. **Connect GitHub to Render**
   - Go to https://dashboard.render.com
   - Click "Create +" → "Web Service"
   - Select your GitHub repository
   - Choose "request-tracker-backend" or your repo name

2. **Configure Service**
   - **Name:** `request-tracker-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Standard or higher

3. **Set Environment Variables**
   In Render dashboard, under "Environment":
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=[Generate a strong secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE_MB=10
   EMAIL_ENABLED=false
   CLIENT_URL=https://request-tracker-frontend.vercel.app
   ```

4. **Create PostgreSQL Database**
   - In Render dashboard, click "New" → "PostgreSQL"
   - **Name:** `request_tracker_db`
   - **Plan:** Standard
   - Copy the connection string from Render
   - Add as `DATABASE_URL` env var in web service

5. **Deploy**
   - Render auto-deploys on push to `main` branch
   - Check deployment status in Render dashboard
   - Your backend URL: `https://request-tracker-backend.onrender.com`

6. **Initialize Database**
   - After first deployment, run migrations:
   ```bash
   # In Render dashboard, use "Shell" to run commands
   npm run db:migrate:prod
   npm run db:seed
   ```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel

### Steps

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel auto-detects it's a Vite project

2. **Configure Build Settings**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Set Environment Variables**
   In Vercel project settings, under "Environment Variables":
   ```
   VITE_API_URL=https://request-tracker-backend.onrender.com/api
   ```

4. **Deploy**
   - Vercel auto-deploys on push to `main` branch
   - Your frontend URL: `https://request-tracker-frontend.vercel.app` (or your custom domain)

5. **Update Backend CORS (if needed)**
   - If frontend and backend are on different domains, ensure CORS is enabled
   - In `backend/src/app.js`, update:
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

---

## Local Development

1. **Frontend**
   ```bash
   npm install
   npm run dev
   # Runs on http://localhost:5173
   # Uses VITE_API_URL=http://localhost:5000/api
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on http://localhost:5000
   # Requires PostgreSQL running locally
   ```

---

## GitHub Deployment Workflow

Both services auto-deploy when you push to `main`:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Render Backend**
   - Automatically triggers build
   - Runs migrations if needed
   - Deploys to https://request-tracker-backend.onrender.com

3. **Vercel Frontend**
   - Automatically triggers build
   - Optimizes and deploys to your Vercel domain
   - Frontend points to Render backend via `VITE_API_URL`

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Ensure `DATABASE_URL` is set correctly
- Run migrations: `npm run db:migrate:prod`

### Frontend can't reach backend
- Check `VITE_API_URL` matches Render backend URL
- Ensure backend CORS allows frontend domain
- Check browser console for network errors

### Database connection issues
- Verify `DATABASE_URL` format
- Ensure PostgreSQL instance is running on Render
- Run `npm run db:migrate:prod` to apply migrations

### Cold starts on Render
- Free tier instances sleep after 15 min inactivity
- Upgrade to "Standard" plan for always-on instances
- Or accept 30-second cold start time

---

## Additional Notes

- **Free Tier vs Paid:**
  - Render free databases are acceptable for small projects
  - Vercel free tier is generous and recommended
  
- **Scaling:** Both services scale automatically with higher plans

- **Logs:** Monitor both Render and Vercel dashboards for errors

---

For more details:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
