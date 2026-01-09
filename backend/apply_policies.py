from app.db.session import engine
from sqlalchemy import text
import os

def apply_rls():
    sql_file = r'c:\Users\DELL\Desktop\DrugChain\backend\supabase\002_rls_policies.sql'
    
    if not os.path.exists(sql_file):
        print(f"Error: File not found at {sql_file}")
        return

    print("Reading SQL file...")
    with open(sql_file, 'r') as f:
        sql_content = f.read()

    # Split by semicolon to execute statements individually, as some drivers don't support multiple statements at once
    # But simple splitting might break if semicolons are in strings. 
    # For RLS policies, usually safely delimited.
    # However, SQLAlchemy execute might handle it or not depending on driver.
    # The safest is to let the user run it or try raw connection.
    
    print("Connecting to database...")
    with engine.connect() as conn:
        print("Applying policies...")
        # We wrap in a transaction
        trans = conn.begin()
        try:
            # Postgres supports executing the whole block usually
            conn.execute(text(sql_content))
            trans.commit()
            print("Successfully applied RLS policies!")
        except Exception as e:
            trans.rollback()
            print(f"Error applying policies provided sql: {e}")

if __name__ == "__main__":
    apply_rls()
