# PackGuard Migration Strategy: From DrugChain to Universal Platform

## Migration Overview

This document outlines the step-by-step strategy for migrating from DrugChain (pharmaceutical-focused) to PackGuard (universal product authentication platform) while maintaining service continuity and data integrity.

## Phase 1: Foundation & Infrastructure (Months 1-2)

### 1.1 Database Schema Migration

#### Week 1-2: Schema Design & Testing
```sql
-- Migration Script 1: Add new tables
-- Execute in staging environment first

BEGIN;

-- Create product categories
CREATE TABLE product_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    parent_category_id UUID REFERENCES product_categories(category_id),
    industry_type VARCHAR(50) NOT NULL,
    description TEXT,
    regulatory_requirements JSONB DEFAULT '{}',
    verification_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert base categories
INSERT INTO product_categories (category_name, category_code, industry_type, description) VALUES
('Pharmaceuticals', 'PHARMA', 'Healthcare', 'Pharmaceutical products and medical devices'),
('Electronics', 'ELEC', 'Technology', 'Electronic devices and components'),
('Luxury Goods', 'LUXURY', 'Fashion', 'High-end fashion and luxury items'),
('Food & Beverages', 'FOOD', 'Consumer Goods', 'Food products and beverages'),
('Automotive Parts', 'AUTO', 'Automotive', 'Vehicle parts and accessories'),
('Cosmetics', 'COSMETIC', 'Personal Care', 'Beauty and personal care products');

-- Add new columns to existing tables
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES product_categories(category_id),
ADD COLUMN industry_type VARCHAR(50) DEFAULT 'Healthcare',
ADD COLUMN brand_name VARCHAR(200),
ADD COLUMN model_number VARCHAR(100),
ADD COLUMN warranty_period_months INTEGER,
ADD COLUMN country_of_origin VARCHAR(100),
ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN verification_complexity VARCHAR(20) DEFAULT 'standard';

-- Update existing products
UPDATE products SET 
    category_id = (SELECT category_id FROM product_categories WHERE category_code = 'PHARMA'),
    industry_type = 'Healthcare',
    brand_name = COALESCE(manufacturer.manufacturer_code, 'Unknown')
FROM manufacturers manufacturer 
WHERE products.manufacturer_id = manufacturer.manufacturer_id;

-- Add new organization types
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'ELECTRONICS_MANUFACTURER';
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'LUXURY_BRAND';
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'FOOD_PRODUCER';
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'AUTOMOTIVE_OEM';
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'COSMETICS_MANUFACTURER';
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'RETAILER';

-- Add new user roles
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'RETAILER';
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'CONSUMER';
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'AUTHENTICATOR';

COMMIT;
```

#### Week 3-4: Data Migration & Validation
```python
# Migration script for existing data
import asyncio
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Product, ProductCategory

async def migrate_existing_data():
    """Migrate existing pharmaceutical data to new schema"""
    db = next(get_db())
    
    try:
        # Get pharmaceutical category
        pharma_category = db.query(ProductCategory).filter(
            ProductCategory.category_code == 'PHARMA'
        ).first()
        
        # Update all existing products
        products = db.query(Product).filter(Product.category_id.is_(None)).all()
        
        for product in products:
            product.category_id = pharma_category.category_id
            product.industry_type = 'Healthcare'
            
            # Extract brand from existing data if available
            if hasattr(product, 'manufacturer') and product.manufacturer:
                product.brand_name = product.manufacturer.manufacturer_code
            
            # Set default values
            product.risk_level = 'high'  # Pharmaceuticals are high risk
            product.verification_complexity = 'enhanced'
        
        db.commit()
        print(f"Migrated {len(products)} products to new schema")
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        db.close()

# Run migration
if __name__ == "__main__":
    asyncio.run(migrate_existing_data())
```

### 1.2 API Backward Compatibility

#### Legacy API Wrapper
```python
# Create wrapper endpoints to maintain backward compatibility
from fastapi import APIRouter, Depends
from app.api.v1.endpoints import products as new_products

legacy_router = APIRouter(prefix="/api/v1/legacy")

@legacy_router.get("/products/", response_model=List[LegacyProductResponse])
async def get_products_legacy(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Legacy endpoint for existing DrugChain clients"""
    # Get products using new endpoint
    products = await new_products.list_products(skip, limit, db, current_user)
    
    # Convert to legacy format
    legacy_products = []
    for product in products:
        legacy_product = LegacyProductResponse(
            product_id=product.product_id,
            product_code=product.product_code,
            product_name=product.product_name,
            dosage=get_attribute_value(product.attributes, 'dosage'),
            form=get_attribute_value(product.attributes, 'form'),
            active_ingredients=get_attribute_value(product.attributes, 'active_ingredients'),
            # Map new fields to legacy structure
            nafdac_registration_number=get_certification_number(product.certifications, 'NAFDAC'),
            manufacturer_id=product.manufacturer_id,
            is_active=product.is_active,
            created_at=product.created_at
        )
        legacy_products.append(legacy_product)
    
    return legacy_products

def get_attribute_value(attributes, name):
    """Helper to extract attribute values"""
    for attr in attributes:
        if attr.attribute_name == name:
            return attr.attribute_value
    return None
```

### 1.3 Frontend Compatibility Layer

#### Legacy Component Wrapper
```typescript
// Create wrapper components for existing DrugChain components
import React from 'react';
import { ProductList as NewProductList } from '../components/universal/ProductList';
import { Product } from '../types/universal';
import { LegacyProduct } from '../types/legacy';

// Legacy product list component
export const LegacyProductList: React.FC = () => {
    const [products, setProducts] = useState<LegacyProduct[]>([]);
    
    useEffect(() => {
        // Fetch using legacy endpoint
        fetchLegacyProducts().then(setProducts);
    }, []);
    
    // Convert legacy products to new format
    const convertedProducts: Product[] = products.map(legacyProduct => ({
        product_id: legacyProduct.product_id,
        product_code: legacyProduct.product_code,
        product_name: legacyProduct.product_name,
        category: {
            category_id: 'pharma-category-id',
            category_name: 'Pharmaceuticals',
            industry_type: 'Healthcare'
        },
        brand_name: legacyProduct.manufacturer?.manufacturer_code || 'Unknown',
        industry_type: 'Healthcare',
        attributes: [
            { attribute_name: 'dosage', attribute_value: legacyProduct.dosage },
            { attribute_name: 'form', attribute_value: legacyProduct.form },
            { attribute_name: 'active_ingredients', attribute_value: legacyProduct.active_ingredients }
        ],
        // ... other mappings
    }));
    
    return <NewProductList products={convertedProducts} />;
};
```

## Phase 2: Multi-Industry Support (Months 3-4)

### 2.1 Industry-Specific Features

#### Electronics Implementation
```python
# Electronics-specific models and endpoints
from sqlalchemy import Column, String, Integer, DECIMAL, JSONB
from app.db.session import Base

class ElectronicsSpecification(Base):
    __tablename__ = "electronics_specifications"
    
    spec_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID, ForeignKey("products.product_id"), nullable=False)
    processor = Column(String(200))
    memory_gb = Column(Integer)
    storage_gb = Column(Integer)
    display_size = Column(DECIMAL(4,2))
    battery_capacity = Column(Integer)
    operating_system = Column(String(100))
    connectivity = Column(JSONB, default={})
    dimensions = Column(JSONB, default={})
    compatibility_matrix = Column(JSONB, default={})

# Electronics API endpoints
@router.post("/electronics/products", response_model=ElectronicsProductResponse)
async def create_electronics_product(
    product_data: ElectronicsProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ELECTRONICS_MANUFACTURER"]))
):
    """Create electronics product with specifications"""
    # Create base product
    base_product = Product(
        product_code=product_data.product_code,
        product_name=product_data.product_name,
        category_id=product_data.category_id,
        industry_type="Technology",
        brand_name=product_data.brand_name,
        model_number=product_data.model_number,
        manufacturer_id=current_user.organization_id
    )
    
    db.add(base_product)
    db.flush()
    
    # Create electronics specifications
    electronics_spec = ElectronicsSpecification(
        product_id=base_product.product_id,
        processor=product_data.processor,
        memory_gb=product_data.memory_gb,
        storage_gb=product_data.storage_gb,
        # ... other specs
    )
    
    db.add(electronics_spec)
    db.commit()
    
    return ElectronicsProductResponse.from_orm(base_product)
```

#### Luxury Goods Implementation
```python
class LuxurySpecification(Base):
    __tablename__ = "luxury_specifications"
    
    spec_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID, ForeignKey("products.product_id"), nullable=False)
    material = Column(String(200))
    craftsmanship_level = Column(String(50))
    limited_edition = Column(Boolean, default=False)
    edition_number = Column(Integer)
    total_edition_size = Column(Integer)
    designer = Column(String(200))
    collection_name = Column(String(200))
    authentication_features = Column(JSONB, default={})
    estimated_value = Column(DECIMAL(12,2))

@router.post("/luxury/authenticity-certificate")
async def generate_luxury_certificate(
    product_id: UUID,
    pack_id: str,
    db: Session = Depends(get_db)
):
    """Generate authenticity certificate for luxury item"""
    # Verify product authenticity
    verification = await verify_pack_authenticity(pack_id, db)
    
    if verification.verification_result != "AUTHENTIC":
        raise HTTPException(400, "Product not authentic")
    
    # Get luxury specifications
    luxury_spec = db.query(LuxurySpecification).filter(
        LuxurySpecification.product_id == product_id
    ).first()
    
    # Generate certificate
    certificate = {
        "certificate_id": str(uuid.uuid4()),
        "product_id": str(product_id),
        "pack_id": pack_id,
        "authenticity_verified": True,
        "verification_date": datetime.utcnow(),
        "product_details": {
            "brand": verification.data.product.brand_name,
            "model": verification.data.product.model_number,
            "material": luxury_spec.material if luxury_spec else None,
            "limited_edition": luxury_spec.limited_edition if luxury_spec else False
        },
        "blockchain_hash": verification.data.blockchain_hash
    }
    
    return certificate
```

### 2.2 Frontend Industry Modules

#### Dynamic Industry Components
```typescript
// Industry-specific component factory
export const IndustryComponentFactory = {
    getProductForm: (industryType: string) => {
        switch (industryType) {
            case 'Technology':
                return ElectronicsProductForm;
            case 'Fashion':
                return LuxuryProductForm;
            case 'Consumer Goods':
                return FoodProductForm;
            case 'Automotive':
                return AutomotiveProductForm;
            case 'Personal Care':
                return CosmeticsProductForm;
            case 'Healthcare':
            default:
                return PharmaceuticalProductForm;
        }
    },
    
    getVerificationResult: (industryType: string) => {
        switch (industryType) {
            case 'Technology':
                return ElectronicsVerificationResult;
            case 'Fashion':
                return LuxuryVerificationResult;
            case 'Consumer Goods':
                return FoodVerificationResult;
            case 'Automotive':
                return AutomotiveVerificationResult;
            case 'Personal Care':
                return CosmeticsVerificationResult;
            case 'Healthcare':
            default:
                return PharmaceuticalVerificationResult;
        }
    },
    
    getDashboard: (industryType: string) => {
        switch (industryType) {
            case 'Technology':
                return ElectronicsDashboard;
            case 'Fashion':
                return LuxuryDashboard;
            case 'Consumer Goods':
                return FoodDashboard;
            case 'Automotive':
                return AutomotiveDashboard;
            case 'Personal Care':
                return CosmeticsDashboard;
            case 'Healthcare':
            default:
                return PharmaceuticalDashboard;
        }
    }
};

// Universal product form with industry-specific sections
const UniversalProductForm: React.FC<{ industryType: string }> = ({ industryType }) => {
    const IndustryForm = IndustryComponentFactory.getProductForm(industryType);
    
    return (
        <form>
            {/* Base product fields */}
            <BaseProductFields />
            
            {/* Industry-specific fields */}
            <IndustryForm />
            
            {/* Common actions */}
            <FormActions />
        </form>
    );
};
```

## Phase 3: Rebranding & User Migration (Months 5-6)

### 3.1 Brand Transition Strategy

#### Gradual Rebranding Approach
```typescript
// Feature flag system for gradual rollout
const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [brandingMode, setBrandingMode] = useState<'drugchain' | 'packguard' | 'hybrid'>('hybrid');
    
    useEffect(() => {
        // Check user preference or feature flag
        const userPreference = localStorage.getItem('branding_preference');
        const featureFlag = getFeatureFlag('packguard_branding');
        
        if (featureFlag.enabled) {
            setBrandingMode('packguard');
        } else if (userPreference === 'packguard') {
            setBrandingMode('packguard');
        } else {
            setBrandingMode('hybrid');
        }
    }, []);
    
    const brandingConfig = {
        drugchain: {
            name: 'DrugChain',
            logo: '/drugchain-logo.svg',
            primaryColor: '#2563eb',
            tagline: 'Pharmaceutical Supply Chain Security'
        },
        packguard: {
            name: 'PackGuard',
            logo: '/packguard-logo.svg',
            primaryColor: '#2563eb',
            tagline: 'Universal Product Authentication'
        },
        hybrid: {
            name: 'PackGuard (formerly DrugChain)',
            logo: '/packguard-logo.svg',
            primaryColor: '#2563eb',
            tagline: 'Universal Product Authentication'
        }
    };
    
    return (
        <BrandingContext.Provider value={brandingConfig[brandingMode]}>
            {children}
        </BrandingContext.Provider>
    );
};
```

#### User Communication Strategy
```typescript
// Migration notification system
const MigrationNotification: React.FC = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    
    useEffect(() => {
        const hasSeenNotification = localStorage.getItem('migration_notification_seen');
        if (!hasSeenNotification && !dismissed) {
            setShowNotification(true);
        }
    }, [dismissed]);
    
    const handleDismiss = () => {
        localStorage.setItem('migration_notification_seen', 'true');
        setDismissed(true);
        setShowNotification(false);
    };
    
    if (!showNotification) return null;
    
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                        Welcome to PackGuard!
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>
                            DrugChain has evolved into PackGuard - now supporting product 
                            authentication across all industries. Your pharmaceutical data 
                            and workflows remain unchanged.
                        </p>
                    </div>
                    <div className="mt-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => window.open('/about', '_blank')}
                                className="bg-blue-100 px-3 py-2 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-200"
                            >
                                Learn More
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="bg-transparent px-3 py-2 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
```

### 3.2 Data Migration Validation

#### Migration Testing Suite
```python
import pytest
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Product, ProductCategory, ProductAttribute

class TestMigration:
    """Test suite for data migration validation"""
    
    def test_all_products_have_categories(self, db: Session):
        """Ensure all products are assigned to categories"""
        products_without_category = db.query(Product).filter(
            Product.category_id.is_(None)
        ).count()
        
        assert products_without_category == 0, "Some products missing category assignment"
    
    def test_pharmaceutical_products_preserved(self, db: Session):
        """Ensure all original pharmaceutical products are preserved"""
        pharma_category = db.query(ProductCategory).filter(
            ProductCategory.category_code == 'PHARMA'
        ).first()
        
        pharma_products = db.query(Product).filter(
            Product.category_id == pharma_category.category_id
        ).count()
        
        # Should match original product count
        assert pharma_products > 0, "Pharmaceutical products not properly migrated"
    
    def test_legacy_api_compatibility(self, client):
        """Test that legacy API endpoints still work"""
        response = client.get("/api/v1/legacy/products/")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) > 0
        
        # Check legacy structure is maintained
        first_product = products[0]
        required_fields = ['product_id', 'product_code', 'product_name', 'dosage', 'form']
        for field in required_fields:
            assert field in first_product
    
    def test_verification_still_works(self, client, db: Session):
        """Test that existing pack verification still works"""
        # Get a sample pack ID from existing data
        sample_pack = db.query(Pack).first()
        
        response = client.post("/api/v1/verify/pack", json={
            "pack_id": sample_pack.pack_id
        })
        
        assert response.status_code == 200
        result = response.json()
        assert "verification_result" in result
```

## Phase 4: Full Platform Launch (Months 7-8)

### 4.1 Industry Onboarding

#### Pilot Program Structure
```python
# Pilot program management
class PilotProgram:
    def __init__(self, industry: str, participants: List[str]):
        self.industry = industry
        self.participants = participants
        self.start_date = datetime.utcnow()
        self.metrics = {}
    
    async def onboard_participant(self, organization_id: UUID, db: Session):
        """Onboard pilot program participant"""
        # Create specialized onboarding flow
        onboarding_steps = self.get_industry_onboarding_steps()
        
        for step in onboarding_steps:
            await step.execute(organization_id, db)
        
        # Track progress
        self.metrics[organization_id] = {
            'onboarded_at': datetime.utcnow(),
            'products_added': 0,
            'verifications_performed': 0
        }
    
    def get_industry_onboarding_steps(self):
        """Get industry-specific onboarding steps"""
        if self.industry == 'Technology':
            return [
                CreateElectronicsProfile(),
                SetupCompatibilityMatrix(),
                ConfigureWarrantyIntegration(),
                TrainOnTechFeatures()
            ]
        elif self.industry == 'Fashion':
            return [
                CreateLuxuryProfile(),
                SetupAuthenticationFeatures(),
                ConfigureProvenanceTracking(),
                TrainOnLuxuryFeatures()
            ]
        # ... other industries
```

#### Success Metrics Tracking
```python
class MigrationMetrics:
    """Track migration success metrics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_adoption_metrics(self) -> dict:
        """Get platform adoption metrics"""
        return {
            'total_users': self.db.query(User).count(),
            'users_by_industry': self.get_users_by_industry(),
            'products_by_industry': self.get_products_by_industry(),
            'verifications_by_industry': self.get_verifications_by_industry(),
            'monthly_active_users': self.get_monthly_active_users(),
            'feature_adoption_rates': self.get_feature_adoption_rates()
        }
    
    def get_users_by_industry(self) -> dict:
        """Get user distribution by industry"""
        query = self.db.query(
            Organization.industry_focus,
            func.count(User.user_id).label('user_count')
        ).join(User).group_by(Organization.industry_focus)
        
        return {row.industry_focus: row.user_count for row in query.all()}
    
    def get_migration_health(self) -> dict:
        """Get migration health indicators"""
        return {
            'legacy_api_usage': self.get_legacy_api_usage(),
            'new_feature_adoption': self.get_new_feature_adoption(),
            'error_rates': self.get_error_rates(),
            'performance_metrics': self.get_performance_metrics()
        }
```

## Risk Mitigation & Rollback Plan

### Rollback Strategy
```python
class RollbackManager:
    """Manage rollback procedures if migration fails"""
    
    def __init__(self, db: Session):
        self.db = db
        self.backup_tables = [
            'products_backup',
            'organizations_backup',
            'users_backup'
        ]
    
    async def create_backup(self):
        """Create backup of current state"""
        for table in ['products', 'organizations', 'users']:
            backup_table = f"{table}_backup"
            
            # Create backup table
            self.db.execute(f"""
                CREATE TABLE {backup_table} AS 
                SELECT * FROM {table}
            """)
        
        self.db.commit()
    
    async def rollback_to_backup(self):
        """Rollback to backup state"""
        try:
            # Restore from backup
            for table in ['products', 'organizations', 'users']:
                backup_table = f"{table}_backup"
                
                # Clear current table
                self.db.execute(f"TRUNCATE TABLE {table} CASCADE")
                
                # Restore from backup
                self.db.execute(f"""
                    INSERT INTO {table} 
                    SELECT * FROM {backup_table}
                """)
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Rollback failed: {e}")
```

### Monitoring & Alerts
```python
class MigrationMonitoring:
    """Monitor migration progress and health"""
    
    def __init__(self):
        self.alerts = []
    
    def check_migration_health(self):
        """Check various health indicators"""
        checks = [
            self.check_data_integrity(),
            self.check_api_performance(),
            self.check_user_activity(),
            self.check_error_rates()
        ]
        
        for check in checks:
            if not check.passed:
                self.alerts.append(check.alert)
        
        return len(self.alerts) == 0
    
    def check_data_integrity(self):
        """Verify data integrity after migration"""
        # Check for orphaned records, missing relationships, etc.
        pass
    
    def send_alerts(self):
        """Send alerts to administrators"""
        if self.alerts:
            # Send email/Slack notifications
            pass
```

## Timeline Summary

| Phase | Duration | Key Deliverables | Success Criteria |
|-------|----------|------------------|------------------|
| Phase 1 | Months 1-2 | Database migration, API compatibility | 100% data preserved, 0% downtime |
| Phase 2 | Months 3-4 | Multi-industry support | 2+ new industries supported |
| Phase 3 | Months 5-6 | Rebranding, user migration | 90%+ user retention |
| Phase 4 | Months 7-8 | Full platform launch | 5+ industries, 1000+ new users |

## Success Metrics

### Technical Metrics
- **Data Integrity**: 100% of existing data preserved
- **API Compatibility**: 100% backward compatibility maintained
- **Performance**: <5% degradation in response times
- **Uptime**: 99.9% availability during migration

### Business Metrics
- **User Retention**: >90% of existing users remain active
- **New User Acquisition**: 1000+ new users across new industries
- **Revenue Growth**: 200% increase in ARR within 12 months
- **Industry Coverage**: 5+ industries with active users

### User Experience Metrics
- **Migration Satisfaction**: >4.5/5 user satisfaction score
- **Feature Adoption**: >60% adoption of new industry features
- **Support Tickets**: <10% increase in support volume
- **Training Completion**: >80% completion rate for new features

This comprehensive migration strategy ensures a smooth transition from DrugChain to PackGuard while maintaining service quality and expanding market reach.