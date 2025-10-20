# JournalEdge.io Supabase Migrations

This directory contains database migrations for the JournalEdge.io platform.

## Architecture

The platform uses a **3-service microservices architecture**:

1. **Auth Service** (Port 3001) - User authentication and session management
2. **Data Service** (Port 3002) - Consolidated trades, tags, and calendar data
3. **Analytics Service** (Port 3003) - Trading statistics and metrics

## Migration Files

### 20241020000000_initial_schema.sql
Creates the complete database schema for all services:

**Auth Service Tables:**
- `users` - Extended user profiles (complements Supabase Auth)
- `user_sessions` - Session tracking for analytics

**Data Service Tables:**
- `trades` - Core trading transaction data
- `tags` - User-defined tags for categorization
- `trade_tags` - Many-to-many trade-tag associations
- `imports` - CSV import history and tracking

**Analytics Service:**
- `user_trading_stats` - Materialized view with pre-computed metrics

**Features:**
- Automatic timestamp management (`created_at`, `updated_at`)
- Auto-calculated trade metrics (duration, P&L %, etc.)
- Auto-generated slugs for tags
- Optimized indexes for query performance
- Triggers for data consistency

### 20241020000001_row_level_security.sql
Implements comprehensive Row Level Security (RLS) policies:

**Security Features:**
- Users can only access their own data
- Service role can bypass RLS for backend operations
- All tables protected with user-scoped policies
- Helper functions for ownership checks
- Proper permission grants

**Protected Resources:**
- User profiles
- Trading data
- Tags and associations
- Import history
- Analytics views

### 20241020000002_seed_development_data.sql
Development utilities and sample data:

**Utilities:**
- `clear_user_data(user_id)` - Clear all data for a test user
- `generate_sample_trades(user_id, count)` - Generate random sample trades
- Conditional execution (development only)

**⚠️ WARNING:** Do not run in production!

## Running Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or apply migrations manually
supabase migration up
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Execute each migration

### Option 3: Direct psql Connection

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/20241020000000_initial_schema.sql
\i supabase/migrations/20241020000001_row_level_security.sql

# Skip seed file in production!
# \i supabase/migrations/20241020000002_seed_development_data.sql
```

## Post-Migration Steps

### 1. Verify Schema

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 2. Generate TypeScript Types

```bash
# Using Supabase CLI
supabase gen types typescript --project-id your-project-ref > packages/db/types/database.types.ts

# Or manually from dashboard
# Go to Settings > API > Generate Types
```

### 3. Create Test Users

```bash
# Via Supabase Dashboard:
# Authentication > Users > Add User

# Or via your app's signup flow
```

### 4. Seed Development Data (Optional)

```sql
-- After creating test user, get their ID
SELECT id, email FROM auth.users;

-- Generate sample trades
SELECT generate_sample_trades('user-uuid-here', 100);

-- Refresh analytics
REFRESH MATERIALIZED VIEW public.user_trading_stats;
```

## Database Schema Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         ├──────┐
         │      │
┌────────▼──────▼────┐         ┌──────────────┐
│   public.users     │         │     tags     │
├────────────────────┤         ├──────────────┤
│ - id (FK)          │         │ - id         │
│ - email            │         │ - user_id    │
│ - plan             │         │ - name       │
│ - timezone         │         │ - color      │
└─────────┬──────────┘         └──────┬───────┘
          │                           │
          │                           │
          │      ┌──────────────┐     │
          └──────►    trades    ◄─────┘
          │      ├──────────────┤     │
          │      │ - id         │     │
          │      │ - user_id    │     │
          │      │ - instrument │     │
          │      │ - entry/exit │     │
          │      │ - pnl        │     │
          │      └──────┬───────┘     │
          │             │             │
          │      ┌──────▼──────┐      │
          │      │ trade_tags  │      │
          │      ├─────────────┤      │
          │      │ - trade_id  ├──────┘
          │      │ - tag_id    │
          │      └─────────────┘
          │
          │      ┌──────────────┐
          └──────►   imports    │
                 ├──────────────┤
                 │ - id         │
                 │ - user_id    │
                 │ - filename   │
                 │ - status     │
                 └──────────────┘
```

## Key Tables

### trades
The core table for all trading data.

**Important Fields:**
- `instrument` - Symbol/ticker (MES, NQ, AAPL, etc.)
- `side` - BUY (long) or SELL (short)
- `entry_price` / `exit_price` - Execution prices
- `pnl` - Profit/Loss in currency
- `pnl_percent` - Auto-calculated percentage return
- `duration_seconds` - Auto-calculated trade duration

**Indexes:**
- `trades_user_id_entry_time_idx` - Fast chronological queries
- `trades_user_id_trade_date_idx` - Fast calendar queries
- `trades_instrument_idx` - Filter by symbol

### tags
User-defined categories for trades.

**Features:**
- Auto-generated URL-friendly slugs
- Hex color codes for UI
- User-specific (isolated by RLS)

### user_trading_stats (Materialized View)
Pre-computed analytics for dashboard performance.

**Metrics:**
- Total/winning/losing trades
- Win rate percentage
- Total/average P&L
- Long vs short performance
- Commission totals

**Refresh:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_trading_stats;
```

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled with user-scoped policies:

```sql
-- Example: Users can only see their own trades
auth.uid() = user_id
```

### Service Role
Backend services use the **service_role** key to:
- Verify JWT tokens
- Bypass RLS when needed (with caution)
- Perform admin operations

**⚠️ Never expose service_role key to frontend!**

### Authentication Flow
1. User logs in via Supabase Auth
2. Receives JWT token
3. Backend verifies token with `supabase.auth.getUser(token)`
4. Database queries automatically scoped to `auth.uid()`

## Performance Considerations

### Indexes
- All foreign keys are indexed
- User-scoped queries (user_id) are optimized
- Date-based queries have composite indexes
- Materialized view has unique index on user_id

### Materialized View Refresh
The `user_trading_stats` view should be refreshed periodically:

```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_trading_stats;

-- Or set up a cron job (Supabase Dashboard > Database > Cron Jobs)
SELECT cron.schedule(
  'refresh-trading-stats',
  '0 * * * *', -- Every hour
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_trading_stats$$
);
```

## Troubleshooting

### Migration Fails
```bash
# Check current migration status
supabase migration list

# Repair if needed
supabase migration repair <version>

# Reset (⚠️ deletes all data!)
supabase db reset
```

### RLS Policy Issues
```sql
-- Check which policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Test policy as specific user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM trades; -- Should only see that user's trades
RESET ROLE;
```

### TypeScript Type Mismatches
```bash
# Regenerate types after schema changes
supabase gen types typescript --project-id your-project-ref > packages/db/types/database.types.ts

# Restart TypeScript server in your editor
```

## Environment Variables

Ensure these are set in your services:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Database Connection (optional, for direct access)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review migration logs in Supabase Dashboard
- Verify RLS policies are correctly configured
- Ensure service role key is used only in backend
