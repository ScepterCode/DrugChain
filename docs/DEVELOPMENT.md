# DrugChain Development - Quick Start Guide

## Week 1-2: Foundation & Authentication ✅

### What's Been Implemented

#### ✅ Database Models
- **User**: Email, password, role, 2FA support
- **Organization**: Companies (manufacturers, distributors, pharmacies, regulators)
- **Manufacturer**: Extended organization data with NAFDAC license
- **Product**: Product catalog with ingredients and categories
- **Batch/Carton/Pack**: Three-level ID system

#### ✅ Authentication System
- User registration with organization creation
- Login with JWT tokens
- Token refresh mechanism
- Role-based access control (RBAC)
- Protected endpoints with `@Depends(require_role([...]))`

#### ✅ API Endpoints Implemented
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/users/profile` - Get user profile
- `POST /api/v1/products` - Create product (manufacturers only)
- `GET /api/v1/products` - List products
- `GET /api/v1/products/{id}` - Get product details

---

## Getting Started

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env and update:
# - DATABASE_URL
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
```

### Step 3: Setup Database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL, MongoDB, and Redis
docker-compose up -d postgres mongodb redis
```

**Option B: Manual PostgreSQL Setup**
1. Install PostgreSQL 15+
2. Create user and database:
```sql
CREATE USER drugchain_user WITH PASSWORD 'drugchain_password';
CREATE DATABASE drugchain_db OWNER drugchain_user;
```

### Step 4: Run Migrations

```bash
# Windows
scripts\init_db.bat

# Linux/Mac
chmod +x scripts/init_db.sh
./scripts/init_db.sh

# Or manually
cd backend
alembic upgrade head
```

### Step 5: Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

**API will be available at:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

---

## Testing the API

### 1. Register a Manufacturer

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manufacturer@example.com",
    "password": "SecurePass123!",
    "full_name": "John Manufacturer",
    "phone_number": "+2348012345678",
    "role": "MANUFACTURER",
    "organization_name": "Pfizer Nigeria Ltd",
    "organization_type": "MANUFACTURER",
    "registration_number": "RC123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": "...",
      "email": "manufacturer@example.com",
      "role": "MANUFACTURER"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manufacturer@example.com&password=SecurePass123!"
```

### 3. Create a Product (Authenticated)

```bash
curl -X POST "http://localhost:8000/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_code": "AMOX500",
    "product_name": "Amoxicillin 500mg Capsules",
    "dosage": "500mg",
    "form": "Capsule",
    "active_ingredients": ["Amoxicillin Trihydrate"],
    "therapeutic_category": "Antibiotic",
    "nafdac_registration_number": "NAFDAC-2023-001"
  }'
```

### 4. Get Current User Info

```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Interactive API Testing

**Use Swagger UI** (Recommended for testing):
1. Open http://localhost:8000/api/docs
2. Click "Authorize" button
3. Register a user via `/auth/register`
4. Copy the `access_token` from response
5. Paste token in Authorization dialog
6. Test protected endpoints

---

## Database Schema

View tables in PostgreSQL:
```sql
\c drugchain_db
\dt

-- View data
SELECT * FROM organizations;
SELECT * FROM users;
SELECT * FROM manufacturers;
SELECT * FROM products;
```

---

## What's Next (Week 3-4)

### ID Generation System
- [ ] Implement batch creation API
- [ ] Generate cryptographic pack IDs
- [ ] QR code generation
- [ ] Bulk ID generation with Celery
- [ ] Blockchain integration (Hyperledger Fabric)

### Coming Features
- Batch/Carton/Pack creation
- QR code download
- Basic analytics dashboard
- Blockchain anchoring

---

## Troubleshooting

### Migration Errors
```bash
# Reset database
cd backend
alembic downgrade base
alembic upgrade head
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Token Expired
- Access tokens expire in 60 minutes
- Use `/auth/refresh-token` to get new token

---

## Project Status

**✅ Week 1-2: COMPLETE**
- Database models and migrations
- Authentication system
- User registration and login
- Product management APIs
- Role-based access control

**⏭️ Week 3-4: IN PROGRESS**
- ID generation system
- Blockchain integration

---

## Resources

- **API Documentation**: http://localhost:8000/api/docs
- **Technical Docs**: See `docs/` folder
- **Database Schema**: `docs/03-database-schema.md`
- **Security Design**: `docs/04-security-design.md`
