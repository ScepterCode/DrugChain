# DrugChain Deployment Checklist

## Pre-Deployment Setup

### ✅ Repository Preparation
- [ ] Code is committed and pushed to GitHub
- [ ] All sensitive data removed from code
- [ ] Environment variables properly configured
- [ ] Dependencies updated in requirements.txt and package.json

### ✅ Supabase Database
- [ ] Database is already hosted and accessible
- [ ] Connection string is available
- [ ] Database tables are created and migrated
- [ ] Row Level Security (RLS) policies are configured

## Backend Deployment (Render)

### ✅ Render Account Setup
- [ ] Render account created
- [ ] GitHub repository connected

### ✅ Service Configuration
- [ ] Web service created with correct settings:
  - Name: `drugchain-backend`
  - Environment: `Python 3`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Root Directory: `backend`

### ✅ Environment Variables Set
- [ ] `DATABASE_URL` - Your Supabase connection string
- [ ] `SECRET_KEY` - Strong production secret key
- [ ] `ENVIRONMENT=production`
- [ ] `CORS_ORIGINS` - Will be updated after frontend deployment
- [ ] Optional: `BLOCKCHAIN_ENABLED=false` (if not using blockchain)
- [ ] Optional: SMS gateway credentials if using SMS features

### ✅ Deployment Verification
- [ ] Service builds successfully
- [ ] Health check endpoint works: `/health`
- [ ] API documentation accessible: `/api/docs`
- [ ] Database connection successful

## Frontend Deployment (Vercel)

### ✅ Vercel Account Setup
- [ ] Vercel account created
- [ ] GitHub repository connected (or Vercel CLI installed)

### ✅ Project Configuration
- [ ] Framework preset: `Vite`
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### ✅ Environment Variables Set
- [ ] `VITE_API_URL` - Your Render backend URL + `/api/v1`

### ✅ Deployment Verification
- [ ] Frontend builds successfully
- [ ] Application loads in browser
- [ ] API calls work correctly
- [ ] All pages and features functional

## Post-Deployment Configuration

### ✅ CORS Update
- [ ] Backend CORS_ORIGINS updated with Vercel domain
- [ ] Render service redeployed with new CORS settings

### ✅ Full Application Testing
- [ ] User registration/login works
- [ ] QR code generation works
- [ ] Verification process works
- [ ] Dashboard displays data correctly
- [ ] All API endpoints respond correctly

### ✅ Performance & Security
- [ ] HTTPS enabled on both platforms (automatic)
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error handling works in production

## Optional Enhancements

### ✅ Custom Domains
- [ ] Custom domain configured for frontend (Vercel)
- [ ] Custom domain configured for backend (Render)
- [ ] DNS records properly configured
- [ ] SSL certificates active

### ✅ Monitoring & Analytics
- [ ] Error tracking set up
- [ ] Performance monitoring enabled
- [ ] Database usage monitoring
- [ ] Log aggregation configured

### ✅ Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Code repository backed up
- [ ] Environment variables documented securely

## Troubleshooting Checklist

### ✅ Common Issues Resolved
- [ ] CORS errors fixed
- [ ] Environment variables properly set
- [ ] Build errors resolved
- [ ] Database connection issues fixed
- [ ] API endpoint accessibility confirmed

## Production URLs

After successful deployment, document your URLs:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/api/docs`
- **Database**: Supabase dashboard URL

## Maintenance

### ✅ Regular Tasks
- [ ] Monitor application performance
- [ ] Check error logs regularly
- [ ] Update dependencies periodically
- [ ] Rotate secrets/API keys as needed
- [ ] Monitor database usage and costs

---

**Note**: This checklist should be completed in order. Each section depends on the previous ones being successfully completed.