# DrugChain Database Schema Documentation

## 1. Database Architecture Overview

DrugChain uses a **polyglot persistence** approach:
- **PostgreSQL**: Structured data (users, products, IDs)
- **MongoDB**: Semi-structured logs and analytics
- **Redis**: Caching and session management
- **Hyperledger Fabric**: Immutable blockchain ledger

---

## 2. PostgreSQL Schema

### 2.1 Users & Organizations

```sql
-- Organizations table
CREATE TABLE organizations (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL 
        CHECK (organization_type IN ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR')),
    registration_number VARCHAR(100) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    license_status VARCHAR(50) DEFAULT 'PENDING' 
        CHECK (license_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED')),
    verified_by_regulator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL 
        CHECK (role IN ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR', 'SYSTEM_ADMIN')),
    organization_id UUID REFERENCES organizations(organization_id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Manufacturers (extended organization data)
CREATE TABLE manufacturers (
    manufacturer_id UUID PRIMARY KEY REFERENCES organizations(organization_id) ON DELETE CASCADE,
    manufacturer_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'PFZ', 'GSK'
    nafdac_license_number VARCHAR(100),
    production_capacity INTEGER,
  specialization TEXT[], -- Array of product categories
    gmp_certified BOOLEAN DEFAULT FALSE, -- Good Manufacturing Practice
    gmp_certificate_expiry DATE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_country ON organizations(country);
CREATE INDEX idx_manufacturers_code ON manufacturers(manufacturer_code);
```

### 2.2 Products & Batches

```sql
-- Products catalog
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID REFERENCES manufacturers(manufacturer_id) NOT NULL,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    form VARCHAR(50), -- 'Tablet', 'Syrup', 'Injection', etc.
    active_ingredients TEXT[],
    therapeutic_category VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT TRUE,
    description TEXT,
    nafdac_registration_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Batches
CREATE TABLE batches (
    batch_id VARCHAR(50) PRIMARY KEY, -- Format: PFZ-AMOX500-20260103-00001
    product_id UUID REFERENCES products(product_id) NOT NULL,
    manufacturer_id UUID REFERENCES manufacturers(manufacturer_id) NOT NULL,
    production_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    batch_size INTEGER NOT NULL,
    number_of_cartons INTEGER,
    total_packs INTEGER,
    quality_certificate_url TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'RECALLED', 'EXPIRED')),
    created_by UUID REFERENCES users(user_id),
    blockchain_tx_id VARCHAR(255), -- Hyperledger transaction ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cartons
CREATE TABLE cartons (
    carton_id VARCHAR(50) PRIMARY KEY, -- Format: BATCH_ID-C-0042
    batch_id VARCHAR(50) REFERENCES batches(batch_id) NOT NULL,
    carton_number INTEGER NOT NULL,
    packs_per_carton INTEGER NOT NULL,
    current_location VARCHAR(255),
    current_holder_id UUID REFERENCES organizations(organization_id),
    blockchain_tx_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(batch_id, carton_number)
);

-- Packs (primary verification unit)
CREATE TABLE packs (
    pack_id VARCHAR(16) PRIMARY KEY, -- Format: AX7K9M2P5N8Q3R1T
    batch_id VARCHAR(50) REFERENCES batches(batch_id) NOT NULL,
    carton_id VARCHAR(50) REFERENCES cartons(carton_id),
    qr_code_url TEXT,
    barcode VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'USED', 'RECALLED', 'EXPIRED')),
    blockchain_tx_id VARCHAR(255),
    verification_count INTEGER DEFAULT 0,
    first_verified_at TIMESTAMP,
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_category ON products(therapeutic_category);
CREATE INDEX idx_batches_manufacturer ON batches(manufacturer_id);
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_cartons_batch ON cartons(batch_id);
CREATE INDEX idx_cartons_holder ON cartons(current_holder_id);
CREATE INDEX idx_packs_batch ON packs(batch_id);
CREATE INDEX idx_packs_carton ON packs(carton_id);
CREATE INDEX idx_packs_status ON packs(status);
```

### 2.3 Supply Chain Tracking

```sql
-- Supply chain transfers
CREATE TABLE transfers (
    transfer_id VARCHAR(50) PRIMARY KEY,
    from_entity_id UUID REFERENCES organizations(organization_id) NOT NULL,
    to_entity_id UUID REFERENCES organizations(organization_id) NOT NULL,
    transfer_type VARCHAR(50) NOT NULL,
    transfer_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'REJECTED')),
    transport_vehicle VARCHAR(50),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    notes TEXT,
    blockchain_tx_id VARCHAR(255),
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Transfer items (many-to-many)
CREATE TABLE transfer_items (
    transfer_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id VARCHAR(50) REFERENCES transfers(transfer_id) ON DELETE CASCADE,
    pack_id VARCHAR(16) REFERENCES packs(pack_id),
    carton_id VARCHAR(50) REFERENCES cartons(carton_id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfers_from ON transfers(from_entity_id);
CREATE INDEX idx_transfers_to ON transfers(to_entity_id);
CREATE INDEX idx_transfers_date ON transfers(transfer_date);
CREATE INDEX idx_transfer_items_transfer ON transfer_items(transfer_id);
```

### 2.4 Alerts & Reports

```sql
-- Counterfeit alerts
CREATE TABLE alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL 
        CHECK (alert_type IN ('COUNTERFEIT_DETECTED', 'MULTIPLE_VERIFICATIONS', 
                              'EXPIRED_PRODUCT', 'RECALL_ISSUED')),
    pack_id VARCHAR(16) REFERENCES packs(pack_id),
    batch_id VARCHAR(50) REFERENCES batches(batch_id),
    severity VARCHAR(20) DEFAULT 'MEDIUM' 
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN' 
        CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    assigned_to UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- User reports (from consumers)
CREATE TABLE counterfeit_reports (
    report_id VARCHAR(50) PRIMARY KEY,
    pack_id VARCHAR(16),
    reporter_phone VARCHAR(20),
    reporter_email VARCHAR(255),
    location TEXT,
    description TEXT,
    photo_urls TEXT[],
    status VARCHAR(50) DEFAULT 'SUBMITTED' 
        CHECK (status IN ('SUBMITTED', 'UNDER_INVESTIGATION', 'VERIFIED_COUNTERFEIT', 
                          'FALSE_ALARM', 'RESOLVED')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_reports_status ON counterfeit_reports(status);
```

---

## 3. MongoDB Schema

### 3.1 Verification Logs

```javascript
// Collection: verification_logs
{
  _id: ObjectId,
  pack_id: String,
  batch_id: String,
  product_id: String,
  verification_result: String, // "GENUINE", "COUNTERFEIT", "INVALID", "EXPIRED"
  verification_method: String, // "QR_SCAN", "SMS", "MANUAL_ENTRY", "REGULATOR_DEVICE"
  verifier_type: String,       // "CONSUMER", "PHARMACY", "REGULATOR"
  verifier_id: String,         // User ID (null for anonymous)
  
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    state: String,
    country: String
  },
  
  device_info: {
    platform: String,          // "iOS", "Android", "Web", "SMS"
    app_version: String,
    device_id: String,
    ip_address: String
  },
  
  product_info: {              // Denormalized for quick access
    product_name: String,
    manufacturer_name: String,
    manufacturer_code: String,
    expiry_date: Date
  },
  
  previous_status: String,     // Status before verification
  new_status: String,          // Status after verification
  
  suspicious: Boolean,         // Flagged by anomaly detection
  alert_triggered: Boolean,
  alert_id: String,
  
  blockchain_tx_id: String,
  timestamp: Date,
  created_at: Date
}

// Indexes for efficient queries
db.verification_logs.createIndex({ pack_id: 1 });
db.verification_logs.createIndex({ batch_id: 1 });
db.verification_logs.createIndex({ timestamp: -1 });
db.verification_logs.createIndex({ verification_result: 1 });
db.verification_logs.createIndex({ "location.state": 1 });
db.verification_logs.createIndex({ "location.city": 1 });
db.verification_logs.createIndex({ suspicious: 1 });
db.verification_logs.createIndex({ verifier_type: 1 });

// Compound index for analytics
db.verification_logs.createIndex({ 
  batch_id: 1, 
  timestamp: -1 
});
```

### 3.2 Supply Chain Events

```javascript
// Collection: supply_chain_events
{
  _id: ObjectId,
  event_id: String,
  event_type: String, // "PRODUCTION", "TRANSFER", "VERIFICATION", "RECALL"
  pack_id: String,
  batch_id: String,
  carton_id: String,
  
  from_entity: {
    entity_id: String,
    entity_name: String,
    entity_type: String
  },
  
  to_entity: {
    entity_id: String,
    entity_name: String,
    entity_type: String
  },
  
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  },
  
  metadata: Object,      // Flexible field for event-specific data
  blockchain_tx_id: String,
  timestamp: Date,
  created_at: Date
}

// Indexes
db.supply_chain_events.createIndex({ pack_id: 1 });
db.supply_chain_events.createIndex({ batch_id: 1 });
db.supply_chain_events.createIndex({ event_type: 1 });
db.supply_chain_events.createIndex({ timestamp: -1 });
db.supply_chain_events.createIndex({ "location.coordinates": "2dsphere" }); // Geospatial
```

### 3.3 Analytics Aggregations

```javascript
// Collection: daily_analytics
{
  _id: ObjectId,
  date: Date,                  // Aggregation date
  manufacturer_id: String,
  
  stats: {
    total_verifications: Number,
    genuine_count: Number,
    counterfeit_count: Number,
    invalid_count: Number,
    unique_packs_verified: Number
  },
  
  geographic_breakdown: [
    {
      state: String,
      city: String,
      verification_count: Number
    }
  ],
  
  product_breakdown: [
    {
      product_id: String,
      product_name: String,
      verification_count: Number
    }
  ],
  
  created_at: Date
}

// Indexes
db.daily_analytics.createIndex({ date: -1 });
db.daily_analytics.createIndex({ manufacturer_id: 1, date: -1 });
```

---

## 4. Redis Caching Strategy

### 4.1 Cache Keys Structure

```
# Verification cache (1 hour TTL)
verify:{pack_id} → JSON {result, product_info, timestamp}

# Verification attempt counter (24 hour TTL)
verify:count:{pack_id} → Integer

# User session cache
session:{user_id} → JSON {user_data, permissions}

# Rate limiting
ratelimit:ip:{ip_address}:{endpoint} → Integer
ratelimit:phone:{phone_number}:sms → Integer

# Batch generation status
batch:status:{batch_id} → JSON {status, progress, download_urls}

# Analytics cache (cache for 30 minutes)
analytics:manufacturer:{manufacturer_id}:dashboard → JSON
analytics:regulator:nationwide → JSON
```

### 4.2 Cache Implementation

```python
# Redis cache layer
import redis
import json
from datetime import timedelta

class CacheService:
    def __init__(self):
        self.redis = redis.Redis(host='redis', port=6379, decode_responses=True)
    
    # Verification caching
    def cache_verification(self, pack_id: str, result: dict, ttl: int = 3600):
        key = f"verify:{pack_id}"
        self.redis.setex(key, ttl, json.dumps(result))
    
    def get_cached_verification(self, pack_id: str):
        key = f"verify:{pack_id}"
        cached = self.redis.get(key)
        return json.loads(cached) if cached else None
    
    # Rate limiting
    def check_rate_limit(self, key: str, limit: int, window: int = 3600):
        current = self.redis.get(key)
        if current and int(current) >= limit:
            return False  # Rate limit exceeded
        
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window)
        pipe.execute()
        return True
    
    # Session management
    def set_session(self, user_id: str, session_data: dict, ttl: int = 86400):
        key = f"session:{user_id}"
        self.redis.setex(key, ttl, json.dumps(session_data))
```

---

## 5. Data Relationships

```mermaid
erDiagram
    organizations ||--o{ users : has
    organizations ||--o{ manufacturers : extends
    manufacturers ||--o{ products : creates
    products ||--o{ batches : produces
    batches ||--o{ cartons : contains
    cartons ||--o{ packs : contains
    batches ||--o{ packs : contains
    
    organizations ||--o{ transfers : sends
    organizations ||--o{ transfers : receives
    transfers ||--o{ transfer_items : includes
    transfer_items }o--|| packs : tracks
    
    packs ||--o{ alerts : triggers
    batches ||--o{ alerts : triggers
    users ||--o{ alerts : assigned_to
```

---

## 6. Database Performance Optimization

### 6.1 Partitioning Strategy

```sql
-- Partition verification_logs by date (if using PostgreSQL for logs)
CREATE TABLE verification_logs (
    log_id UUID PRIMARY KEY,
    pack_id VARCHAR(16),
    timestamp TIMESTAMP NOT NULL,
    -- other fields
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE verification_logs_2026_01 
    PARTITION OF verification_logs 
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 6.2 Read Replicas

PostgreSQL read replicas for analytics queries to avoid impacting transactional workload.

### 6.3 Connection Pooling

```python
# Database connection pool (SQLAlchemy)
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "postgresql://user:password@host:5432/drugchain",
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True  # Verify connections before use
)
```

---

## Summary

This database design provides:
- ✅ **Structured data** in PostgreSQL for users, products, IDs
- ✅ **Flexible logging** in MongoDB for verification events
- ✅ **High-performance caching** with Redis
- ✅ **Blockchain integration** for immutability
- ✅ **Optimized indexes** for fast queries
- ✅ **Scalable partitioning** for time-series data
- ✅ **Geospatial queries** for location-based analytics
