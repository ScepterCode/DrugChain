from app.db.session import engine
from sqlalchemy import text
import re

def apply_rls():
    sql_file = r'c:\Users\DELL\Desktop\DrugChain\backend\supabase\002_rls_policies.sql'
    
    with open(sql_file, 'r') as f:
        sql_content = f.read()

    # Split statements by semicolon, but be careful (rudimentary split)
    # This regex splits by semicolon that is followed by whitespace/newline
    # It might be imperfect but better than executing all at once
    statements = sql_content.split(';')
    
    with engine.connect() as conn:
        for stmt in statements:
            if stmt.strip():
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                    print("Executed statement.")
                except Exception as e:
                    print(f"Error executing statement: {e}")
                    # Don't stop, try next (some policies might exist already)

if __name__ == "__main__":
    apply_rls()
