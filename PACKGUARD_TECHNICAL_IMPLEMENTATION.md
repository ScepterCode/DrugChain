# PackGuard Technical Implementation Guide

## Database Schema Migration

### 1. Core Schema Updates

#### Product Categories System
```sql
-- Create product categories table
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
('Electronics', 'ELEC', 'Technology', 'Electronic devices and components'),
('Luxury Goods', 'LUXURY', 'Fashion', 'High-end fashion and luxury items'),
('Food & Beverages', 'FOOD', 'Consumer Goods', 'Food products and beverages'),
('Automotive Parts', 'AUTO', 'Automotive', 'Vehicle parts and accessories'),
('Cosmetics', 'COSMETIC', 'Personal Care', 'Beauty and personal care products'),
('Pharmaceuticals', 'PHARMA', 'Healthcare', 'Pharmaceutical products');

-- Insert subcategories
INSERT INTO product_categories (category_name, category_code, parent_category_id, industry_type) VALUES
('Smartphones', 'PHONE', (SELECT category_id FROM product_categories WHERE category_code = 'ELEC'), 'Technology'),
('Laptops', 'LAPTOP', (SELECT category_id FROM product_categories WHERE category_code = 'ELEC'), 'Technology'),
('Handbags', 'HANDBAG', (SELECT category_id FROM product_categories WHERE category_code = 'LUXURY'), 'Fashion'),
('Watches', 'WATCH', (SELECT category_id FROM product_categories WHERE category_code = 'LUXURY'), 'Fashion');
```

#### Enhanced Products Table
```sql
-- Add new columns to existing products table
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES product_categories(category_id),
ADD COLUMN industry_type VARCHAR(50) DEFAULT 'Healthcare',
ADD COLUMN brand_name VARCHAR(200),
ADD COLUMN model_number VARCHAR(100),
ADD COLUMN serial_number_format VARCHAR(50),
ADD COLUMN warranty_period_months INTEGER,
ADD COLUMN country_of_origin VARCHAR(100),
ADD COLUMN regulatory_status VARCHAR(50) DEFAULT 'approved',
ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
ADD COLUMN verification_complexity VARCHAR(20) DEFAULT 'standard'; -- basic, standard, enhanced, premium

-- Update existing products to have category
UPDATE products SET 
    category_id = (SELECT category_id FROM product_categories WHERE category_code = 'PHARMA'),
    industry_type = 'Healthcare'
WHERE category_id IS NULL;
```

#### Product Attributes System
```sql
CREATE TABLE product_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT,
    attribute_type VARCHAR(50) DEFAULT 'text', -- text, number, date, boolean, json, url
    display_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    verification_level VARCHAR(20) DEFAULT 'basic', -- basic, enhanced, critical
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, attribute_name)
);

-- Create index for performance
CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_name ON product_attributes(attribute_name);
```

#### Certifications and Compliance
```sql
CREATE TABLE certifications (
    certification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    certification_type VARCHAR(100) NOT NULL,
    certification_name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(200),
    certificate_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_url TEXT,
    document_hash VARCHAR(64), -- For blockchain verification
    status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked, pending
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certifications_product_id ON certifications(product_id);
CREATE INDEX idx_certifications_status ON certifications(status);
```

#### Enhanced Organization Types
```sql
-- Update organization types enum
ALTER TYPE organizationtype ADD VALUE 'ELECTRONICS_MANUFACTURER';
ALTER TYPE organizationtype ADD VALUE 'LUXURY_BRAND';
ALTER TYPE organizationtype ADD VALUE 'FOOD_PRODUCER';
ALTER TYPE organizationtype ADD VALUE 'AUTOMOTIVE_OEM';
ALTER TYPE organizationtype ADD VALUE 'COSMETICS_MANUFACTURER';
ALTER TYPE organizationtype ADD VALUE 'RETAILER';
ALTER TYPE organizationtype ADD VALUE 'MARKETPLACE';
ALTER TYPE organizationtype ADD VALUE 'LOGISTICS_PROVIDER';
ALTER TYPE organizationtype ADD VALUE 'AUTHENTICATOR';
ALTER TYPE organizationtype ADD VALUE 'INSURANCE_COMPANY';

-- Add industry specialization to organizations
ALTER TABLE organizations 
ADD COLUMN industry_focus VARCHAR(50)[],
ADD COLUMN specialization TEXT,
ADD COLUMN certification_level VARCHAR(20) DEFAULT 'standard';
```

#### User Role Expansion
```sql
-- Add new user roles
ALTER TYPE userrole ADD VALUE 'RETAILER';
ALTER TYPE userrole ADD VALUE 'CONSUMER';
ALTER TYPE userrole ADD VALUE 'AUTHENTICATOR';
ALTER TYPE userrole ADD VALUE 'LOGISTICS_PROVIDER';
ALTER TYPE userrole ADD VALUE 'INSURANCE_AGENT';
ALTER TYPE userrole ADD VALUE 'CUSTOMS_OFFICER';

-- Add user preferences and specializations
ALTER TABLE users 
ADD COLUMN industry_focus VARCHAR(50)[],
ADD COLUMN notification_preferences JSONB DEFAULT '{}',
ADD COLUMN verification_level VARCHAR(20) DEFAULT 'standard';
```

### 2. Industry-Specific Extensions

#### Electronics Specific
```sql
CREATE TABLE electronics_specifications (
    spec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    processor VARCHAR(200),
    memory_gb INTEGER,
    storage_gb INTEGER,
    display_size DECIMAL(4,2),
    battery_capacity INTEGER,
    operating_system VARCHAR(100),
    connectivity JSONB DEFAULT '{}', -- wifi, bluetooth, cellular, etc.
    dimensions JSONB DEFAULT '{}', -- length, width, height, weight
    power_requirements JSONB DEFAULT '{}',
    compatibility_matrix JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Luxury Goods Specific
```sql
CREATE TABLE luxury_specifications (
    spec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    material VARCHAR(200),
    craftsmanship_level VARCHAR(50),
    limited_edition BOOLEAN DEFAULT FALSE,
    edition_number INTEGER,
    total_edition_size INTEGER,
    designer VARCHAR(200),
    collection_name VARCHAR(200),
    authentication_features JSONB DEFAULT '{}',
    provenance_history JSONB DEFAULT '{}',
    estimated_value DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Food & Beverage Specific
```sql
CREATE TABLE food_specifications (
    spec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    nutritional_info JSONB DEFAULT '{}',
    allergens VARCHAR(500)[],
    dietary_restrictions VARCHAR(100)[], -- vegan, gluten-free, kosher, halal
    origin_location VARCHAR(200),
    harvest_date DATE,
    processing_date DATE,
    storage_requirements JSONB DEFAULT '{}',
    shelf_life_days INTEGER,
    organic_certified BOOLEAN DEFAULT FALSE,
    fair_trade_certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Automotive Specific
```sql
CREATE TABLE automotive_specifications (
    spec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    part_category VARCHAR(100), -- engine, brake, electrical, body, etc.
    oem_part_number VARCHAR(100),
    compatible_vehicles JSONB DEFAULT '{}', -- make, model, year ranges
    safety_critical BOOLEAN DEFAULT FALSE,
    installation_complexity VARCHAR(20) DEFAULT 'medium',
    warranty_terms JSONB DEFAULT '{}',
    recall_history JSONB DEFAULT '{}',
    performance_specs JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Cosmetics Specific
```sql
CREATE TABLE cosmetics_specifications (
    spec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    ingredients JSONB DEFAULT '{}',
    skin_type_suitability VARCHAR(100)[],
    usage_instructions TEXT,
    safety_warnings TEXT,
    dermatologically_tested BOOLEAN DEFAULT FALSE,
    cruelty_free BOOLEAN DEFAULT FALSE,
    natural_percentage DECIMAL(5,2),
    spf_rating INTEGER,
    color_shade VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Enhancements

### 1. Industry-Agnostic Core APIs

#### Product Management
```python
# Enhanced Product Schema
class ProductCreate(BaseModel):
    product_code: str
    product_name: str
    category_id: UUID
    brand_name: str
    model_number: Optional[str] = None
    description: Optional[str] = None
    manufacturer_id: UUID
    industry_type: str
    country_of_origin: Optional[str] = None
    warranty_period_months: Optional[int] = None
    risk_level: str = "medium"
    verification_complexity: str = "standard"
    attributes: List[ProductAttribute] = []
    certifications: List[CertificationCreate] = []

class ProductAttribute(BaseModel):
    attribute_name: str
    attribute_value: str
    attribute_type: str = "text"
    is_required: bool = False
    is_public: bool = True
    verification_level: str = "basic"

# Enhanced Product Response
class ProductResponse(BaseModel):
    product_id: UUID
    product_code: str
    product_name: str
    category: CategoryResponse
    brand_name: str
    model_number: Optional[str]
    description: Optional[str]
    manufacturer: OrganizationResponse
    industry_type: str
    country_of_origin: Optional[str]
    warranty_period_months: Optional[int]
    risk_level: str
    verification_complexity: str
    attributes: List[ProductAttribute]
    certifications: List[CertificationResponse]
    is_active: bool
    created_at: datetime
```

#### Category Management
```python
@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    industry_type: Optional[str] = None,
    parent_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """List product categories with optional filtering"""
    query = db.query(ProductCategory)
    
    if industry_type:
        query = query.filter(ProductCategory.industry_type == industry_type)
    if parent_id:
        query = query.filter(ProductCategory.parent_category_id == parent_id)
    
    categories = query.filter(ProductCategory.is_active == True).all()
    return [CategoryResponse.from_orm(cat) for cat in categories]

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SYSTEM_ADMIN", "REGULATOR"]))
):
    """Create a new product category"""
    category = ProductCategory(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse.from_orm(category)
```

### 2. Industry-Specific APIs

#### Electronics API
```python
@router.post("/electronics/compatibility-check")
async def check_compatibility(
    product_id: UUID,
    target_product_id: UUID,
    db: Session = Depends(get_db)
):
    """Check compatibility between electronic products"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    target = db.query(Product).filter(Product.product_id == target_product_id).first()
    
    if not product or not target:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get electronics specifications
    spec = db.query(ElectronicsSpecification).filter(
        ElectronicsSpecification.product_id == product_id
    ).first()
    
    target_spec = db.query(ElectronicsSpecification).filter(
        ElectronicsSpecification.product_id == target_product_id
    ).first()
    
    if not spec or not target_spec:
        return {"compatible": False, "reason": "Specifications not available"}
    
    # Compatibility logic
    compatibility_result = check_electronics_compatibility(spec, target_spec)
    
    return {
        "compatible": compatibility_result.compatible,
        "compatibility_score": compatibility_result.score,
        "issues": compatibility_result.issues,
        "recommendations": compatibility_result.recommendations
    }

@router.get("/electronics/{product_id}/warranty-status")
async def get_warranty_status(
    product_id: UUID,
    serial_number: str,
    db: Session = Depends(get_db)
):
    """Get warranty status for electronic product"""
    # Implementation for warranty checking
    pass
```

#### Luxury Goods API
```python
@router.post("/luxury/authenticity-certificate")
async def generate_authenticity_certificate(
    product_id: UUID,
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "AUTHENTICATOR"]))
):
    """Generate authenticity certificate for luxury item"""
    # Verify product and pack
    verification_result = await verify_pack_authenticity(pack_id, db)
    
    if verification_result.verification_result != "AUTHENTIC":
        raise HTTPException(status_code=400, detail="Product is not authentic")
    
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
        "verifier": current_user.full_name,
        "product_details": {
            "brand": verification_result.data.product.brand_name,
            "model": verification_result.data.product.model_number,
            "material": luxury_spec.material if luxury_spec else None,
            "limited_edition": luxury_spec.limited_edition if luxury_spec else False
        },
        "blockchain_hash": verification_result.data.blockchain_hash
    }
    
    return certificate

@router.get("/luxury/{product_id}/resale-value")
async def estimate_resale_value(
    product_id: UUID,
    condition: str,
    market_location: str = "US",
    db: Session = Depends(get_db)
):
    """Estimate resale value for luxury item"""
    # Implementation for resale value estimation
    pass
```

#### Food & Beverage API
```python
@router.get("/food/{product_id}/nutritional-info")
async def get_nutritional_info(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    """Get detailed nutritional information"""
    food_spec = db.query(FoodSpecification).filter(
        FoodSpecification.product_id == product_id
    ).first()
    
    if not food_spec:
        raise HTTPException(status_code=404, detail="Nutritional information not available")
    
    return {
        "nutritional_info": food_spec.nutritional_info,
        "allergens": food_spec.allergens,
        "dietary_restrictions": food_spec.dietary_restrictions,
        "organic_certified": food_spec.organic_certified,
        "fair_trade_certified": food_spec.fair_trade_certified
    }

@router.post("/food/recall-check")
async def check_food_recalls(
    pack_id: str,
    db: Session = Depends(get_db)
):
    """Check if food product is subject to any recalls"""
    # Implementation for recall checking
    pass
```

#### Automotive API
```python
@router.get("/automotive/{product_id}/compatibility")
async def get_vehicle_compatibility(
    product_id: UUID,
    vehicle_make: str,
    vehicle_model: str,
    vehicle_year: int,
    db: Session = Depends(get_db)
):
    """Check automotive part compatibility with specific vehicle"""
    auto_spec = db.query(AutomotiveSpecification).filter(
        AutomotiveSpecification.product_id == product_id
    ).first()
    
    if not auto_spec:
        raise HTTPException(status_code=404, detail="Automotive specifications not available")
    
    # Check compatibility
    compatible_vehicles = auto_spec.compatible_vehicles
    is_compatible = check_vehicle_compatibility(
        compatible_vehicles, vehicle_make, vehicle_model, vehicle_year
    )
    
    return {
        "compatible": is_compatible,
        "part_category": auto_spec.part_category,
        "oem_part_number": auto_spec.oem_part_number,
        "safety_critical": auto_spec.safety_critical,
        "installation_complexity": auto_spec.installation_complexity
    }

@router.get("/automotive/recalls")
async def get_automotive_recalls(
    product_id: Optional[UUID] = None,
    oem_part_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get automotive recall information"""
    # Implementation for automotive recalls
    pass
```

#### Cosmetics API
```python
@router.get("/cosmetics/{product_id}/ingredients")
async def get_ingredient_analysis(
    product_id: UUID,
    skin_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get detailed ingredient analysis for cosmetic product"""
    cosmetic_spec = db.query(CosmeticsSpecification).filter(
        CosmeticsSpecification.product_id == product_id
    ).first()
    
    if not cosmetic_spec:
        raise HTTPException(status_code=404, detail="Cosmetic specifications not available")
    
    analysis = {
        "ingredients": cosmetic_spec.ingredients,
        "skin_type_suitability": cosmetic_spec.skin_type_suitability,
        "safety_warnings": cosmetic_spec.safety_warnings,
        "dermatologically_tested": cosmetic_spec.dermatologically_tested,
        "cruelty_free": cosmetic_spec.cruelty_free,
        "natural_percentage": cosmetic_spec.natural_percentage
    }
    
    # Add skin type compatibility if provided
    if skin_type and cosmetic_spec.skin_type_suitability:
        analysis["suitable_for_skin_type"] = skin_type in cosmetic_spec.skin_type_suitability
    
    return analysis
```

### 3. Enhanced Verification API

```python
@router.post("/verify/enhanced")
async def enhanced_verification(
    pack_id: str,
    verification_type: str = "standard", # basic, standard, enhanced, premium
    additional_data: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """Enhanced verification with industry-specific checks"""
    
    # Basic verification
    basic_result = await verify_pack_authenticity(pack_id, db)
    
    if basic_result.verification_result == "INVALID":
        return basic_result
    
    # Get product details
    product = basic_result.data.product
    
    # Industry-specific enhanced verification
    enhanced_checks = {}
    
    if product.industry_type == "Technology":
        enhanced_checks = await perform_electronics_verification(product, additional_data)
    elif product.industry_type == "Fashion":
        enhanced_checks = await perform_luxury_verification(product, additional_data)
    elif product.industry_type == "Consumer Goods" and "food" in product.category.category_name.lower():
        enhanced_checks = await perform_food_verification(product, additional_data)
    elif product.industry_type == "Automotive":
        enhanced_checks = await perform_automotive_verification(product, additional_data)
    elif product.industry_type == "Personal Care":
        enhanced_checks = await perform_cosmetics_verification(product, additional_data)
    
    # Combine results
    return {
        **basic_result.dict(),
        "enhanced_verification": enhanced_checks,
        "verification_level": verification_type,
        "industry_specific_data": await get_industry_specific_data(product)
    }
```

## Frontend Adaptations

### 1. Dynamic UI Components

#### Industry-Specific Product Forms
```typescript
// Dynamic form component based on industry
interface IndustryFormProps {
    industryType: string;
    productData: any;
    onSubmit: (data: any) => void;
}

const IndustrySpecificForm: React.FC<IndustryFormProps> = ({ 
    industryType, 
    productData, 
    onSubmit 
}) => {
    const getIndustryFields = () => {
        switch (industryType) {
            case 'Technology':
                return <ElectronicsFields />;
            case 'Fashion':
                return <LuxuryFields />;
            case 'Consumer Goods':
                return <FoodFields />;
            case 'Automotive':
                return <AutomotiveFields />;
            case 'Personal Care':
                return <CosmeticsFields />;
            default:
                return <GenericFields />;
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <BaseProductFields />
            {getIndustryFields()}
            <SubmitButton />
        </form>
    );
};
```

#### Verification Result Components
```typescript
interface VerificationResultProps {
    result: VerificationResponse;
    industryType: string;
}

const IndustryVerificationResult: React.FC<VerificationResultProps> = ({ 
    result, 
    industryType 
}) => {
    const renderIndustrySpecificInfo = () => {
        switch (industryType) {
            case 'Technology':
                return <ElectronicsVerificationInfo result={result} />;
            case 'Fashion':
                return <LuxuryVerificationInfo result={result} />;
            case 'Consumer Goods':
                return <FoodVerificationInfo result={result} />;
            case 'Automotive':
                return <AutomotiveVerificationInfo result={result} />;
            case 'Personal Care':
                return <CosmeticsVerificationInfo result={result} />;
            default:
                return null;
        }
    };

    return (
        <div className="verification-result">
            <BaseVerificationResult result={result} />
            {renderIndustrySpecificInfo()}
        </div>
    );
};
```

### 2. Industry-Specific Services

```typescript
// Electronics service
export const electronicsService = {
    checkCompatibility: async (productId: string, targetProductId: string) => {
        const response = await api.post('/electronics/compatibility-check', {
            product_id: productId,
            target_product_id: targetProductId
        });
        return response.data;
    },

    getWarrantyStatus: async (productId: string, serialNumber: string) => {
        const response = await api.get(`/electronics/${productId}/warranty-status`, {
            params: { serial_number: serialNumber }
        });
        return response.data;
    }
};

// Luxury goods service
export const luxuryService = {
    generateAuthenticityCard: async (productId: string, packId: string) => {
        const response = await api.post('/luxury/authenticity-certificate', {
            product_id: productId,
            pack_id: packId
        });
        return response.data;
    },

    estimateResaleValue: async (productId: string, condition: string) => {
        const response = await api.get(`/luxury/${productId}/resale-value`, {
            params: { condition }
        });
        return response.data;
    }
};
```

This technical implementation provides the foundation for expanding PackGuard across multiple industries while maintaining the robust blockchain-based verification system.