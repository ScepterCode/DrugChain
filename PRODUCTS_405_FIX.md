# Fix: Products Endpoint 405 Error

## Current Status

✅ **Working:**
- Analytics endpoints (200 OK)
- Batches endpoints (200 OK)
- Notifications endpoints (200 OK)
- CORS configured correctly
- Database schema fixed

❌ **Not Working:**
- GET `/api/v1/products` returns 405 (Method Not Allowed)

## Root Cause

The 405 error means Render is still running **old code** that doesn't have the GET route for products. Your local code has the route, but Render hasn't deployed it yet.

## Why This Happens

1. **Render caching** - Sometimes Render caches old builds
2. **Deployment didn't trigger** - Auto-deploy might have failed
3. **Build succeeded but old code running** - Deployment completed but didn't restart properly

## Solution: Force Render to Deploy Latest Code

### Option 1: Manual Deploy with Cache Clear (RECOMMENDED)

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Find your "drugchain-backend" service

2. **Clear Cache and Deploy**
   - Click "Manual Deploy" button (top right)
   - Select "Clear build cache & deploy"
   - Wait 3-5 minutes

3. **Verify Deployment**
   - Watch the "Logs" tab
   - Look for these messages:
     ```
     ==> Build succeeded ✓
     ==> Deploying...
     INFO: Uvicorn running on http://0.0.0.0:10000
     ==> Your service is live 🎉
     ```

### Option 2: Trigger Deployment via Git Push

1. **Make a small change to force redeploy**
   ```powershell
   # Add a comment to trigger rebuild
   echo "# Force rebuild" >> backend/app/main.py
   git add backend/app/main.py
   git commit -m "Force Render redeploy"
   git push origin master
   ```

2. **Wait for auto-deploy** (3-5 minutes)

### Option 3: Check Environment Variables

Sometimes the issue is with environment variables:

1. **Go to Render Dashboard** → Your service → "Environment"
2. **Verify these are set:**
   - `DATABASE_URL` - Your Supabase connection string
   - `SECRET_KEY` - Your JWT secret
   - `ENVIRONMENT` - Should be "production"

3. **If any are missing, add them and save** (this triggers redeploy)

## Verify the Fix

After redeployment, run this test:

```powershell
# Test products endpoint
$response = Invoke-WebRequest -Uri "https://drugchain-1.onrender.com/api/v1/products" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
Write-Host "Status: $($response.StatusCode)"
```

Expected result: **200 OK** (not 405)

Or test without auth using the public endpoint:

```powershell
Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/products/public" -Method GET
```

## What the Code Should Have

Your `backend/app/api/v1/endpoints/products.py` should have these routes:

```python
# POST / - Create product
@router.post("/", response_model=ProductResponse)
async def create_product(...)

# GET / - List products (authenticated)
@router.get("/", response_model=List[ProductResponse])
async def list_products(...)

# GET /public - List products (public)
@router.get("/public", response_model=List[ProductResponse])
async def list_public_products(...)

# GET /{product_id} - Get single product
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(...)
```

## Check Render Logs

If the issue persists, check Render logs for errors:

1. Go to Render Dashboard → Your service → "Logs"
2. Look for:
   - **Build errors** - Python package issues
   - **Import errors** - Missing dependencies
   - **Database errors** - Connection issues
   - **Route registration errors** - FastAPI startup issues

Common error patterns:
```
ModuleNotFoundError: No module named 'app.api.dependencies'
ImportError: cannot import name 'require_role'
sqlalchemy.exc.ProgrammingError: column "industry_type" does not exist
```

## Timeline

| Step | Time | Action |
|------|------|--------|
| Clear cache & deploy | 3-5 min | Manual action in Render |
| Wait for build | 2-3 min | Automatic |
| Wait for deployment | 1-2 min | Automatic |
| Test endpoint | 30 sec | Run test script |
| **Total** | **7-10 min** | |

## Expected Results After Fix

```powershell
# Before fix
GET /api/v1/products → 405 Method Not Allowed

# After fix
GET /api/v1/products → 200 OK (returns products array)
GET /api/v1/products/public → 200 OK (returns public products)
POST /api/v1/products → 201 Created (creates product)
GET /api/v1/products/{id} → 200 OK (returns single product)
```

## Still Not Working?

If after clearing cache and redeploying you still get 405:

1. **Check the deployed code**
   - Go to Render Dashboard → Your service → "Shell"
   - Run: `cat app/api/v1/endpoints/products.py`
   - Verify the GET routes exist

2. **Check route registration**
   - Run: `cat app/api/v1/api.py`
   - Verify: `api_router.include_router(products.router, prefix="/products")`

3. **Check main.py**
   - Run: `cat app/main.py`
   - Verify: `app.include_router(api_router, prefix="/api/v1")`

4. **Share the logs**
   - Copy the full deployment logs
   - Look for any errors or warnings

## Quick Diagnostic

Run this to check what's deployed:

```powershell
# Check if docs endpoint shows products routes
Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/docs" -Method GET
```

If `/docs` shows the products routes, the code is deployed. If not, Render is running old code.

## Summary

The code is correct locally, but Render needs to deploy it. Clear the build cache and manually deploy to force Render to use the latest code. After deployment, the 405 error will become 200 OK.
