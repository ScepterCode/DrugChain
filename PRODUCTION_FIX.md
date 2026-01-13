# Production Deployment Fix

Your applications are deployed but can't communicate. Here's how to fix it:

## Current Setup
- **Frontend**: https://drug-chain.vercel.app (Vercel)
- **Backend**: https://drugchain-backend.onrender.com/api/v1 (Render)
- **Database**: Supabase (working)

## Issues to Fix

### 1. Frontend Environment Variables (Vercel)

Your frontend needs to know where the backend is. In Vercel dashboard:

1. Go to your project: https://vercel.com/dashboard
2. Select your `drug-chain` project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://drugchain-backend.onrender.com/api/v1
   ```
5. **Redeploy** your frontend (go to Deployments tab and click "Redeploy")

### 2. Backend CORS Configuration (Render)

Your backend needs to allow requests from your Vercel domain. In Render dashboard:

1. Go to your service: https://dashboard.render.com
2. Select your `drugchain-backend` service
3. Go to **Environment** tab
4. Add/Update this environment variable:
   ```
   Name: CORS_ORIGINS
   Value: https://drug-chain.vercel.app,http://localhost:3000,http://localhost:3001
   ```
5. Your service will **automatically redeploy**

## Quick Test Commands

After making the changes, test these URLs:

### Test Backend Health
```bash
curl https://drugchain-backend.onrender.com/health
```
Should return: `{"status":"healthy","service":"drugchain-api"}`

### Test Backend API Docs
Visit: https://drugchain-backend.onrender.com/api/docs

### Test Frontend
Visit: https://drug-chain.vercel.app
- Open browser dev tools (F12)
- Go to Network tab
- Try to register/login
- Check if requests go to `drugchain-backend.onrender.com`

## Common Issues & Solutions

### Issue 1: 404 Not Found
**Problem**: Frontend calling wrong URL (missing `/api/v1`)
**Solution**: Ensure `VITE_API_URL` includes `/api/v1` at the end

### Issue 2: CORS Error
**Problem**: Backend not allowing frontend domain
**Solution**: Add your exact Vercel URL to `CORS_ORIGINS`

### Issue 3: Environment Variables Not Working
**Problem**: Changes not taking effect
**Solution**: 
- **Vercel**: Redeploy after adding env vars
- **Render**: Service auto-redeploys, wait 2-3 minutes

### Issue 4: Mixed Content (HTTP/HTTPS)
**Problem**: Frontend (HTTPS) calling HTTP backend
**Solution**: Ensure backend URL uses `https://`

## Verification Steps

1. ✅ **Backend Health**: `curl https://drugchain-backend.onrender.com/health`
2. ✅ **Backend API**: Visit `https://drugchain-backend.onrender.com/api/docs`
3. ✅ **Frontend Loads**: Visit `https://drug-chain.vercel.app`
4. ✅ **API Calls Work**: Test registration/login in browser
5. ✅ **No CORS Errors**: Check browser console (F12)

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://drugchain-backend.onrender.com/api/v1
```

### Render (Backend)
```
CORS_ORIGINS=https://drug-chain.vercel.app,http://localhost:3000
DATABASE_URL=your-supabase-connection-string
SECRET_KEY=your-production-secret-key
ENVIRONMENT=production
```

## If Still Not Working

1. **Check Render Logs**:
   - Go to Render dashboard → Your service → Logs
   - Look for CORS or 404 errors

2. **Check Vercel Function Logs**:
   - Go to Vercel dashboard → Your project → Functions tab
   - Check for any errors

3. **Browser Dev Tools**:
   - Open F12 → Network tab
   - Try to make a request
   - Check the actual URL being called
   - Look for CORS errors in Console tab

4. **Test Backend Directly**:
   ```bash
   curl -X POST https://drugchain-backend.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User","role":"consumer"}'
   ```

The main issue is likely that your frontend and backend don't know about each other's production URLs!