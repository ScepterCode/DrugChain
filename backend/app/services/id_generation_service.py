"""
ID Generation Service for creating batches, cartons, and packs with unique identifiers
"""
import uuid
import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.models import Batch, Carton, Pack, Product, BatchStatus
from app.schemas import BatchCreate


class IDGenerationService:
    
    @staticmethod
    def generate_batch_id() -> str:
        """Generate a unique batch ID"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"BT-{timestamp}-{random_part}"
    
    @staticmethod
    def generate_carton_id(batch_id: str, carton_number: int) -> str:
        """Generate a unique carton ID"""
        return f"CT-{batch_id.split('-', 1)[1]}-{carton_number:04d}"
    
    @staticmethod
    def generate_pack_id() -> str:
        """Generate a unique pack ID"""
        # Generate a 12-character alphanumeric ID
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"PK-{random_part}"
    
    @classmethod
    def create_batch_hierarchy(
        cls,
        db: Session,
        batch_data: BatchCreate,
        manufacturer_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Create a complete batch hierarchy with cartons and packs
        """
        try:
            # Validate product exists and belongs to manufacturer
            product = db.query(Product).filter(
                Product.product_id == batch_data.product_id,
                Product.manufacturer_id == manufacturer_id
            ).first()
            
            if not product:
                raise ValueError("Product not found or does not belong to this manufacturer")
            
            # Generate batch ID
            batch_id = cls.generate_batch_id()
            
            # Create batch record
            new_batch = Batch(
                batch_id=batch_id,
                product_id=batch_data.product_id,
                manufacturer_id=manufacturer_id,
                production_date=batch_data.production_date,
                expiry_date=batch_data.expiry_date,
                batch_size=batch_data.batch_size,
                number_of_cartons=batch_data.number_of_cartons,
                total_packs=batch_data.batch_size,
                status=BatchStatus.ACTIVE,
                created_by=user_id
            )
            
            db.add(new_batch)
            db.flush()  # Get the batch ID
            
            # Create cartons and packs
            total_packs_created = 0
            cartons_created = []
            
            for carton_num in range(1, batch_data.number_of_cartons + 1):
                # Calculate packs for this carton
                remaining_packs = batch_data.batch_size - total_packs_created
                packs_in_this_carton = min(batch_data.packs_per_carton, remaining_packs)
                
                if packs_in_this_carton <= 0:
                    break
                
                # Generate carton ID
                carton_id = cls.generate_carton_id(batch_id, carton_num)
                
                # Create carton record
                carton = Carton(
                    carton_id=carton_id,
                    batch_id=batch_id,
                    carton_number=carton_num,
                    packs_per_carton=packs_in_this_carton,
                    current_holder_id=manufacturer_id
                )
                
                db.add(carton)
                cartons_created.append(carton_id)
                
                # Create packs for this carton
                for pack_num in range(packs_in_this_carton):
                    pack_id = cls.generate_pack_id()
                    
                    pack = Pack(
                        pack_id=pack_id,
                        batch_id=batch_id,
                        carton_id=carton_id,
                        status=BatchStatus.ACTIVE
                    )
                    
                    db.add(pack)
                    total_packs_created += 1
            
            # Commit all changes
            db.commit()
            
            return {
                "batch_id": batch_id,
                "product_id": str(batch_data.product_id),
                "product_name": product.product_name,
                "manufacturer_id": str(manufacturer_id),
                "production_date": batch_data.production_date,
                "expiry_date": batch_data.expiry_date,
                "batch_size": batch_data.batch_size,
                "total_packs": total_packs_created,
                "status": BatchStatus.ACTIVE.value,
                "created_at": new_batch.created_at,
                "cartons_created": len(cartons_created),
                "blockchain_tx_id": None  # Will be set when blockchain integration is added
            }
            
        except Exception as e:
            db.rollback()
            raise e