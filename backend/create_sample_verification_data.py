#!/usr/bin/env python3
"""
Script to create sample verification data for testing analytics
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
import random
from app.db.session import SessionLocal
from app.models.verification import VerificationEvent
from app.models import Pack

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Get some existing packs
        packs = db.query(Pack).limit(50).all()
        
        if not packs:
            print("No packs found. Please create some batches first.")
            return
        
        # Nigerian states for geographic distribution
        nigerian_states = [
            "Lagos", "Kano", "Kaduna", "Oyo", "Rivers", "Bayelsa", "Katsina", 
            "Cross River", "Abia", "Imo", "Ondo", "Osun", "Ogun", "Kwara", 
            "Borno", "Yobe", "Bauchi", "Gombe", "Adamawa", "Taraba", "Plateau",
            "Nasarawa", "Benue", "Kogi", "Niger", "Kebbi", "Sokoto", "Zamfara",
            "Jigawa", "Anambra", "Enugu", "Ebonyi", "Akwa Ibom", "Delta", "Edo"
        ]
        
        cities = {
            "Lagos": ["Lagos", "Ikeja", "Surulere", "Victoria Island"],
            "Kano": ["Kano", "Wudil", "Gwarzo"],
            "Kaduna": ["Kaduna", "Zaria", "Kafanchan"],
            "Oyo": ["Ibadan", "Ogbomoso", "Oyo"],
            "Rivers": ["Port Harcourt", "Obio-Akpor", "Okrika"]
        }
        
        verification_results = ["GENUINE", "GENUINE", "GENUINE", "GENUINE", "GENUINE", 
                              "GENUINE", "GENUINE", "COUNTERFEIT", "SUSPICIOUS"]
        
        # Create verification events for the last 60 days
        for i in range(200):  # Create 200 verification events
            pack = random.choice(packs)
            state = random.choice(nigerian_states)
            city = random.choice(cities.get(state, [state]))
            
            # Random date in the last 60 days
            days_ago = random.randint(0, 60)
            verification_date = datetime.now() - timedelta(days=days_ago)
            
            verification = VerificationEvent(
                pack_id=pack.pack_id,
                verification_result=random.choice(verification_results),
                location_address=f"{city}, {state}, Nigeria",
                ip_address=f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                verified_by_phone=f"+234{random.randint(7000000000, 9999999999)}",
                created_at=verification_date
            )
            
            db.add(verification)
        
        db.commit()
        print(f"Created 200 sample verification events")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()