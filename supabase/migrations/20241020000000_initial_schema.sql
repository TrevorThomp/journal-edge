-- JournalEdge.io Database Schema
-- Migration: Initial schema for consolidated 3-service architecture
-- Services: Auth Service, Data Service, Analytics Service

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- AUTH SERVICE SCHEMA
-- ============================================================================

-- Users table (extends Supabase auth.users)
-- Stores additional user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Subscription/plan info
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),

  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User sessions tracking (optional - for analytics)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Session info
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ============================================================================
-- DATA SERVICE SCHEMA
-- ============================================================================

-- Tags table
-- User-defined tags for categorizing trades
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Tag details
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly version of name
  color TEXT, -- Hex color code (e.g., #FF5733)
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT tags_user_name_unique UNIQUE (user_id, name),
  CONSTRAINT tags_user_slug_unique UNIQUE (user_id, slug),
  CONSTRAINT tags_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Trades table
-- Core trading data
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Trade identification
  instrument TEXT NOT NULL, -- Symbol/ticker (e.g., "MES", "NQ", "AAPL")
  trade_date DATE NOT NULL, -- Date of the trade (extracted from entry_time)

  -- Trade details
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')), -- Direction (BUY = long, SELL = short)
  quantity DECIMAL(18, 8) NOT NULL CHECK (quantity > 0), -- Position size

  -- Entry
  entry_price DECIMAL(18, 8) NOT NULL CHECK (entry_price > 0),
  entry_time TIMESTAMPTZ NOT NULL,

  -- Exit
  exit_price DECIMAL(18, 8) NOT NULL CHECK (exit_price >= 0),
  exit_time TIMESTAMPTZ NOT NULL,

  -- P&L
  pnl DECIMAL(18, 2) NOT NULL, -- Profit/Loss in currency
  pnl_percent DECIMAL(10, 4), -- P&L as percentage

  -- Trade metrics
  duration_seconds INTEGER, -- Trade duration in seconds
  commission DECIMAL(18, 2) DEFAULT 0, -- Trading fees/commissions

  -- Notes and metadata
  notes TEXT,

  -- Import tracking
  import_id UUID, -- References imports table if trade was imported from CSV

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trade-Tag association table (many-to-many)
CREATE TABLE IF NOT EXISTS public.trade_tags (
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (trade_id, tag_id)
);

-- Import history table
-- Tracks CSV import operations
CREATE TABLE IF NOT EXISTS public.imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Import details
  filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_format TEXT DEFAULT 'csv', -- csv, tradovate, etc.

  -- Import results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  total_rows INTEGER,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- ANALYTICS SERVICE SCHEMA
-- ============================================================================

-- Trading statistics materialized view
-- Pre-computed analytics for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_trading_stats AS
SELECT
  user_id,

  -- Overall stats
  COUNT(*) as total_trades,
  COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
  COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
  COUNT(*) FILTER (WHERE pnl = 0) as breakeven_trades,

  -- Win rate
  ROUND(
    (COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / NULLIF(COUNT(*), 0) * 100),
    2
  ) as win_rate_percent,

  -- P&L
  SUM(pnl) as total_pnl,
  AVG(pnl) as average_pnl,
  MAX(pnl) as largest_win,
  MIN(pnl) as largest_loss,

  -- By side
  COUNT(*) FILTER (WHERE side = 'BUY') as long_trades,
  COUNT(*) FILTER (WHERE side = 'SELL') as short_trades,
  SUM(pnl) FILTER (WHERE side = 'BUY') as long_pnl,
  SUM(pnl) FILTER (WHERE side = 'SELL') as short_pnl,

  -- Average metrics
  AVG(duration_seconds) as avg_duration_seconds,
  SUM(commission) as total_commissions,

  -- Last updated
  NOW() as calculated_at

FROM public.trades
GROUP BY user_id;

-- Create index on user_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS user_trading_stats_user_id_idx ON public.user_trading_stats(user_id);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_started_at_idx ON public.user_sessions(started_at);

-- Tags indexes
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS tags_name_idx ON public.tags(name);

-- Trades indexes (critical for performance)
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS trades_instrument_idx ON public.trades(instrument);
CREATE INDEX IF NOT EXISTS trades_trade_date_idx ON public.trades(trade_date);
CREATE INDEX IF NOT EXISTS trades_entry_time_idx ON public.trades(entry_time);
CREATE INDEX IF NOT EXISTS trades_user_id_trade_date_idx ON public.trades(user_id, trade_date);
CREATE INDEX IF NOT EXISTS trades_user_id_entry_time_idx ON public.trades(user_id, entry_time DESC);
CREATE INDEX IF NOT EXISTS trades_import_id_idx ON public.trades(import_id);

-- Trade-Tags indexes
CREATE INDEX IF NOT EXISTS trade_tags_trade_id_idx ON public.trade_tags(trade_id);
CREATE INDEX IF NOT EXISTS trade_tags_tag_id_idx ON public.trade_tags(tag_id);

-- Imports indexes
CREATE INDEX IF NOT EXISTS imports_user_id_idx ON public.imports(user_id);
CREATE INDEX IF NOT EXISTS imports_status_idx ON public.imports(status);
CREATE INDEX IF NOT EXISTS imports_created_at_idx ON public.imports(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trade metrics
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration in seconds
  IF NEW.exit_time IS NOT NULL AND NEW.entry_time IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time))::INTEGER;
  END IF;

  -- Calculate P&L percentage
  IF NEW.entry_price > 0 AND NEW.exit_price > 0 THEN
    IF NEW.side = 'BUY' THEN
      -- Long position: (exit - entry) / entry * 100
      NEW.pnl_percent = ((NEW.exit_price - NEW.entry_price) / NEW.entry_price * 100);
    ELSE
      -- Short position: (entry - exit) / entry * 100
      NEW.pnl_percent = ((NEW.entry_price - NEW.exit_price) / NEW.entry_price * 100);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from tag name
CREATE OR REPLACE FUNCTION generate_slug_from_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert name to lowercase, replace spaces with hyphens, remove special chars
  NEW.slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh trading stats materialized view
CREATE OR REPLACE FUNCTION refresh_trading_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_trading_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on trades table
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate trade metrics
CREATE TRIGGER calculate_trade_metrics_trigger
  BEFORE INSERT OR UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trade_metrics();

-- Auto-generate slug for tags
CREATE TRIGGER generate_tag_slug_trigger
  BEFORE INSERT OR UPDATE ON public.tags
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_slug_from_name();

-- Refresh trading stats when trades change (optional - can be expensive)
-- Uncomment if you want real-time stats updates
-- CREATE TRIGGER refresh_stats_on_trade_change
--   AFTER INSERT OR UPDATE OR DELETE ON public.trades
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION refresh_trading_stats();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'Extended user profile information (complements auth.users)';
COMMENT ON TABLE public.user_sessions IS 'User session tracking for analytics';
COMMENT ON TABLE public.tags IS 'User-defined tags for categorizing trades';
COMMENT ON TABLE public.trades IS 'Core trading data and transaction history';
COMMENT ON TABLE public.trade_tags IS 'Many-to-many relationship between trades and tags';
COMMENT ON TABLE public.imports IS 'CSV import history and status tracking';
COMMENT ON MATERIALIZED VIEW public.user_trading_stats IS 'Pre-computed trading statistics per user';

COMMENT ON COLUMN public.trades.side IS 'BUY = long position, SELL = short position';
COMMENT ON COLUMN public.trades.pnl IS 'Profit/Loss in user currency (after commissions)';
COMMENT ON COLUMN public.trades.pnl_percent IS 'P&L as percentage of entry price';
COMMENT ON COLUMN public.trades.duration_seconds IS 'Time between entry and exit in seconds';
