# 🔍 Issue Flow Diagram

## Current Request Flow (With Errors)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│  User visits: https://pack-guard.vercel.app/register            │
│  Fills form with Organization Type: RETAILER                     │
│  Clicks "Register"                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                             │
│  ❌ ISSUE #1: Missing Environment Variable                      │
│                                                                  │
│  Code reads: import.meta.env.VITE_API_URL                       │
│  Expected: https://drugchain-backend.onrender.com/api/v1        │
│  Actual: undefined (falls back to localhost)                    │
│                                                                  │
│  Result: Calls wrong URL                                         │
│  ❌ POST https://drugchain-backend.onrender.com/auth/register   │
│     (missing /api/v1/ prefix)                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                              │
│  ✅ Backend is working correctly                                │
│                                                                  │
│  Receives: POST /auth/register                                   │
│  Checks routes: No route matches /auth/register                  │
│  (Only has /api/v1/auth/register)                                │
│                                                                  │
│  Returns: 405 Method Not Allowed                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES ERROR                               │
│  ❌ Registration failed                                          │
│  ❌ 405 Method Not Allowed                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alternative Flow (If URL Was Correct)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│  User visits: https://pack-guard.vercel.app/register            │
│  Fills form with Organization Type: RETAILER                     │
│  Clicks "Register"                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                             │
│  ✅ (Assuming env var is set)                                   │
│                                                                  │
│  Code reads: import.meta.env.VITE_API_URL                       │
│  Value: https://drugchain-backend.onrender.com/api/v1           │
│                                                                  │
│  Calls correct URL:                                              │
│  ✅ POST https://drugchain-backend.onrender.com/api/v1/auth/... │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                              │
│  ✅ Receives: POST /api/v1/auth/register                        │
│  ✅ Route matches                                                │
│  ✅ Validates data                                               │
│  ✅ Attempts to insert into database                             │
│                                                                  │
│  Sends to database:                                              │
│  INSERT INTO organizations (organization_type, ...)              │
│  VALUES ('RETAILER', ...)                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                DATABASE (Supabase PostgreSQL)                    │
│  ❌ ISSUE #2: Enum Value Missing                                │
│                                                                  │
│  Checks: Is 'RETAILER' valid for organizationtype enum?         │
│  Current enum values: MANUFACTURER, DISTRIBUTOR, REGULATOR       │
│  'RETAILER' not found!                                           │
│                                                                  │
│  Returns: psycopg2.errors.InvalidTextRepresentation             │
│  Error: invalid input value for enum organizationtype:          │
│         "RETAILER"                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                              │
│  Receives database error                                         │
│  Returns: 500 Internal Server Error                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES ERROR                               │
│  ❌ Registration failed                                          │
│  ❌ 500 Internal Server Error                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Correct Flow (After Both Fixes)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│  User visits: https://pack-guard.vercel.app/register            │
│  Fills form with Organization Type: RETAILER                     │
│  Clicks "Register"                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                             │
│  ✅ FIX #1 APPLIED: Environment variable set                    │
│                                                                  │
│  Code reads: import.meta.env.VITE_API_URL                       │
│  Value: https://drugchain-backend.onrender.com/api/v1           │
│                                                                  │
│  Calls correct URL:                                              │
│  ✅ POST https://drugchain-backend.onrender.com/api/v1/auth/... │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                              │
│  ✅ Receives: POST /api/v1/auth/register                        │
│  ✅ Route matches                                                │
│  ✅ Validates data                                               │
│  ✅ Attempts to insert into database                             │
│                                                                  │
│  Sends to database:                                              │
│  INSERT INTO organizations (organization_type, ...)              │
│  VALUES ('RETAILER', ...)                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                DATABASE (Supabase PostgreSQL)                    │
│  ✅ FIX #2 APPLIED: RETAILER added to enum                      │
│                                                                  │
│  Checks: Is 'RETAILER' valid for organizationtype enum?         │
│  Current enum values: MANUFACTURER, DISTRIBUTOR, REGULATOR,      │
│                       RETAILER ✅                                │
│  'RETAILER' found!                                               │
│                                                                  │
│  Executes: INSERT successful                                     │
│  Returns: New organization and user records                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                              │
│  ✅ Database insert successful                                   │
│  ✅ Generates JWT tokens                                         │
│  ✅ Returns: 201 Created                                         │
│  Response: {                                                     │
│    "access_token": "eyJ...",                                     │
│    "refresh_token": "eyJ...",                                    │
│    "user": { ... }                                               │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                             │
│  ✅ Receives successful response                                 │
│  ✅ Stores tokens in localStorage                                │
│  ✅ Redirects to dashboard                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES SUCCESS                             │
│  ✅ Registration successful!                                     │
│  ✅ Redirected to retailer dashboard                             │
│  ✅ Can access all features                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Status Matrix

```
┌──────────────────┬──────────┬─────────────────────────────────┐
│ Component        │ Status   │ Details                         │
├──────────────────┼──────────┼─────────────────────────────────┤
│ Frontend Code    │ ✅ Good  │ Correctly reads env var         │
│ Frontend .env    │ ✅ Good  │ Has correct API URL             │
│ Vercel Env Var   │ ❌ Bad   │ Not set in dashboard            │
│ Backend Code     │ ✅ Good  │ All routes correct              │
│ Backend CORS     │ ✅ Good  │ Allows pack-guard domain        │
│ Backend Deploy   │ ✅ Good  │ Running on Render               │
│ Database Schema  │ ✅ Good  │ Tables and columns correct      │
│ Database Enums   │ ❌ Bad   │ Missing RETAILER value          │
│ Migration Files  │ ✅ Good  │ Migration exists in code        │
│ Migration Run    │ ❌ Bad   │ Not executed on production      │
└──────────────────┴──────────┴─────────────────────────────────┘
```

---

## Fix Impact Analysis

### Fix #1: Set Vercel Environment Variable

**Before:**
```
Frontend → /auth/register → Backend → 405 Error
```

**After:**
```
Frontend → /api/v1/auth/register → Backend → Processes Request
```

**Impact:** Fixes 405 Method Not Allowed errors

---

### Fix #2: Add RETAILER to Database Enum

**Before:**
```
Backend → INSERT 'RETAILER' → Database → 500 Error
```

**After:**
```
Backend → INSERT 'RETAILER' → Database → Success
```

**Impact:** Fixes 500 Internal Server Error for RETAILER registrations

---

## Both Fixes Combined

```
User Registration Flow:
┌─────────────┐
│   User      │
│  Registers  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ✅ Fix #1: Correct URL
│  Frontend   │────────────────────────────┐
│   (Vercel)  │                            │
└──────┬──────┘                            │
       │                                   │
       │ POST /api/v1/auth/register        │
       ▼                                   │
┌─────────────┐                            │
│   Backend   │◄───────────────────────────┘
│   (Render)  │
└──────┬──────┘
       │
       │ INSERT organization_type='RETAILER'
       ▼
┌─────────────┐     ✅ Fix #2: RETAILER in enum
│  Database   │────────────────────────────┐
│  (Supabase) │                            │
└──────┬──────┘                            │
       │                                   │
       │ Success                           │
       ▼                                   │
┌─────────────┐                            │
│   Backend   │◄───────────────────────────┘
│   Returns   │
│   201 OK    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    User     │
│  Logged In  │
└─────────────┘
```

---

## Summary

**Two independent issues:**

1. **Frontend → Backend**: Wrong URL (missing `/api/v1/`)
   - **Fix**: Set Vercel environment variable

2. **Backend → Database**: Invalid enum value (RETAILER)
   - **Fix**: Run SQL to add RETAILER to enum

**Both must be fixed for registration to work!**

---

**Time to fix both: 7 minutes** ⏱️
