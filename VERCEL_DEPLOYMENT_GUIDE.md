# 🚀 Vercel Deployment Guide - HireGo AI

## ✅ Configuration Complete
- ✅ Render configuration removed
- ✅ Vercel configuration optimized
- ✅ Ready for deployment

---

## 📦 What You'll Deploy

### Frontend (Main App)
- **Framework**: React + Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Config File**: `vercel.json`

### Backend (API Server)
- **Framework**: Node.js + Express
- **Entry Point**: `server/index.js`
- **Config File**: `vercel-backend.json`
- **Note**: Will run as serverless functions

---

## 🎯 Deployment Steps

### **Step 1: Deploy Frontend**

#### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select: `udaynews021-max/Fnal-hiring-by-Google-`
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:
   
   ```
   VITE_API_URL = https://your-backend-url.vercel.app
   VITE_SUPABASE_URL = https://pgilluryfvpdnmaozflq.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - You'll get a URL like: `https://hirego-ai.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Make sure you're in the project directory
cd "c:\Users\RaAz\Desktop\hirego 2.0\Fnal-hiring-by-Google-"

# Login to Vercel (opens browser)
npx vercel login

# Deploy to production
npx vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (if exists)
# - What's your project's name? hirego-ai
# - In which directory is your code located? ./
# - Want to override settings? No

# Wait for deployment to complete
```

---

### **Step 2: Deploy Backend**

#### Option A: Separate Vercel Project (Recommended)

1. **Create New Project**
   - Go to Vercel Dashboard
   - Click **"Add New..."** → **"Project"**
   - Import the same repository again
   - Name it: `hirego-backend`

2. **Configure Backend**
   - **Framework Preset**: Other
   - **Root Directory**: `./server`
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   ```
   PORT = 3000
   SUPABASE_URL = https://pgilluryfvpdnmaozflq.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ENCRYPTION_KEY = your_encryption_key_here
   NODE_ENV = production
   ```

4. **Deploy**
   - Click **"Deploy"**
   - You'll get a backend URL like: `https://hirego-backend.vercel.app`

5. **Update Frontend Environment**
   - Go back to frontend project settings
   - Update `VITE_API_URL` to your backend URL
   - Redeploy frontend

#### Option B: Via CLI

```bash
# Navigate to server directory
cd server

# Deploy backend
npx vercel --prod

# Follow prompts and set environment variables
```

---

## 🔄 Auto-Deploy Setup

### Enable Automatic Deployments

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → Settings

2. **Git Integration**
   - Go to **"Git"** tab
   - Ensure **"Production Branch"** is set to `main`
   - Enable **"Auto-deploy"**

3. **Now Every Git Push = Auto Deploy!**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   # Vercel automatically deploys! 🎉
   ```

---

## 🌐 Your Live URLs

After deployment, you'll have:

### Frontend
```
https://hirego-ai.vercel.app
or
https://your-custom-domain.com
```

### Backend
```
https://hirego-backend.vercel.app/api
```

### Admin Panel
```
https://hirego-ai.vercel.app/admin/dashboard
```

### Upskill Portal
```
https://hirego-ai.vercel.app/upskill
```

---

## 📝 Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://hirego-backend.vercel.app
VITE_SUPABASE_URL=https://pgilluryfvpdnmaozflq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (Vercel Dashboard)
```env
PORT=3000
SUPABASE_URL=https://pgilluryfvpdnmaozflq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
ENCRYPTION_KEY=your_encryption_key
NODE_ENV=production
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS in Backend
Make sure your backend allows requests from your frontend domain:

```javascript
// server/index.js
app.use(cors({
  origin: [
    'http://localhost:5179',
    'https://hirego-ai.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

### 2. Test API Connection
Visit: `https://hirego-backend.vercel.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T...",
  "services": {
    "database": "configured",
    "encryption": "configured"
  }
}
```

### 3. Test Admin Panel
1. Go to: `https://hirego-ai.vercel.app/admin/dashboard`
2. Test API configuration
3. Test Upskill courses page

---

## 🚀 Quick Deploy Commands

### Deploy Frontend
```bash
npx vercel --prod
```

### Deploy Backend
```bash
cd server
npx vercel --prod
```

### Deploy Both (from root)
```bash
# Frontend
npx vercel --prod

# Backend
cd server && npx vercel --prod && cd ..
```

---

## 🔄 Update Deployment

### When You Make Changes:

1. **Commit and Push**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Vercel Auto-Deploys** (if enabled)
   - Check dashboard for deployment status
   - Wait 2-3 minutes
   - Changes are live!

3. **Or Manual Redeploy**
   - Go to Vercel Dashboard
   - Click **"Redeploy"**

---

## 🐛 Troubleshooting

### Build Failed
**Check:**
- Build logs in Vercel dashboard
- Make sure `npm run build` works locally
- Verify all dependencies in package.json

### API Not Working
**Check:**
- Environment variables are set correctly
- Backend is deployed and running
- CORS is configured properly
- `VITE_API_URL` points to correct backend

### Changes Not Showing
**Solution:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Check deployment status in dashboard
4. Verify correct URL

---

## 📊 Deployment Checklist

### Frontend
- [ ] Project imported to Vercel
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] Custom domain added (optional)
- [ ] Auto-deploy enabled

### Backend
- [ ] Separate project created
- [ ] Server directory configured
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] Health endpoint working
- [ ] CORS configured

### Integration
- [ ] Frontend VITE_API_URL updated
- [ ] API calls working
- [ ] Admin panel accessible
- [ ] Upskill features working
- [ ] Database connected

---

## 🎯 Next Steps

1. **Deploy Frontend First**
   - Use Vercel Dashboard or CLI
   - Set environment variables
   - Get your frontend URL

2. **Deploy Backend**
   - Create separate project
   - Set environment variables
   - Get your backend URL

3. **Connect Them**
   - Update frontend `VITE_API_URL`
   - Redeploy frontend
   - Test everything

4. **Enable Auto-Deploy**
   - Every push = automatic deployment
   - No manual steps needed!

---

## 🌟 Benefits of Vercel

✅ **Fast Deployments** - 2-3 minutes  
✅ **Auto-Deploy** - Push to deploy  
✅ **Global CDN** - Fast worldwide  
✅ **Free HTTPS** - Automatic SSL  
✅ **Preview Deployments** - Test before production  
✅ **Analytics** - Built-in monitoring  
✅ **Custom Domains** - Easy setup  

---

## 📞 Need Help?

**Vercel Documentation**: https://vercel.com/docs  
**Support**: https://vercel.com/support  

---

**Ready to deploy? Start with Step 1! 🚀**

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Ready for Deployment  
**Platform**: Vercel Only (Render Removed)
