# DrugChain API Specification

## 1. Overview

**Base URL**: `https://api.drugchain.ng/api/v1`
**Authentication**: JWT Bearer Token (except public endpoints)
**API Version**: 1.0
**Content-Type**: `application/json`
**Rate Limiting**: 
- Authenticated: 1000 req/hour
- Anonymous verification: 100 req/hour per IP
- SMS: 10 req/hour per phone

---

## 2. Authentication

### 2.1 Register User
`POST /auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone_number": "+2348012345678",
  "role": "MANUFACTURER",
  "organization_name": "Pfizer Nigeria Ltd",
  "organization_type": "MANUFACTURER",
  "registration_number": "RC123456"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "MANUFACTURER"
  }
}
```

### 2.2 Login
`POST /auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "dGhpc...",
    "expires_in": 3600,
    "user": {
      "user_id": "550e8400...",
      "email": "user@example.com",
      "role": "MANUFACTURER"
    }
  }
}
```

---

## 3. Product & ID Management

### 3.1 Create Product
`POST /products`
**Auth**: Required (MANUFACTURER)

**Request**:
```json
{
  "product_code": "AMOX500",
  "product_name": "Amoxicillin 500mg",
  "dosage": "500mg",
  "form": "Capsule",
  "active_ingredients": ["Amoxicillin"],
  "therapeutic_category": "Antibiotic"
}
```

### 3.2 Generate Batch
`POST /ids/batch`
**Auth**: Required (MANUFACTURER)

**Request**:
```json
{
  "product_id": "770e8400...",
  "production_date": "2026-01-03",
  "expiry_date": "2028-01-03",
  "batch_size": 10000,
  "number_of_cartons": 100,
  "packs_per_carton": 100
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "batch_id": "PFZ-AMOX500-20260103-00001",
    "total_packs": 10000,
    "download_urls": {
      "qr_codes_zip": "https://storage.../qr-codes.zip",
      "labels_pdf": "https://storage.../labels.pdf"
    }
  }
}
```

---

## 4. Verification

### 4.1 Verify Product
`POST /verify`
**Auth**: None required

**Request**:
```json
{
  "pack_id": "AX7K9M2P5N8Q3R1T",
  "verification_method": "QR_SCAN",
  "location": {
    "city": "Lagos",
    "state": "Lagos"
  }
}
```

**Response - GENUINE** (200):
```json
{
  "success": true,
  "verification_result": "GENUINE",
  "message": "✓ Genuine product",
  "data": {
    "product_name": "Amoxicillin 500mg",
    "manufacturer": "Pfizer Nigeria",
    "expiry_date": "2028-01-03",
    "status": "USED"
  }
}
```

**Response - COUNTERFEIT** (200):
```json
{
  "success": true,
  "verification_result": "COUNTERFEIT",
  "message": "✗ WARNING: Potential counterfeit",
  "data": {
    "pack_id": "AX7K9M2P5N8Q3R1T",
    "status": "USED",
    "first_verified_at": "2026-01-03T10:00:00Z",
    "instructions": "Report to NAFDAC"
  }
}
```

### 4.2 SMS Verification
`POST /verify/sms`

**Request**:
```json
{
  "phone_number": "+2348012345678",
  "pack_id": "AX7K9M2P5N8Q3R1T"
}
```

---

## 5. Supply Chain

### 5.1 Log Transfer
`POST /supply-chain/transfer`
**Auth**: Required

**Request**:
```json
{
  "pack_ids": ["AX7K9M2P...", "BX8L0N3Q..."],
  "from_entity_id": "660e8400...",
  "to_entity_id": "770e8400...",
  "transfer_type": "MANUFACTURER_TO_DISTRIBUTOR"
}
```

### 5.2 Get Supply Chain History
`GET /supply-chain/pack/{pack_id}/history`

**Response**:
```json
{
  "success": true,
  "data": {
    "supply_chain_events": [
      {
        "event_type": "PRODUCTION",
        "entity": "Pfizer Nigeria",
        "timestamp": "2026-01-03T08:00:00Z"
      },
      {
        "event_type": "TRANSFER",
        "from_entity": "Pfizer",
        "to_entity": "Distributor",
        "timestamp": "2026-01-03T10:00:00Z"
      }
    ]
  }
}
```

---

## 6. Analytics

### 6.1 Manufacturer Dashboard
`GET /analytics/manufacturer/dashboard`
**Auth**: Required (MANUFACTURER)

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_batches": 42,
      "total_verifications": 156234,
      "verification_rate": 37.2,
      "counterfeit_detections": 87
    },
    "verification_trends": {
      "daily_verifications": [
        {"date": "2026-01-01", "count": 523}
      ]
    },
    "geographic_distribution": [
      {"state": "Lagos", "count": 45234}
    ]
  }
}
```

### 6.2 Regulator Dashboard
`GET /analytics/regulator/dashboard`
**Auth**: Required (REGULATOR)

---

## 7. Error Responses

Standard format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

**Common Error Codes**:
- 400: `BAD_REQUEST`
- 401: `UNAUTHORIZED`
- 403: `FORBIDDEN`
- 404: `NOT_FOUND`
- 429: `RATE_LIMIT_EXCEEDED`
- 500: `INTERNAL_SERVER_ERROR`

---

## 8. Code Examples

### JavaScript
```javascript
const API_URL = 'https://api.drugchain.ng/api/v1';

// Verify product
const verify = async (packId) => {
  const res = await fetch(`${API_URL}/verify`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({pack_id: packId})
  });
  return res.json();
};
```

### Python
```python
import requests

API_URL = "https://api.drugchain.ng/api/v1"

def verify(pack_id):
    response = requests.post(f"{API_URL}/verify", 
        json={"pack_id": pack_id})
    return response.json()
```
