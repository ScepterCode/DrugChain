from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.dependencies import get_current_user, require_role
from app.models import User, UserRole, Batch, Product, Manufacturer, Pack, Carton
from app.models.verification import VerificationEvent
from app.services.blockchain_service import blockchain_service
from app.services.supply_chain_tracking_service import SupplyChainTrackingService

router = APIRouter()


@router.get("/manufacturer/dashboard")
async def get_manufacturer_dashboard(
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """Get manufacturer dashboard statistics"""
    
    if not current_user.organization_id:
        return {"data": {"error": "No organization linked"}}
        
    org_id = current_user.organization_id
    
    # 1. Total Products
    total_products = db.query(Product).filter(Product.manufacturer_id == org_id).count()
    
    # 2. Total Batches
    total_batches = db.query(Batch).filter(Batch.manufacturer_id == org_id).count()
    
    # 3. Total Verifications
    total_verifications = db.query(VerificationEvent)\
        .join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
        .join(Batch, Pack.batch_id == Batch.batch_id)\
        .filter(Batch.manufacturer_id == org_id)\
        .count()
    
    # 4. Calculate verification rate
    total_packs = db.query(Pack)\
        .join(Batch, Pack.batch_id == Batch.batch_id)\
        .filter(Batch.manufacturer_id == org_id)\
        .count()
    
    verification_rate = (total_verifications / total_packs * 100) if total_packs > 0 else 0
        
    return {
        "data": {
            "total_products": total_products,
            "total_batches": total_batches,
            "total_verifications": total_verifications,
            "verification_rate": round(verification_rate, 2)
        }
    }


@router.get("/regulator/dashboard")
async def get_regulator_dashboard(
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Get regulator dashboard statistics with enhanced data"""
    
    total_manufacturers = db.query(Manufacturer).count()
    total_products = db.query(Product).count()
    total_batches = db.query(Batch).count()
    total_verifications = db.query(VerificationEvent).count()
    
    # Count counterfeit alerts (verification_result = 'COUNTERFEIT')
    counterfeit_alerts = db.query(VerificationEvent)\
        .filter(VerificationEvent.verification_result == 'COUNTERFEIT')\
        .count()
    
    # Get verification trends (last 30 days)
    from datetime import datetime, timedelta
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    trends_results = db.query(
        func.date(VerificationEvent.created_at).label('date'),
        func.count(VerificationEvent.event_id).label('verifications')
    ).filter(
        VerificationEvent.created_at >= start_date,
        VerificationEvent.created_at <= end_date
    ).group_by(func.date(VerificationEvent.created_at))\
        .order_by(func.date(VerificationEvent.created_at)).all()
    
    verification_trends = []
    for result in trends_results:
        verification_trends.append({
            "date": result.date.isoformat(),
            "verifications": result.verifications
        })
    
    # Get geographic distribution - using a simple approach since location data is in address field
    # Get geographic distribution from actual verification data
    geo_results = db.query(
        func.count(VerificationEvent.event_id).label('total_verifications')
    ).filter(VerificationEvent.location_address.isnot(None)).first()
    
    # Get actual geographic distribution by parsing location addresses
    location_results = db.query(
        VerificationEvent.location_address,
        func.count(VerificationEvent.event_id).label('verifications')
    ).filter(VerificationEvent.location_address.isnot(None))\
     .group_by(VerificationEvent.location_address)\
     .all()
    
    # Parse states from location addresses
    state_counts = {}
    for result in location_results:
        if result.location_address:
            # Extract state from address (assuming format: "City, State, Country")
            parts = result.location_address.split(',')
            if len(parts) >= 2:
                state = parts[-2].strip()  # Second to last part should be state
                state_counts[state] = state_counts.get(state, 0) + result.verifications
    
    # Convert to list format
    geographic_distribution = []
    for state, count in state_counts.items():
        geographic_distribution.append({
            "state": state,
            "verifications": count
        })
    
    # Sort by verification count
    geographic_distribution.sort(key=lambda x: x['verifications'], reverse=True)
    
    # Get recent alerts
    alerts = db.query(VerificationEvent)\
        .join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
        .join(Batch, Pack.batch_id == Batch.batch_id)\
        .join(Product, Batch.product_id == Product.product_id)\
        .filter(VerificationEvent.verification_result.in_(['COUNTERFEIT', 'SUSPICIOUS']))\
        .order_by(VerificationEvent.created_at.desc())\
        .limit(10)\
        .all()
    
    recent_alerts = []
    for alert in alerts:
        pack = db.query(Pack).filter(Pack.pack_id == alert.pack_id).first()
        if pack:
            batch = db.query(Batch).filter(Batch.batch_id == pack.batch_id).first()
            if batch:
                product = db.query(Product).filter(Product.product_id == batch.product_id).first()
                recent_alerts.append({
                    "id": str(alert.event_id),
                    "type": alert.verification_result,
                    "product_name": product.product_name if product else "Unknown",
                    "location": alert.location_address or "Unknown Location",
                    "timestamp": alert.created_at.isoformat()
                })
    
    return {
        "data": {
            "total_manufacturers": total_manufacturers,
            "total_products": total_products,
            "total_batches": total_batches,
            "total_verifications_nationwide": total_verifications,
            "counterfeit_alerts": counterfeit_alerts,
            "verification_trends": verification_trends,
            "geographic_distribution": geographic_distribution,
            "recent_alerts": recent_alerts
        }
    }


@router.get("/distributor/dashboard")
async def get_distributor_dashboard(
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.PHARMACY.value])),
    db: Session = Depends(get_db)
):
    """Get distributor/pharmacy dashboard statistics with enhanced inventory data"""
    
    if not current_user.organization_id:
         return {"data": {"total_inventory_cartons": 0, "total_inventory_packs": 0}}

    org_id = current_user.organization_id

    # Count Cartons currently held by this org
    total_cartons = db.query(Carton).filter(Carton.current_holder_id == org_id).count()
    
    # Estimate packs (sum of packs_per_carton for held cartons)
    total_packs = db.query(func.sum(Carton.packs_per_carton))\
        .filter(Carton.current_holder_id == org_id).scalar() or 0
    
    # Real data only - no mock data
    return {
        "data": {
            "total_inventory_cartons": total_cartons,
            "total_inventory_packs": total_packs,
            "pending_transfers": 0,  # Will be 0 until transfer system is implemented
            "completed_transfers": 0,  # Will be 0 until transfer system is implemented
            "low_stock_alerts": 0,  # Will be 0 until stock monitoring is implemented
            "recent_transfers": [],  # Will be empty until transfer history is implemented
            "inventory_by_product": []  # Will be empty until product-wise inventory is implemented
        }
    }


@router.get("/verification-trends")
async def get_verification_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get verification trends over time"""
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Base query
    query = db.query(
        func.date(VerificationEvent.created_at).label('date'),
        func.count(VerificationEvent.event_id).label('verifications')
    ).filter(
        VerificationEvent.created_at >= start_date,
        VerificationEvent.created_at <= end_date
    )
    
    # Filter by manufacturer if user is manufacturer
    if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
        query = query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
            .join(Batch, Pack.batch_id == Batch.batch_id)\
            .filter(Batch.manufacturer_id == current_user.organization_id)
    
    # Group by date
    results = query.group_by(func.date(VerificationEvent.created_at))\
        .order_by(func.date(VerificationEvent.created_at)).all()
    
    # Format results
    trends = []
    for result in results:
        trends.append({
            "date": result.date.isoformat(),
            "verifications": result.verifications
        })
    
    return {"data": trends}


@router.get("/geographic-distribution")
async def get_geographic_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get verification distribution by geographic location"""
    
    # Base query - group by location (state)
    query = db.query(
        func.count(VerificationEvent.event_id).label('verifications')
    ).filter(VerificationEvent.location_address.isnot(None))
    
    # Filter by manufacturer if user is manufacturer
    if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
        query = query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
            .join(Batch, Pack.batch_id == Batch.batch_id)\
            .filter(Batch.manufacturer_id == current_user.organization_id)
    
    # Get actual geographic distribution from verification data
    location_results = db.query(
        VerificationEvent.location_address,
        func.count(VerificationEvent.event_id).label('verifications')
    ).filter(VerificationEvent.location_address.isnot(None))
    
    # Filter by user role
    if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
        location_results = location_results.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                                         .join(Batch, Pack.batch_id == Batch.batch_id)\
                                         .filter(Batch.manufacturer_id == current_user.organization_id)
    
    location_results = location_results.group_by(VerificationEvent.location_address).all()
    
    # Parse states from location addresses
    state_counts = {}
    for result in location_results:
        if result.location_address:
            # Extract state from address (assuming format: "City, State, Country")
            parts = result.location_address.split(',')
            if len(parts) >= 2:
                state = parts[-2].strip()  # Second to last part should be state
                state_counts[state] = state_counts.get(state, 0) + result.verifications
    
    # Convert to list format and sort
    distribution = []
    for state, count in state_counts.items():
        distribution.append({
            "state": state,
            "verifications": count
        })
    
    distribution.sort(key=lambda x: x['verifications'], reverse=True)
    
    return {"data": distribution}


@router.get("/product-performance")
async def get_product_performance(
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """Get product performance analytics for manufacturers"""
    
    if not current_user.organization_id:
        return {"data": []}
    
    org_id = current_user.organization_id
    
    # Get verification counts by product
    results = db.query(
        Product.product_name,
        Product.product_code,
        func.count(VerificationEvent.event_id).label('total_verifications'),
        func.count(Pack.pack_id).label('total_packs')
    ).select_from(Product)\
        .join(Batch, Product.product_id == Batch.product_id)\
        .join(Pack, Batch.batch_id == Pack.batch_id)\
        .outerjoin(VerificationEvent, Pack.pack_id == VerificationEvent.pack_id)\
        .filter(Product.manufacturer_id == org_id)\
        .group_by(Product.product_id, Product.product_name, Product.product_code)\
        .all()
    
    # Format results
    performance = []
    for result in results:
        verification_rate = (result.total_verifications / result.total_packs * 100) if result.total_packs > 0 else 0
        performance.append({
            "product_name": result.product_name,
            "product_code": result.product_code,
            "total_verifications": result.total_verifications,
            "total_packs": result.total_packs,
            "verification_rate": round(verification_rate, 2)
        })
    
    return {"data": performance}


@router.get("/recent-alerts")
async def get_recent_alerts(
    limit: int = 10,
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Get recent security alerts for regulators"""
    
    # Get recent counterfeit/suspicious verifications
    alerts = db.query(VerificationEvent)\
        .join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
        .join(Batch, Pack.batch_id == Batch.batch_id)\
        .join(Product, Batch.product_id == Product.product_id)\
        .filter(VerificationEvent.verification_result.in_(['COUNTERFEIT', 'SUSPICIOUS']))\
        .order_by(VerificationEvent.created_at.desc())\
        .limit(limit)\
        .all()
    
    # Format results
    alert_list = []
    for alert in alerts:
        pack = db.query(Pack).filter(Pack.pack_id == alert.pack_id).first()
        if pack:
            batch = db.query(Batch).filter(Batch.batch_id == pack.batch_id).first()
            if batch:
                product = db.query(Product).filter(Product.product_id == batch.product_id).first()
                alert_list.append({
                    "id": str(alert.event_id),
                    "type": alert.verification_result,
                    "product_name": product.product_name if product else "Unknown",
                    "location": alert.location_address or "Unknown Location",
                    "timestamp": alert.created_at.isoformat()
                })
    
    return {"data": alert_list}


@router.get("/verification-locations")
async def get_verification_locations(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get verification locations for map visualization"""
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Query verification events with location data
    query = db.query(
        VerificationEvent.location_address,
        func.count(VerificationEvent.event_id).label('count')
    ).filter(
        and_(
            VerificationEvent.created_at >= start_date,
            VerificationEvent.created_at <= end_date,
            VerificationEvent.location_address.isnot(None)
        )
    )
    
    # Filter by user role
    if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
        query = query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                    .join(Batch, Pack.batch_id == Batch.batch_id)\
                    .filter(Batch.manufacturer_id == current_user.organization_id)
    
    results = query.group_by(VerificationEvent.location_address).all()
    
    # Nigerian cities with coordinates
    nigerian_cities = {
        'Lagos': {'lat': 6.5244, 'lng': 3.3792},
        'Kano': {'lat': 12.0022, 'lng': 8.5920},
        'Ibadan': {'lat': 7.3775, 'lng': 3.9470},
        'Kaduna': {'lat': 10.5222, 'lng': 7.4383},
        'Port Harcourt': {'lat': 4.8156, 'lng': 7.0498},
        'Benin City': {'lat': 6.3350, 'lng': 5.6037},
        'Maiduguri': {'lat': 11.8311, 'lng': 13.1511},
        'Zaria': {'lat': 11.0804, 'lng': 7.7076},
        'Aba': {'lat': 5.1066, 'lng': 7.3667},
        'Jos': {'lat': 9.8965, 'lng': 8.8583},
        'Ilorin': {'lat': 8.5000, 'lng': 4.5500},
        'Oyo': {'lat': 7.8500, 'lng': 3.9333},
        'Enugu': {'lat': 6.4474, 'lng': 7.4983},
        'Abeokuta': {'lat': 7.1475, 'lng': 3.3619},
        'Abuja': {'lat': 9.0579, 'lng': 7.4951}
    }
    
    locations = []
    for i, result in enumerate(results):
        if result.location_address:
            # Extract city from address
            address_parts = result.location_address.split(',')
            city = address_parts[0].strip() if address_parts else 'Unknown'
            state = address_parts[-1].strip() if len(address_parts) > 1 else 'Unknown'
            
            # Get coordinates (use default if city not found)
            coords = nigerian_cities.get(city, {'lat': 9.0820 + (i * 0.1), 'lng': 8.6753 + (i * 0.1)})
            
            # Get recent verifications for this location
            recent_verifications = db.query(VerificationEvent)\
                .filter(
                    and_(
                        VerificationEvent.location_address == result.location_address,
                        VerificationEvent.created_at >= start_date
                    )
                )\
                .order_by(VerificationEvent.created_at.desc())\
                .limit(5)\
                .all()
            
            recent_list = []
            for verification in recent_verifications:
                recent_list.append({
                    'pack_id': verification.pack_id,
                    'verified_at': verification.created_at.isoformat(),
                    'result': verification.verification_result
                })
            
            locations.append({
                'id': f"loc_{i}",
                'latitude': coords['lat'],
                'longitude': coords['lng'],
                'city': city,
                'state': state,
                'count': result.count,
                'recent_verifications': recent_list
            })
    
    return {"data": locations}


@router.get("/volume-data")
async def get_volume_data(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get volume data for charts"""
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Generate time periods (weekly for 30+ days, daily for less)
    periods = []
    if days >= 30:
        # Weekly periods
        current = start_date
        while current < end_date:
            week_end = min(current + timedelta(days=7), end_date)
            periods.append({
                'start': current,
                'end': week_end,
                'label': f"Week of {current.strftime('%m/%d')}"
            })
            current = week_end
    else:
        # Daily periods
        current = start_date
        while current < end_date:
            day_end = min(current + timedelta(days=1), end_date)
            periods.append({
                'start': current,
                'end': day_end,
                'label': current.strftime('%m/%d')
            })
            current = day_end
    
    volume_data = []
    for period in periods:
        # Get production data (batches created)
        produced_query = db.query(func.sum(Batch.batch_size)).filter(
            and_(
                Batch.created_at >= period['start'],
                Batch.created_at < period['end']
            )
        )
        
        if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
            produced_query = produced_query.filter(Batch.manufacturer_id == current_user.organization_id)
        
        produced = produced_query.scalar() or 0
        
        # Get verification data
        verified_query = db.query(func.count(VerificationEvent.event_id)).filter(
            and_(
                VerificationEvent.created_at >= period['start'],
                VerificationEvent.created_at < period['end']
            )
        )
        
        if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
            verified_query = verified_query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                                        .join(Batch, Pack.batch_id == Batch.batch_id)\
                                        .filter(Batch.manufacturer_id == current_user.organization_id)
        
        verified = verified_query.scalar() or 0
        
        # Get counterfeit data
        counterfeit_query = db.query(func.count(VerificationEvent.event_id)).filter(
            and_(
                VerificationEvent.created_at >= period['start'],
                VerificationEvent.created_at < period['end'],
                VerificationEvent.verification_result.in_(['COUNTERFEIT', 'SUSPICIOUS'])
            )
        )
        
        if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
            counterfeit_query = counterfeit_query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                                              .join(Batch, Pack.batch_id == Batch.batch_id)\
                                              .filter(Batch.manufacturer_id == current_user.organization_id)
        
        counterfeit = counterfeit_query.scalar() or 0
        
        volume_data.append({
            'period': period['label'],
            'produced': int(produced),
            'distributed': int(produced * 0.8),  # Assume 80% distributed
            'verified': int(verified),
            'counterfeit': int(counterfeit)
        })
    
    # Get state-wise volume data
    state_volume_data = []
    states = ['Lagos', 'Kano', 'Kaduna', 'Oyo', 'Rivers', 'Anambra', 'Plateau', 'Borno', 'Osun', 'Imo']
    
    for state in states:
        # Get verifications for this state
        verifications_query = db.query(func.count(VerificationEvent.event_id)).filter(
            and_(
                VerificationEvent.created_at >= start_date,
                VerificationEvent.location_address.like(f'%{state}%')
            )
        )
        
        if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
            verifications_query = verifications_query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                                                   .join(Batch, Pack.batch_id == Batch.batch_id)\
                                                   .filter(Batch.manufacturer_id == current_user.organization_id)
        
        verifications = verifications_query.scalar() or 0
        
        counterfeit_count_query = db.query(func.count(VerificationEvent.event_id)).filter(
            and_(
                VerificationEvent.created_at >= start_date,
                VerificationEvent.location_address.like(f'%{state}%'),
                VerificationEvent.verification_result.in_(['COUNTERFEIT', 'SUSPICIOUS'])
            )
        )
        
        if current_user.role == UserRole.MANUFACTURER and current_user.organization_id:
            counterfeit_count_query = counterfeit_count_query.join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
                                                           .join(Batch, Pack.batch_id == Batch.batch_id)\
                                                           .filter(Batch.manufacturer_id == current_user.organization_id)
        
        counterfeit_count = counterfeit_count_query.scalar() or 0
        counterfeit_rate = (counterfeit_count / verifications * 100) if verifications > 0 else 0
        
        state_volume_data.append({
            'state': state,
            'volume': verifications,  # Use actual verification count as volume
            'verifications': verifications,
            'counterfeit_rate': round(counterfeit_rate, 2)
        })
    
    # Sort by volume
    state_volume_data.sort(key=lambda x: x['volume'], reverse=True)
    
    return {
        "data": {
            "volumeData": volume_data,
            "stateVolumeData": state_volume_data[:10]  # Top 10 states
        }
    }


@router.get("/blockchain")
async def get_blockchain_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get blockchain network analytics and status"""
    
    # Get blockchain analytics from blockchain service
    blockchain_data = blockchain_service.get_blockchain_analytics()
    
    # Get database verification stats for comparison
    total_db_verifications = db.query(VerificationEvent).count()
    recent_verifications = db.query(VerificationEvent)\
        .filter(VerificationEvent.created_at >= datetime.now() - timedelta(days=7))\
        .count()
    
    # Calculate blockchain vs database verification ratio
    blockchain_verified = blockchain_data.get('verified_on_blockchain', 0)
    blockchain_ratio = (blockchain_verified / total_db_verifications * 100) if total_db_verifications > 0 else 0
    
    return {
        "data": {
            # Blockchain network status
            "network_status": blockchain_data.get('network_status', 'UNAVAILABLE'),
            "consensus_nodes_active": blockchain_data.get('consensus_nodes_active', 0),
            "blockchain_integrity_score": blockchain_data.get('blockchain_integrity_score', 0),
            "last_block_time": blockchain_data.get('last_block_time', ''),
            
            # Transaction metrics
            "total_blockchain_transactions": blockchain_data.get('total_blockchain_transactions', 0),
            "verified_on_blockchain": blockchain_verified,
            "blockchain_verification_ratio": round(blockchain_ratio, 2),
            
            # Database comparison
            "total_database_verifications": total_db_verifications,
            "recent_verifications_7days": recent_verifications,
            
            # Security metrics
            "dual_layer_security_active": blockchain_data.get('network_status') == 'HEALTHY',
            "immutable_records_count": blockchain_verified,
            "cryptographic_verification_active": True,
            
            # Performance metrics - real data only
            "average_verification_time_ms": 0,  # Will be calculated when we track verification times
            "blockchain_uptime_percentage": 0.0,  # Will be calculated from actual blockchain status
            "consensus_success_rate": 0.0  # Will be calculated from actual consensus data
        }
    }


@router.get("/supply-chain/batch-flow/{batch_id}")
async def get_batch_supply_chain_flow(
    batch_id: str,
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """
    Get complete supply chain flow for a specific batch
    Shows how cartons moved through distributors and pharmacies
    """
    if not current_user.organization_id:
        return {"error": "No organization linked"}
    
    flow_data = SupplyChainTrackingService.get_batch_distribution_flow(
        db=db,
        batch_id=batch_id,
        manufacturer_id=str(current_user.organization_id)
    )
    
    return {"data": flow_data}


@router.get("/supply-chain/manufacturer-batches")
async def get_manufacturer_batch_summaries(
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """
    Get summary of all batches for manufacturer with supply chain status
    """
    if not current_user.organization_id:
        return {"data": []}
    
    batch_summaries = SupplyChainTrackingService.get_batch_summary_for_manufacturer(
        db=db,
        manufacturer_id=str(current_user.organization_id)
    )
    
    return {"data": batch_summaries}


@router.post("/supply-chain/verify-entity")
async def verify_entity_authorization(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Verify if an entity is authorized to scan carton codes
    Used by frontend to show appropriate error messages
    """
    auth_result = SupplyChainTrackingService.verify_entity_authorization(
        db=db,
        phone_number=phone_number
    )
    
    return {"data": auth_result}