# DrugChain Hosting Guide

This guide covers deploying the DrugChain application with:
- **Frontend**: Vercel (React/Vite app)
- **Backend**: Render (FastAPI Python app)
- **Database**: Supabase (already hosted)

## Prerequisites

- GitHub repository with your code
- Vercel account
- Render account
- Supabase database already set up

## Backend Deployment on Render

### 1. Prepare Backend for Production

First, ensure your backend configuration is production-ready:

#### Update `backend/app/core/config.py`
Make sure environment variables are properly configured for production:

```python
# In your config.py, ensure these are read from environment variables
DATABASE_URL: str = os.getenv("DATABASE_URL", "your-supabase-url")
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "https://your-frontend-domain.vercel.app")
```

#### Verify `backend/render.yaml`
Your render.yaml is already configured correctly:

```yaml
services:
  - type: web
    name: drugchain-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
```

### 2. Deploy to Render

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your DrugChain code

2. **Configure Service**:
   - **Name**: `drugchain-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

3. **Set Environment Variables**:
   Add these environment variables in Render dashboard:

   ```
   ENVIRONMENT=production
   DATABASE_URL=your-supabase-database-url
   SECRET_KEY=your-super-secret-production-key
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   
   # Optional: If using blockchain features
   BLOCKCHAIN_ENABLED=false
   
   # Optional: If using SMS features
   AFRICASTALKING_USERNAME=your-username
   AFRICASTALKING_API_KEY=your-api-key
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Your backend will be available at: `https://drugchain-backend.onrender.com`

### 3. Verify Backend Deployment

Once deployed, test these endpoints:
- Health check: `https://your-backend-url.onrender.com/health`
- API docs: `https://your-backend-url.onrender.com/api/docs`
- Root: `https://your-backend-url.onrender.com/`

## Frontend Deployment on Vercel

### 1. Prepare Frontend for Production

#### Update Environment Variables
Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api/v1
```

#### Verify `frontend/vercel.json`
Your vercel.json is already configured correctly:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from Frontend Directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? `N`
   - Project name: `drugchain-frontend`
   - Directory: `./` (current directory)
   - Override settings? `N`

#### Option B: Vercel Dashboard

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables**:
   Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com/api/v1
   ```

4. **Deploy**:
   - Click "Deploy"
   - Your frontend will be available at: `https://your-project-name.vercel.app`

### 3. Update Backend CORS

After frontend deployment, update your backend's CORS settings:

In Render dashboard, update the `CORS_ORIGINS` environment variable:
```
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000,http://localhost:5173
```

## Post-Deployment Configuration

### 1. Update Frontend API URL

If you used a different backend URL, update your frontend environment:

In Vercel dashboard → Project → Settings → Environment Variables:
```
VITE_API_URL=https://your-actual-backend-url.onrender.com/api/v1
```

### 2. Test the Full Application

1. **Frontend**: Visit your Vercel URL
2. **Backend API**: Test API endpoints
3. **Database**: Verify Supabase connection
4. **Authentication**: Test login/signup flows
5. **QR Code Generation**: Test verification features

### 3. Set Up Custom Domains (Optional)

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### For Render (Backend):
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Environment Variables Summary

### Backend (Render)
```
ENVIRONMENT=production
DATABASE_URL=your-supabase-url
SECRET_KEY=your-production-secret
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
BLOCKCHAIN_ENABLED=false
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-name.onrender.com/api/v1
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend CORS_ORIGINS includes your Vercel domain
   - Check that frontend is making requests to correct backend URL

2. **Build Failures**:
   - **Backend**: Check requirements.txt and Python version
   - **Frontend**: Ensure all dependencies are in package.json

3. **Environment Variables**:
   - Verify all required env vars are set in both platforms
   - Check for typos in variable names

4. **Database Connection**:
   - Verify Supabase URL and credentials
   - Check database connection from Render logs

### Monitoring and Logs

- **Render**: View logs in service dashboard
- **Vercel**: View function logs and build logs in dashboard
- **Supabase**: Monitor database usage and logs

## Automatic Deployments

Both platforms support automatic deployments:

- **Render**: Automatically deploys on git push to main branch
- **Vercel**: Automatically deploys on git push, with preview deployments for PRs

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **CORS**: Only allow necessary origins
3. **HTTPS**: Both platforms provide HTTPS by default
4. **Database**: Use Supabase RLS (Row Level Security) policies
5. **API Keys**: Rotate keys regularly

Your DrugChain application should now be fully deployed and accessible via the web!