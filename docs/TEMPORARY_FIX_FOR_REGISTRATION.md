# Temporary Fix: Make Registration Work Without New Columns

If you're having trouble adding the database columns due to timeouts, here's a temporary workaround to get registration working immediately.

## Option 1: Disable Auth Security Features Temporarily

Edit `backend/app/services/auth_service.py` and comment out the lines that use the new columns:

### Changes to Make:

1. **In the `register_user` method**, comment out these lines:

```python
# BEFORE (around line 80-85):
# Generate email verification token
verification_token = EmailService.generate_token()

# Create user
new_user = User(
    email=user_data.email,
    password_hash=get_password_hash(user_data.password),
    full_name=user_data.full_name,
    phone_number=user_data.phone_number,
    role=user_role,
    organization_id=organization.organization_id if organization else None,
    is_verified=False,
    email_verification_token=verification_token,  # COMMENT THIS
    email_verification_token_expires=EmailService.generate_token_expiry(hours=24)  # COMMENT THIS
)
```

```python
# AFTER:
# Generate email verification token
# verification_token = EmailService.generate_token()  # COMMENTED OUT

# Create user
new_user = User(
    email=user_data.email,
    password_hash=get_password_hash(user_data.password),
    full_name=user_data.full_name,
    phone_number=user_data.phone_number,
    role=user_role,
    organization_id=organization.organization_id if organization else None,
    is_verified=True,  # CHANGED TO TRUE
    # email_verification_token=verification_token,  # COMMENTED OUT
    # email_verification_token_expires=EmailService.generate_token_expiry(hours=24)  # COMMENTED OUT
)
```

2. **In the `authenticate_user` method**, comment out lockout logic:

```python
# BEFORE (around line 120-140):
# Check if account is locked
if user.account_locked_until and user.account_locked_until > datetime.utcnow():
    # ... lockout logic
    
# Increment failed attempts
user.failed_login_attempts += 1

# Lock account after 5 failed attempts
if user.failed_login_attempts >= 5:
    # ... lockout logic
```

```python
# AFTER:
# Check if account is locked
# if user.account_locked_until and user.account_locked_until > datetime.utcnow():
#     # ... lockout logic (COMMENT OUT ENTIRE BLOCK)
    
# Increment failed attempts
# user.failed_login_attempts += 1  # COMMENTED OUT

# Lock account after 5 failed attempts
# if user.failed_login_attempts >= 5:
#     # ... lockout logic (COMMENT OUT ENTIRE BLOCK)
```

## Option 2: Better Approach - Use Deferred Column Loading

This is cleaner and doesn't require commenting out code.

### Edit `backend/app/models/user.py`:

Add `deferred` to the new columns so they're only loaded when explicitly accessed:

```python
from sqlalchemy.orm import deferred

class User(Base):
    __tablename__ = "users"
    
    # ... existing columns ...
    
    # Email verification (deferred loading)
    email_verification_token = deferred(Column(String(255)))
    email_verification_token_expires = deferred(Column(DateTime))
    
    # Password reset (deferred loading)
    password_reset_token = deferred(Column(String(255)))
    password_reset_token_expires = deferred(Column(DateTime))
    password_changed_at = deferred(Column(DateTime))
    
    # Account security (deferred loading)
    failed_login_attempts = deferred(Column(Integer, default=0))
    account_locked_until = deferred(Column(DateTime))
```

This tells SQLAlchemy not to load these columns unless explicitly requested, which will prevent the error.

## Option 3: Quickest Fix - Use Raw SQL for Registration

Create a new endpoint that uses raw SQL instead of SQLAlchemy ORM:

```python
# In backend/app/api/v1/endpoints/auth.py

@router.post("/register-temp", response_model=dict)
async def register_temp(user_data: UserCreate, db: Session = Depends(get_db)):
    """Temporary registration endpoint that doesn't use new columns"""
    
    # Check if user exists
    existing = db.execute(
        "SELECT email FROM users WHERE email = :email",
        {"email": user_data.email}
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Create organization if needed
    org_id = None
    if user_data.organization_name:
        org_result = db.execute(
            """
            INSERT INTO organizations (organization_name, organization_type, contact_email)
            VALUES (:name, :type, :email)
            RETURNING organization_id
            """,
            {
                "name": user_data.organization_name,
                "type": user_data.organization_type,
                "email": user_data.email
            }
        )
        org_id = org_result.first()[0]
    
    # Create user
    password_hash = get_password_hash(user_data.password)
    user_result = db.execute(
        """
        INSERT INTO users (email, password_hash, full_name, phone_number, role, organization_id, is_verified)
        VALUES (:email, :password_hash, :full_name, :phone, :role, :org_id, true)
        RETURNING user_id, email, full_name, role
        """,
        {
            "email": user_data.email,
            "password_hash": password_hash,
            "full_name": user_data.full_name,
            "phone": user_data.phone_number,
            "role": user_data.role,
            "org_id": org_id
        }
    )
    
    user = user_result.first()
    db.commit()
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user[0]), "role": user[3]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": str(user[0]),
            "email": user[1],
            "full_name": user[2],
            "role": user[3]
        }
    }
```

Then use `/api/v1/auth/register-temp` instead of `/api/v1/auth/register` until columns are added.

## Recommendation

**Use Option 2 (Deferred Loading)** - it's the cleanest and requires minimal changes. Just add `deferred()` around the new columns in the User model.

After you successfully add the database columns, you can remove the `deferred()` wrappers.

## After Applying Temporary Fix

1. Commit and push changes
2. Render will auto-deploy
3. Registration will work immediately
4. Add database columns when you can (run statements one by one)
5. Remove temporary fix
6. Redeploy

This gets you unblocked while you work on the database migration.
