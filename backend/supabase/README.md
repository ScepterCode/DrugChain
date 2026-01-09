# Supabase Database Migration Guide

This folder contains SQL scripts to set up the DrugChain database in Supabase.

## Prerequisites

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your database credentials from: Project Settings > Database

## Migration Steps

### Step 1: Run the Schema Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** > **New Query**
3. Copy the contents of `001_complete_schema.sql`
4. Click **Run** to execute

This creates:
- All enum types (organizationtype, userrole, etc.)
- All tables (organizations, users, products, batches, etc.)
- Indexes for performance
- Triggers for updated_at timestamps

### Step 2: Apply Row Level Security (Optional)

If you want Supabase's RLS feature (recommended for production):

1. In SQL Editor, run `002_rls_policies.sql`

This creates policies that control:
- Who can view/edit organizations
- User profile access
- Product management by manufacturers
- Verification event logging

### Step 3: Insert Seed Data (Development Only)

For development/testing:

1. Run `003_seed_data.sql`

This creates:
- System admin user: `admin@drugchain.com` / `Admin123!`
- Sample manufacturer organization
- Sample product

## Environment Configuration

After migrating, update your `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

Get your connection string from:
- Supabase Dashboard > Project Settings > Database > Connection string

## Verifying Migration

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- alembic_version
- batches
- cartons
- manufacturers
- organizations
- packs
- products
- supply_chain_events
- users
- verification_events

## Troubleshooting

### Enum already exists error
If you get "type already exists" errors, the enums were already created. This is safe to ignore.

### Foreign key constraint error
Make sure you run the scripts in order (001, 002, 003) and don't skip the schema script.

### Connection issues
- Check your connection string format
- Ensure your IP is allowed (Supabase > Settings > Database > Connection Pooling)
