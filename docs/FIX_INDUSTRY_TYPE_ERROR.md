# Fix: Missing industry_type Column Error

## Problem
Your Render deployment is failing with:
```
column "industry_type" of relation "products" does not exist
```

This happens because the Product model expects columns that don't exist in your Supabase database.

## Root Cause
The Alembic migrations that add these columns have never been run on your production database. The migrations exist in your code but haven't been applied to Supabase.

## Solution Options

### Option 1: Run SQL Script Directly in Supabase (FASTEST - 2 minutes)

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Migration Script**
   - Open the file `add_industry_columns.sql` in this repository
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Success**
   - You should see messages like "Added industry_type column"
   - The final SELECT query will show all the new columns

4. **Redeploy on Render**
   - Go to your Render dashboard
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - Wait 3-5 minutes for deployment

### Option 2: Update Render to Run Migrations Automatically (RECOMMENDED FOR FUTURE)

I've already updated your `backend/render.yaml` file to run migrations automatically:

```yaml
startCommand: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**To apply this change:**

1. **Commit and push the changes:**
   ```bash
   git add backend/render.yaml add_industry_columns.sql
   git commit -m "Add automatic database migrations on deployment"
   git push origin master
   ```

2. **First, run the SQL script manually** (Option 1 above)
   - This is needed because Alembic migrations might have conflicts

3. **Then Render will auto-deploy**
   - Future deployments will automatically run migrations
   - No manual SQL scripts needed going forward

## What Columns Are Being Added

The script adds these columns to the `products` table:

| Column Name | Type | Default | Purpose |
|------------|------|---------|---------|
| `industry_type` | VARCHAR(50) | 'Healthcare' | Industry category (Healthcare, Technology, Fashion, etc.) |
| `industry_data` | JSONB | {} | Industry-specific attributes as JSON |
| `regulatory_registration` | VARCHAR(100) | NULL | Generic regulatory registration number |
| `category_id` | UUID | NULL | Link to product categories |
| `brand_name` | VARCHAR(200) | NULL | Product brand |
| `model_number` | VARCHAR(100) | NULL | Product model number |
| `warranty_period_months` | INTEGER | NULL | Warranty duration |
| `country_of_origin` | VARCHAR(100) | NULL | Manufacturing country |
| `risk_level` | VARCHAR(20) | 'medium' | Risk classification |
| `verification_complexity` | VARCHAR(20) | 'standard' | Verification level |

## Expected Results

After running the migration:

✅ **GET /api/v1/products** - Will work (currently returns 405)
✅ **POST /api/v1/products** - Will work
✅ **GET /api/v1/analytics/...** - Will work (currently returns 500)
✅ **GET /api/v1/batches** - Will work (currently returns 500)

## Verification Steps

After deployment, test these endpoints:

```powershell
# Test products endpoint
Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/products" -Method GET

# Test analytics endpoint
Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/analytics/verification-stats" -Method GET

# Test batches endpoint
Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/batches" -Method GET
```

All should return data (or empty arrays) instead of errors.

## Why This Happened

1. Your code has Alembic migrations that add these columns
2. The migrations were never run on your Supabase database
3. Render was starting the app without running migrations first
4. The app code expects columns that don't exist → 500 errors

## Next Steps

1. ✅ Run `add_industry_columns.sql` in Supabase (2 minutes)
2. ✅ Commit and push the `render.yaml` change
3. ✅ Wait for Render to redeploy (3-5 minutes)
4. ✅ Test the endpoints
5. 🎉 All errors should be fixed!

## Need Help?

If you see any errors when running the SQL script, share the error message and I'll help debug it.
