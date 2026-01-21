from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.api.dependencies import get_current_user, require_role
from app.models import User, UserRole, Carton, Pack, Batch, Product, Organization
from pydantic import BaseModel

router = APIRouter()


class ReceiveStockRequest(BaseModel):
    carton_ids: List[str]
    received_from: str
    notes: Optional[str] = None


class TransferOutRequest(BaseModel):
    carton_ids: List[str]
    transfer_to: str
    transfer_type: str  # 'SALE', 'TRANSFER', 'RETURN'
    notes: Optional[str] = None


class StockMovement(BaseModel):
    movement_id: str
    carton_id: str
    product_name: str
    movement_type: str  # 'RECEIVED', 'TRANSFERRED', 'SOLD'
    from_organization: Optional[str]
    to_organization: Optional[str]
    timestamp: datetime
    notes: Optional[str]


@router.post("receive-stock")
async def receive_stock(
    request: ReceiveStockRequest,
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.RETAILER.value])),
    db: Session = Depends(get_db)
):
    """Receive stock by scanning carton IDs"""
    
    if not current_user.organization_id:
        raise HTTPException(status_code=400, detail="User not associated with an organization")
    
    received_cartons = []
    errors = []
    
    for carton_id in request.carton_ids:
        # Find the carton
        carton = db.query(Carton).filter(Carton.carton_id == carton_id).first()
        
        if not carton:
            errors.append(f"Carton {carton_id} not found")
            continue
        
        # Update carton holder
        carton.current_holder_id = current_user.organization_id
        carton.last_transfer_date = datetime.utcnow()
        
        # Get product info for response
        batch = db.query(Batch).filter(Batch.batch_id == carton.batch_id).first()
        product = db.query(Product).filter(Product.product_id == batch.product_id).first() if batch else None
        
        received_cartons.append({
            "carton_id": carton.carton_id,
            "batch_id": carton.batch_id,
            "product_name": product.product_name if product else "Unknown",
            "pack_count": carton.packs_per_carton
        })
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Successfully received {len(received_cartons)} cartons",
        "data": {
            "received_cartons": received_cartons,
            "errors": errors
        }
    }


@router.post("transfer-out")
async def transfer_out(
    request: TransferOutRequest,
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.RETAILER.value])),
    db: Session = Depends(get_db)
):
    """Transfer stock out to another organization"""
    
    if not current_user.organization_id:
        raise HTTPException(status_code=400, detail="User not associated with an organization")
    
    # Verify destination organization exists
    destination_org = db.query(Organization).filter(
        Organization.organization_id == request.transfer_to
    ).first()
    
    if not destination_org:
        raise HTTPException(status_code=400, detail="Destination organization not found")
    
    transferred_cartons = []
    errors = []
    
    for carton_id in request.carton_ids:
        # Find the carton and verify ownership
        carton = db.query(Carton).filter(
            Carton.carton_id == carton_id,
            Carton.current_holder_id == current_user.organization_id
        ).first()
        
        if not carton:
            errors.append(f"Carton {carton_id} not found or not owned by your organization")
            continue
        
        # Update carton holder
        carton.current_holder_id = request.transfer_to
        carton.last_transfer_date = datetime.utcnow()
        
        # Get product info for response
        batch = db.query(Batch).filter(Batch.batch_id == carton.batch_id).first()
        product = db.query(Product).filter(Product.product_id == batch.product_id).first() if batch else None
        
        transferred_cartons.append({
            "carton_id": carton.carton_id,
            "batch_id": carton.batch_id,
            "product_name": product.product_name if product else "Unknown",
            "pack_count": carton.packs_per_carton,
            "transferred_to": destination_org.organization_name
        })
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Successfully transferred {len(transferred_cartons)} cartons",
        "data": {
            "transferred_cartons": transferred_cartons,
            "errors": errors
        }
    }


@router.get("inventory")
async def get_inventory(
    product_id: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.RETAILER.value])),
    db: Session = Depends(get_db)
):
    """Get current inventory for the organization"""
    
    if not current_user.organization_id:
        return {"data": {"inventory": [], "summary": {}}}
    
    # Base query for cartons held by this organization
    query = db.query(Carton).filter(Carton.current_holder_id == current_user.organization_id)
    
    if product_id:
        query = query.join(Batch, Carton.batch_id == Batch.batch_id)\
            .filter(Batch.product_id == product_id)
    
    cartons = query.all()
    
    # Group by product
    inventory_by_product = {}
    total_cartons = 0
    total_packs = 0
    
    for carton in cartons:
        batch = db.query(Batch).filter(Batch.batch_id == carton.batch_id).first()
        if not batch:
            continue
            
        product = db.query(Product).filter(Product.product_id == batch.product_id).first()
        if not product:
            continue
        
        product_key = product.product_id
        if product_key not in inventory_by_product:
            inventory_by_product[product_key] = {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "product_code": product.product_code,
                "cartons": 0,
                "packs": 0,
                "batches": set()
            }
        
        inventory_by_product[product_key]["cartons"] += 1
        inventory_by_product[product_key]["packs"] += carton.packs_per_carton
        inventory_by_product[product_key]["batches"].add(batch.batch_id)
        
        total_cartons += 1
        total_packs += carton.packs_per_carton
    
    # Convert to list and format
    inventory_list = []
    for product_data in inventory_by_product.values():
        # Determine stock status (mock logic)
        if product_data["cartons"] == 0:
            status = "OUT_OF_STOCK"
        elif product_data["cartons"] < 5:  # Arbitrary threshold
            status = "LOW"
        else:
            status = "NORMAL"
        
        inventory_list.append({
            "product_id": product_data["product_id"],
            "product_name": product_data["product_name"],
            "product_code": product_data["product_code"],
            "cartons": product_data["cartons"],
            "packs": product_data["packs"],
            "batch_count": len(product_data["batches"]),
            "status": status
        })
    
    return {
        "data": {
            "inventory": inventory_list,
            "summary": {
                "total_products": len(inventory_list),
                "total_cartons": total_cartons,
                "total_packs": total_packs
            }
        }
    }


@router.get("transfer-history")
async def get_transfer_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.RETAILER.value])),
    db: Session = Depends(get_db)
):
    """Get transfer history for the organization"""
    
    if not current_user.organization_id:
        return {"data": {"transfers": [], "total_count": 0}}
    
    # Get cartons that were either received by or transferred from this organization
    # This is a simplified version - in a full implementation, you'd have a separate transfer log table
    
    # Get recent cartons held by this organization
    recent_cartons = db.query(Carton)\
        .filter(Carton.current_holder_id == current_user.organization_id)\
        .filter(Carton.last_transfer_date.isnot(None))\
        .order_by(Carton.last_transfer_date.desc())\
        .offset(offset).limit(limit)\
        .all()
    
    transfers = []
    for carton in recent_cartons:
        batch = db.query(Batch).filter(Batch.batch_id == carton.batch_id).first()
        product = db.query(Product).filter(Product.product_id == batch.product_id).first() if batch else None
        
        transfers.append({
            "id": f"transfer_{carton.carton_id}_{int(carton.last_transfer_date.timestamp())}",
            "type": "RECEIVED",  # Simplified - in reality, you'd track this properly
            "carton_id": carton.carton_id,
            "product_name": product.product_name if product else "Unknown",
            "quantity": 1,  # 1 carton
            "from_to": "Unknown",  # Would need proper transfer tracking
            "timestamp": carton.last_transfer_date.isoformat()
        })
    
    return {
        "data": {
            "transfers": transfers,
            "total_count": len(transfers)
        }
    }


@router.get("low-stock-alerts")
async def get_low_stock_alerts(
    threshold: int = 5,  # Cartons
    current_user: User = Depends(require_role([UserRole.DISTRIBUTOR.value, UserRole.RETAILER.value])),
    db: Session = Depends(get_db)
):
    """Get low stock alerts for products below threshold"""
    
    if not current_user.organization_id:
        return {"data": {"alerts": []}}
    
    # Get inventory summary
    inventory_response = await get_inventory(current_user=current_user, db=db)
    inventory = inventory_response["data"]["inventory"]
    
    # Filter for low stock items
    alerts = []
    for item in inventory:
        if item["status"] in ["LOW", "OUT_OF_STOCK"]:
            alerts.append({
                "product_id": item["product_id"],
                "product_name": item["product_name"],
                "current_stock": item["cartons"],
                "threshold": threshold,
                "status": item["status"],
                "recommended_action": "REORDER" if item["status"] == "LOW" else "URGENT_REORDER"
            })
    
    return {
        "data": {
            "alerts": alerts,
            "total_alerts": len(alerts)
        }
    }