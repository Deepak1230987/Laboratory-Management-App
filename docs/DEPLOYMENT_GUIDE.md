# Deployment Guide

Complete guide for deploying the Laboratory Management System to production.

## Overview

This guide covers deploying:

- **Backend**: Node.js API on Render
- **Frontend**: React app on Vercel
- **Database**: MongoDB Atlas (cloud)

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://cloud.mongodb.com)
- Git installed locally

---

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account

1. Go to https://cloud.mongodb.com
2. Sign up for a free account
3. Create a new organization (or use existing)

### 2. Create a Cluster

1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider and region (closest to your users)
4. Cluster name: `Cluster0` (default)
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to **Database Access** in left sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `labsystem_user`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### 4. Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - _Required for Render and Vercel_
   - For production, restrict to specific IPs if possible
4. Click "Confirm"

### 5. Get Connection String

1. Go to **Database** in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Save this connection string for backend deployment

### 6. Create Database (Optional)

1. Click "Browse Collections"
2. Click "Add My Own Data"
3. Database name: `laboratory_management`
4. Collection name: `users`

---

## Part 2: Backend Deployment (Render)

### 1. Prepare Repository

Ensure your backend code is pushed to GitHub:

```bash
cd Laboratory-Management-App
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3. Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `Laboratory-Management-App` repository

### 4. Configure Service

**Basic Settings**:

- **Name**: `laboratory-management-api`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment**:

- **Instance Type**: Free (for testing) or Starter ($7/month for production)

### 5. Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://labsystem_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/laboratory_management?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secure_random_string_here_change_this_to_something_strong
JWT_EXPIRES_IN=7d
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**Important**:

- Replace `YOUR_PASSWORD` in `MONGODB_URI` with your actual MongoDB password
- Generate a strong `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Update `CORS_ALLOWED_ORIGINS` after deploying frontend

### 6. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete (5-10 minutes)
4. Note your backend URL: `https://laboratory-management-api.onrender.com`

### 7. Verify Deployment

Test your API:

```bash
curl https://laboratory-management-api.onrender.com/api/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

### 8. Configure Custom Domain (Optional)

1. Go to service **Settings** → **Custom Domains**
2. Click "Add Custom Domain"
3. Enter your domain: `api.yourdomain.com`
4. Add CNAME record to your DNS:
   - Name: `api`
   - Value: `laboratory-management-api.onrender.com`
5. Wait for DNS propagation (up to 48 hours)

---

## Part 3: Frontend Deployment (Vercel)

### 1. Prepare Frontend

Update `.env.production` in the client directory:

```bash
cd client
cat > .env.production << EOL
VITE_API_URL=https://laboratory-management-api.onrender.com/api
NODE_ENV=production
EOL
```

Commit changes:

```bash
git add .env.production
git commit -m "Add production environment config"
git push origin main
```

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Deploy to Vercel

```bash
cd client
vercel --prod
```

Follow the prompts:

1. Set up and deploy: **Y**
2. Which scope: Select your account
3. Link to existing project: **N**
4. Project name: `laboratory-management-app`
5. In which directory: `./` (current directory)
6. Override settings: **N**

### 4. Alternative: Deploy via Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 5. Environment Variables

In Vercel dashboard:

1. Go to project **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://laboratory-management-api.onrender.com/api
   NODE_ENV=production
   ```
3. Apply to: **Production**
4. Click "Save"

### 6. Redeploy

If you deployed via CLI, redeploy to apply environment variables:

```bash
vercel --prod
```

Your frontend will be available at:

```
https://laboratory-management-app.vercel.app
```

### 7. Update Backend CORS

Update Render environment variables:

1. Go to your Render service
2. Navigate to **Environment**
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://laboratory-management-app.vercel.app
   ```
4. Click "Save Changes"
5. Service will automatically redeploy

### 8. Configure Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Click "Add Domain"
3. Enter: `yourdomain.com`
4. Add DNS records as instructed by Vercel:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
5. Wait for DNS propagation

---

## Part 4: Post-Deployment Setup

### 1. Create Admin Account

Since this is a fresh database, create the first admin user:

**Option A: Via API (cURL)**

```bash
curl -X POST https://laboratory-management-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "secure_password_123",
    "role": "admin"
  }'
```

**Option B: Via Frontend**

1. Go to `https://laboratory-management-app.vercel.app/register`
2. Fill in registration form
3. Manually promote to admin via MongoDB Atlas:
   - Go to MongoDB Atlas → Browse Collections
   - Find `users` collection
   - Edit the user document
   - Change `role` from `"user"` to `"admin"`
   - Save

**Option C: Via MongoDB Shell**

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

### 2. Test Full Flow

1. **Registration**:

   - Visit frontend URL
   - Register a test user account
   - Verify email and password requirements

2. **Login**:

   - Log in with admin account
   - Verify JWT token is stored
   - Check admin dashboard loads

3. **Create Instrument**:

   - Go to Admin → Instruments
   - Click "Add Instrument"
   - Fill in details and upload image
   - Verify instrument appears in list

4. **User Flow**:
   - Log out of admin
   - Register/login as regular user
   - Browse instruments
   - Start using an instrument
   - Stop using instrument
   - Check usage history

### 3. Monitor Application

**Render Logs**:

```
Dashboard → Service → Logs
```

**Vercel Logs**:

```
Dashboard → Project → Deployments → View Function Logs
```

**MongoDB Atlas Monitoring**:

```
Dashboard → Monitoring → Performance/Query
```

---

## Part 5: Continuous Deployment

### Automatic Deployments

Both Render and Vercel support automatic deployments:

**On Render**:

- Automatically deploys when you push to `main` branch
- Configure in: Settings → Build & Deploy → Auto-Deploy

**On Vercel**:

- Automatically deploys on git push
- Preview deployments for pull requests
- Configure in: Settings → Git → Production Branch

### Deployment Workflow

```bash
# Make changes locally
git checkout -b feature/new-feature
# ... make changes ...

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request on GitHub
# Vercel creates preview deployment automatically

# After review, merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Automatic deployment to production
```

---

## Part 6: Environment Management

### Development Environment

**Backend** (`backend/.env`):

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laboratory_management
JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend** (`client/.env`):

```bash
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### Staging Environment (Optional)

Create separate Render service and Vercel project for staging:

**Backend Staging**:

- Service name: `laboratory-management-api-staging`
- Branch: `staging`
- Separate MongoDB database

**Frontend Staging**:

- Project name: `laboratory-management-app-staging`
- Branch: `staging`
- Custom domain: `staging.yourdomain.com`

---

## Part 7: Scaling & Performance

### Backend Scaling (Render)

**Vertical Scaling**:

- Free tier: Shared CPU, 512MB RAM
- Starter ($7/mo): Shared CPU, 512MB RAM (no sleep)
- Standard ($25/mo): 1 CPU, 2GB RAM
- Pro ($85/mo): 2 CPU, 4GB RAM

**Horizontal Scaling**:

1. Go to Settings → Scaling
2. Increase instance count
3. Add load balancer (Standard plan and above)

### Database Scaling (MongoDB Atlas)

**Vertical Scaling**:

- M0: Free (Shared, 512MB storage)
- M10: $0.08/hr (2GB RAM, 10GB storage)
- M20: $0.20/hr (4GB RAM, 20GB storage)
- M30: $0.54/hr (8GB RAM, 40GB storage)

**To Upgrade**:

1. Atlas Dashboard → Cluster
2. Click "Modify"
3. Select new tier
4. Click "Apply Changes"

### Frontend Optimization (Vercel)

**Edge Caching**:

- Static assets cached globally
- Automatic CDN distribution
- Instant cache invalidation

**Performance**:

1. Enable Vercel Analytics: Settings → Analytics → Enable
2. Monitor Core Web Vitals
3. Optimize based on insights

---

## Part 8: Backup & Recovery

### Database Backups

**MongoDB Atlas Automated Backups** (M10+):

1. Go to Backup
2. Enable Cloud Backup
3. Configure retention policy
4. Schedule: Continuous backups

**Manual Backup** (Free tier):

```bash
# Export database
mongodump --uri="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/laboratory_management"

# Restore database
mongorestore --uri="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/laboratory_management" dump/
```

### File Backups (Uploads)

**Current**: Files stored on Render (ephemeral)

**Production Solution**: Use cloud storage

1. AWS S3
2. Cloudinary
3. Google Cloud Storage

**Migration**:

- Update `backend/middleware/upload.js` to use cloud storage
- Update environment variables with storage credentials

---

## Part 9: Monitoring & Alerts

### Error Tracking

**Sentry Integration**:

```bash
# Install
npm install @sentry/node @sentry/react

# Backend (server.js)
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

# Frontend (main.tsx)
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

### Uptime Monitoring

**UptimeRobot** (Free):

1. Add monitor: https://uptimerobot.com
2. URL: `https://laboratory-management-api.onrender.com/api/health`
3. Type: HTTP(s)
4. Interval: 5 minutes
5. Alert contacts: Your email

### Performance Monitoring

**Render Metrics**:

- CPU usage
- Memory usage
- Response times

**MongoDB Atlas Monitoring**:

- Query performance
- Index usage
- Connection pool

---

## Part 10: Security Checklist

### Before Production

- [ ] Strong JWT_SECRET (64+ random characters)
- [ ] Strong database password
- [ ] CORS configured correctly (no wildcard `*`)
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Password hashing (bcrypt with 12+ rounds)
- [ ] SQL/NoSQL injection protection
- [ ] XSS protection (Helmet middleware)
- [ ] Environment variables not committed to git
- [ ] Error messages don't expose sensitive data
- [ ] File upload size limits
- [ ] File upload type restrictions
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Regular dependency updates
- [ ] Admin accounts secured

### Security Headers

Verify headers using: https://securityheaders.com

Expected headers:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`

---

## Part 11: Troubleshooting

### Backend Issues

**Problem**: Service won't start

```bash
# Check Render logs
# Common causes:
# - Missing environment variables
# - MongoDB connection failure
# - Port binding issues
```

**Solution**:

- Verify all environment variables are set
- Test MongoDB connection string locally
- Ensure PORT is not hardcoded (use `process.env.PORT`)

### Frontend Issues

**Problem**: API calls fail with CORS error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**:

- Add Vercel domain to Render `CORS_ALLOWED_ORIGINS`
- Redeploy backend after updating
- Clear browser cache

**Problem**: Environment variables not working

```
VITE_API_URL is undefined
```

**Solution**:

- Verify variable name starts with `VITE_`
- Check Vercel environment variables
- Redeploy after adding variables
- Access via `import.meta.env.VITE_API_URL`

### Database Issues

**Problem**: Connection timeout

```
MongooseServerSelectionError: connect ETIMEDOUT
```

**Solution**:

- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string is correct
- Check MongoDB Atlas cluster is running

---

## Part 12: Cost Estimation

### Free Tier (Development/Testing)

- MongoDB Atlas: **Free** (M0, 512MB)
- Render: **Free** (sleeps after 15min inactivity)
- Vercel: **Free** (100GB bandwidth/month)
- **Total: $0/month**

### Recommended Production Setup

- MongoDB Atlas: **$9/month** (M10 Shared, 2GB RAM)
- Render: **$7/month** (Starter, always on)
- Vercel: **Free** (sufficient for most cases)
- **Total: $16/month**

### Enterprise Setup

- MongoDB Atlas: **$57/month** (M30, 8GB RAM)
- Render: **$85/month** (Pro, 2 CPU, 4GB RAM)
- Vercel: **$20/month** (Pro, more bandwidth)
- **Total: $162/month**

---

## Part 13: Rollback Strategy

### Quick Rollback

**Render**:

1. Go to service → Deploys
2. Find previous successful deploy
3. Click "Rollback to this version"

**Vercel**:

1. Go to project → Deployments
2. Find previous deployment
3. Click "⋯" → "Promote to Production"

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push -f origin main
```

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Project Repository](https://github.com/your-username/Laboratory-Management-App)

---

## Quick Reference

### Backend URL

```
https://laboratory-management-api.onrender.com/api
```

### Frontend URL

```
https://laboratory-management-app.vercel.app
```

### Health Check

```bash
curl https://laboratory-management-api.onrender.com/api/health
```

### View Logs

- Backend: Render Dashboard → Logs
- Frontend: Vercel Dashboard → Function Logs
- Database: MongoDB Atlas → Monitoring

### Emergency Contacts

- Platform Status: https://status.render.com
- Vercel Status: https://vercel-status.com
- MongoDB Status: https://status.mongodb.com
