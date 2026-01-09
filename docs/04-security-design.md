# DrugChain Security Architecture

## 1. Security Overview

DrugChain implements **defense-in-depth** security with multiple layers:
- Network security (WAF, DDoS protection)
- Application security (authentication, RBAC, input validation)
- Data security (encryption at rest and in transit)
- Blockchain security (cryptographic validation, MSP)
- Operational security (logging, monitoring, incident response)

---

## 2. Authentication Mechanisms

### 2.1 JWT Authentication

**Token Structure**:
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2026"
  },
  "payload": {
    "sub": "user_id_12345",
    "email": "user@example.com",
    "role": "MANUFACTURER",
    "org_id": "org_123",
    "permissions": ["create:batch", "view:analytics"],
    "iat": 1704297384,
    "exp": 1704383784
  }
}
```

**Token Lifecycle**:
- Access token: 1 hour expiry
- Refresh token: 7 days expiry
- Tokens stored in httpOnly cookies for web apps
- Secure storage in device keychain for mobile apps

**Implementation** (FastAPI):
```python
from datetime import datetime, timedelta
import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "RS256"

def create_access_token(user_id: str, role: str, org_id: str):
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {
        "sub": user_id,
        "role": role,
        "org_id": org_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, PRIVATE_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 2.2 Two-Factor Authentication (2FA)

**TOTP (Time-based One-Time Password)**:
```python
import pyotp

def enable_2fa(user_id: str):
    secret = pyotp.random_base32()
    # Store secret in database encrypted
    save_2fa_secret(user_id, encrypt(secret))
    
    # Generate QR code for authenticator app
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_id,
        issuer_name="DrugChain"
    )
    return totp_uri

def verify_2fa_code(user_id: str, code: str):
    secret = decrypt(get_2fa_secret(user_id))
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)
```

### 2.3 OAuth 2.0 (Third-party Integrations)

Support for OAuth 2.0 authorization code flow for ERP integrations.

---

## 3. Authorization (RBAC)

### 3.1 Role Definitions

| Role | Permissions | Access Level |
|------|------------|--------------|
| **SYSTEM_ADMIN** | Full system access, user management | Global |
| **REGULATOR** | View all data, create reports, manage alerts | Nationwide |
| **MANUFACTURER** | Create products/batches, view own analytics | Organization |
| **DISTRIBUTOR** | Log transfers, view assigned stock | Organization |
| **PHARMACY** | Verify products, log sales | Organization |
| **CONSUMER** | Anonymous verification only | Public |

### 3.2 Permission-based Access Control

**Permission Format**: `action:resource`

```python
PERMISSIONS = {
    "SYSTEM_ADMIN": ["*:*"],  # All permissions
    "REGULATOR": [
        "view:all_products",
        "view:all_verifications",
        "create:inspection_report",
        "manage:alerts",
        "view:analytics"
    ],
    "MANUFACTURER": [
        "create:product",
        "create:batch",
        "generate:ids",
        "view:own_analytics",
        "manage:own_inventory"
    ],
    "DISTRIBUTOR": [
        "log:transfer",
        "view:assigned_stock",
        "verify:product"
    ],
    "PHARMACY": [
        "verify:product",
        "log:sale",
        "view:assigned_stock"
    ]
}

# Decorator for endpoint protection
def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            token = get_token_from_request()
            user = verify_token(token)
            
            if not has_permission(user['role'], permission):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@app.post("/ids/batch")
@require_permission("create:batch")
async def create_batch(batch_data: BatchCreate):
    # Handler implementation
    pass
```

---

## 4. Encryption Standards

### 4.1 Data at Rest

**Database Encryption**:
- PostgreSQL: AES-256 encryption (Transparent Data Encryption)
- MongoDB: Encrypted storage engine
- Redis: Protected by OS-level encryption

**Configuration** (PostgreSQL):
```sql
-- Enable encryption at rest
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

**Sensitive Field Encryption**:
```python
from cryptography.fernet import Fernet

class FieldEncryption:
    def __init__(self):
        self.key = os.getenv("FIELD_ENCRYPTION_KEY")
        self.cipher = Fernet(self.key)
    
    def encrypt(self, plaintext: str) -> str:
        return self.cipher.encrypt(plaintext.encode()).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        return self.cipher.decrypt(ciphertext.encode()).decode()

# Encrypt PII before storing
encrypted_phone = field_encryption.encrypt(user.phone_number)
```

### 4.2 Data in Transit

**TLS 1.3 Configuration** (NGINX):
```nginx
server {
    listen 443 ssl http2;
    server_name api.drugchain.ng;
    
    ssl_protocols TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384';
    ssl_prefer_server_ciphers on;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # HSTS header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://api-backend;
    }
}
```

---

## 5. API Security

### 5.1 Rate Limiting

**Implementation** (Redis-based):
```python
from fastapi import Request, HTTPException
import redis

redis_client = redis.Redis()

async def rate_limit_middleware(request: Request):
    # Get identifier (user ID or IP)
    identifier = get_user_id(request) or request.client.host
    endpoint = request.url.path
    
    key = f"ratelimit:{identifier}:{endpoint}"
    
    # Sliding window rate limit
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, 3600)  # 1 hour window
    
    limit = get_rate_limit_for_endpoint(endpoint)
    
    if current > limit:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": "3600"}
        )
```

**Rate Limits**:
- Authenticated users: 1000 requests/hour
- Anonymous verification: 100 requests/hour per IP
- SMS verification: 10 requests/hour per phone
- Batch generation: 10 requests/day per manufacturer

### 5.2 Input Validation

**Pydantic Models** (FastAPI):
```python
from pydantic import BaseModel, validator, EmailStr

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain uppercase letter')
        return v
    
    @validator('phone_number')
    def phone_format(cls, v):
        import re
        if not re.match(r'^\+234\d{10}$', v):
            raise ValueError('Invalid Nigerian phone number')
        return v
```

### 5.3 SQL Injection Prevention

**Parameterized Queries** (SQLAlchemy ORM):
```python
# Safe - using ORM
user = db.query(User).filter(User.email == email).first()

# Safe - parameterized query
query = text("SELECT * FROM users WHERE email = :email")
result = db.execute(query, {"email": email})

# UNSAFE - string concatenation (NEVER DO THIS)
# query = f"SELECT * FROM users WHERE email = '{email}'"
```

### 5.4 XSS Prevention

**Content Security Policy**:
```python
# FastAPI middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline';"
    )
    return response
```

---

## 6. Blockchain Security

### 6.1 Hyperledger Fabric MSP

**Membership Service Provider Configuration**:
```yaml
# crypto-config.yaml
OrdererOrgs:
  - Name: Orderer
    Domain: drugchain.ng
    
PeerOrgs:
  - Name: ManufacturerOrg
    Domain: manufacturer.drugchain.ng
    EnableNodeOUs: true
    Users:
      Count: 5
      
  - Name: RegulatorOrg
    Domain: regulator.drugchain.ng
    EnableNodeOUs: true
    Users:
      Count: 10
```

**Certificate Management**:
- X.509 certificates for all network participants
- Certificate expiry: 1 year (auto-renewal alerts)
- Certificate revocation list (CRL) maintained
- Private keys stored in HSM (Hardware Security Module) for production

### 6.2 Chaincode Access Control

```go
// Chaincode access control
func (c *DrugChainContract) RegisterPack(ctx contractapi.TransactionContextInterface, 
    packID string, batchID string, manufacturerID string) error {
    
    // Get caller's identity
    clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
    if err != nil {
        return fmt.Errorf("failed to get MSPID: %v", err)
    }
    
    // Only manufacturers can register packs
    if clientMSPID != "ManufacturerOrgMSP" {
        return fmt.Errorf("unauthorized: only manufacturers can register packs")
    }
    
    // Verify manufacturer owns the batch
    callerID, err := ctx.GetClientIdentity().GetID()
    if !strings.Contains(callerID, manufacturerID) {
        return fmt.Errorf("manufacturer can only register own packs")
    }
    
    // Register pack logic
    // ...
}
```

---

## 7. Data Privacy & Compliance

### 7.1 NDPR Compliance (Nigeria Data Protection Regulation)

**Personal Data Handling**:
- Explicit consent for data collection
- Right to access personal data
- Right to erasure ("right to be forgotten")
- Data portability
- Data breach notification within 72 hours

**Implementation**:
```python
# GDPR-style data export
async def export_user_data(user_id: str):
    user = await db.get_user(user_id)
    verifications = await db.get_user_verifications(user_id)
    
    return {
        "user_profile": user.dict(),
        "verifications": [v.dict() for v in verifications],
        "export_date": datetime.utcnow()
    }

# Right to erasure
async def delete_user_data(user_id: str):
    # Anonymize instead of delete (for audit trail)
    await db.anonymize_user(user_id)
    await db.delete_personal_data(user_id)
```

### 7.2 Anonymous Verification

**Consumer verifications are fully anonymous**:
- No PII collected
- IP addresses hashed
- Location data rounded to city level
- Device IDs hashed with salt

```python
import hashlib

def anonymize_verification(data: dict):
    return {
        "pack_id": data["pack_id"],
        "ip_hash": hashlib.sha256(data["ip_address"].encode()).hexdigest()[:16],
        "location": {
            "city": data["location"]["city"],  # City only
            "state": data["location"]["state"]
            # No latitude/longitude for consumers
        },
        "device_hash": hashlib.sha256(data["device_id"].encode()).hexdigest()[:16]
    }
```

---

## 8. Threat Modeling

### 8.1 Identified Threats

| Threat | Mitigation |
|--------|-----------|
| **Counterfeit ID Generation** | Cryptographically secure IDs, blockchain anchoring |
| **Pack ID Reuse (Repackaging)** | One-time verification lock, blockchain immutability |
| **Man-in-the-Middle Attacks** | TLS 1.3, certificate pinning in mobile apps |
| **Brute Force Attacks** | Rate limiting, account lockout, CAPTCHA |
| **DDoS Attacks** | WAF, CDN, rate limiting |
| **SQL Injection** | ORM, parameterized queries |
| **XSS Attacks** | CSP headers, input sanitization |
| **Insider Threats** | Audit logging, RBAC, separation of duties |
| **Blockchain 51% Attack** | Permissioned network, trusted orgs only |

### 8.2 Attack Scenarios

**Scenario 1: Fake QR Code Generator**
- **Attack**: Malicious actor creates fake QR codes
- **Detection**: QR codes verified against blockchain
- **Prevention**: Cryptographic checksums in pack IDs

**Scenario 2: SMS Spoofing**
- **Attack**: Fake SMS claiming product is genuine
- **Detection**: Official sender ID verification
- **Prevention**: User education, official app recommendations

---

## 9. Logging & Monitoring

### 9.1 Security Event Logging

**Events to Log**:
- Authentication attempts (success/failure)
- Authorization failures
- API access (with user context)
- Database queries (for audit)
- Blockchain transactions
- Rate limit violations
- Data exports

**Log Format** (JSON):
```json
{
  "timestamp": "2026-01-03T16:30:00Z",
  "event_type": "authentication_failure",
  "user_email": "user@example.com",
  "ip_address": "197.210.x.x",
  "user_agent": "Mozilla/5.0...",
  "reason": "invalid_password",
  "attempt_count": 3
}
```

### 9.2 Intrusion Detection

**Anomaly Detection Rules**:
```python
# Detect suspicious verification patterns
async def detect_anomalies():
    # Pattern 1: Same pack verified >3 times from different locations
    suspicious = await db.query("""
        SELECT pack_id, COUNT(DISTINCT location) as loc_count
        FROM verification_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY pack_id
        HAVING COUNT(DISTINCT location) > 3
    """)
    
    # Pattern 2: Bulk verification attempts from single IP
    bulk_attempts = await redis.keys("verify:count:*")
    for key in bulk_attempts:
        count = await redis.get(key)
        if int(count) > 50:  # Threshold
            await send_alert("bulk_verification_detected", key)
```

---

## 10. Incident Response

### 10.1 Security Incident Classification

| Severity | Response Time | Examples |
|----------|--------------|----------|
| **Critical** | < 15 minutes | Data breach, system compromise |
| **High** | < 1 hour | Counterfeit detection, DDoS attack |
| **Medium** | < 4 hours | Rate limit abuse, suspicious patterns |
| **Low** | < 24 hours | Failed login attempts, minor bugs |

### 10.2 Incident Response Plan

**Steps**:
1. **Detection**: Automated alerts + manual reports
2. **Containment**: Isolate affected systems
3. **Investigation**: Collect logs, analyze attack vector
4. **Eradication**: Remove malicious actors, patch vulnerabilities
5. **Recovery**: Restore services, verify integrity
6. **Post-Incident**: Document lessons learned, update procedures

---

## 11. NAFDAC Regulatory Alignment

### 11.1 Compliance Requirements

- **Audit Trail**: Immutable blockchain records
- **Data Retention**: 7 years for pharmaceutical records
- **Regulator Access**: Dedicated portal for NAFDAC officials
- **Incident Reporting**: Automated counterfeit alerts to NAFDAC
- **Evidence Preservation**: Secure storage of inspection reports and photos

### 11.2 Data Sovereignty

**Nigeria Data Residency**:
- All Nigerian citizen data stored in Nigeria (if required by regulation)
- Cloud provider: Azure Nigeria regions or AWS Africa (Cape Town) with data replication
- Cross-border data transfer: Only with explicit consent

---

## Summary

DrugChain security architecture provides:
- ✅ **Multi-layered defense** (network, app, data, blockchain)
- ✅ **Strong authentication** (JWT, 2FA, OAuth)
- ✅ **Fine-grained authorization** (RBAC, permissions)
- ✅ **End-to-end encryption** (TLS 1.3, AES-256)
- ✅ **Privacy by design** (anonymous verification, NDPR compliance)
- ✅ **Threat mitigation** (DDoS, injection, XSS protection)
- ✅ **Comprehensive logging** (audit trails, intrusion detection)
- ✅ **Regulatory compliance** (NAFDAC alignment, data sovereignty)
