-- JournalEdge.io Development Seed Data
-- Migration: Add sample data for local development and testing
-- WARNING: DO NOT run this in production!

-- This migration should only be applied in development environments
-- Comment out or skip this file when deploying to production

-- ============================================================================
-- CONDITIONAL EXECUTION (only in development)
-- ============================================================================

-- Check if we're in development mode (you can set this via environment variable)
DO $$
BEGIN
  -- Only execute if NODE_ENV is not set or is 'development'
  IF current_setting('app.environment', true) IS NULL OR
     current_setting('app.environment', true) != 'production' THEN

    RAISE NOTICE 'Seeding development data...';

    -- Note: Actual user creation should be done through Supabase Auth
    -- These are just placeholder user profiles that would correspond to auth.users

    -- The user IDs below are examples - replace with actual UUIDs from your dev Supabase Auth users
    -- To get real user IDs:
    -- 1. Sign up test users via your app's auth flow
    -- 2. Query SELECT id, email FROM auth.users;
    -- 3. Replace the UUIDs below

    RAISE NOTICE 'To seed data, create test users via Supabase Auth first, then update the UUIDs in this file';

    -- Example seed data structure (commented out - update with real user IDs):

    /*
    -- Insert sample user profile (assumes user exists in auth.users)
    INSERT INTO public.users (id, email, full_name, timezone, currency)
    VALUES
      ('your-user-uuid-here', 'test@example.com', 'Test User', 'America/New_York', 'USD')
    ON CONFLICT (id) DO NOTHING;

    -- Insert sample tags
    INSERT INTO public.tags (user_id, name, color, description)
    VALUES
      ('your-user-uuid-here', 'Breakout', '#3B82F6', 'Breakout strategy trades'),
      ('your-user-uuid-here', 'Reversal', '#EF4444', 'Mean reversion trades'),
      ('your-user-uuid-here', 'Scalp', '#10B981', 'Quick scalp trades'),
      ('your-user-uuid-here', 'Swing', '#F59E0B', 'Multi-day swing trades')
    ON CONFLICT (user_id, name) DO NOTHING;

    -- Insert sample trades
    WITH sample_tags AS (
      SELECT id, name FROM public.tags WHERE user_id = 'your-user-uuid-here'
    )
    INSERT INTO public.trades (
      user_id, instrument, trade_date, side, quantity,
      entry_price, entry_time, exit_price, exit_time,
      pnl, commission, notes
    )
    VALUES
      -- Winning long trade
      (
        'your-user-uuid-here', 'MES', '2024-10-15', 'BUY', 2,
        5100.50, '2024-10-15 09:30:00-04', 5105.75, '2024-10-15 10:15:00-04',
        525.00, 4.80, 'Good breakout entry on market open'
      ),
      -- Losing short trade
      (
        'your-user-uuid-here', 'NQ', '2024-10-15', 'SELL', 1,
        16500.00, '2024-10-15 14:00:00-04', 16525.00, '2024-10-15 14:30:00-04',
        -250.00, 2.40, 'Stop loss hit - false breakdown'
      ),
      -- Winning short trade
      (
        'your-user-uuid-here', 'MES', '2024-10-16', 'SELL', 3,
        5110.00, '2024-10-16 10:00:00-04', 5102.50, '2024-10-16 11:45:00-04',
        1125.00, 7.20, 'Perfect reversal from resistance'
      )
    ON CONFLICT DO NOTHING;
    */

  ELSE
    RAISE NOTICE 'Skipping seed data - not in development environment';
  END IF;
END $$;

-- ============================================================================
-- DEVELOPMENT UTILITIES
-- ============================================================================

-- Function to clear all user data (development only!)
CREATE OR REPLACE FUNCTION clear_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Only allow in development
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'Cannot clear user data in production!';
  END IF;

  DELETE FROM public.trade_tags WHERE trade_id IN (
    SELECT id FROM public.trades WHERE user_id = target_user_id
  );
  DELETE FROM public.trades WHERE user_id = target_user_id;
  DELETE FROM public.tags WHERE user_id = target_user_id;
  DELETE FROM public.imports WHERE user_id = target_user_id;
  DELETE FROM public.user_sessions WHERE user_id = target_user_id;

  RAISE NOTICE 'Cleared all data for user %', target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random sample trades (development only!)
CREATE OR REPLACE FUNCTION generate_sample_trades(
  target_user_id UUID,
  num_trades INTEGER DEFAULT 50
)
RETURNS void AS $$
DECLARE
  i INTEGER;
  trade_date DATE;
  entry_time TIMESTAMPTZ;
  exit_time TIMESTAMPTZ;
  win_rate DECIMAL := 0.55; -- 55% win rate
  is_winner BOOLEAN;
BEGIN
  -- Only allow in development
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'Cannot generate sample trades in production!';
  END IF;

  FOR i IN 1..num_trades LOOP
    -- Random date in last 30 days
    trade_date := CURRENT_DATE - (random() * 30)::INTEGER;

    -- Random entry time during market hours
    entry_time := trade_date + (9 * INTERVAL '1 hour') + (random() * 6.5 * INTERVAL '1 hour');

    -- Random exit time (15 min to 4 hours later)
    exit_time := entry_time + (15 * INTERVAL '1 minute') + (random() * 3.75 * INTERVAL '1 hour');

    -- Determine if winner or loser based on win rate
    is_winner := random() < win_rate;

    -- Insert random trade
    INSERT INTO public.trades (
      user_id, instrument, trade_date, side, quantity,
      entry_price, entry_time, exit_price, exit_time,
      pnl, commission
    )
    VALUES (
      target_user_id,
      CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'MES'
        WHEN 1 THEN 'NQ'
        ELSE 'ES'
      END,
      trade_date,
      CASE WHEN random() < 0.5 THEN 'BUY' ELSE 'SELL' END,
      (1 + (random() * 4)::INTEGER)::DECIMAL, -- 1-5 contracts
      5000 + (random() * 500)::DECIMAL, -- Random entry price
      entry_time,
      5000 + (random() * 500)::DECIMAL, -- Random exit price
      exit_time,
      CASE
        WHEN is_winner THEN (50 + random() * 450)::DECIMAL -- Win: $50-$500
        ELSE -(25 + random() * 225)::DECIMAL -- Loss: $25-$250
      END,
      (2 + random() * 3)::DECIMAL -- Commission: $2-$5
    );
  END LOOP;

  RAISE NOTICE 'Generated % sample trades for user %', num_trades, target_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clear_user_data IS 'Development utility to clear all data for a user';
COMMENT ON FUNCTION generate_sample_trades IS 'Development utility to generate random sample trades';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- To use these functions in development:
--
-- 1. Create a test user via Supabase Auth dashboard or your app
--
-- 2. Generate sample data:
--    SELECT generate_sample_trades('your-user-uuid-here', 100);
--
-- 3. Clear user data if needed:
--    SELECT clear_user_data('your-user-uuid-here');
--
-- 4. Refresh analytics:
--    REFRESH MATERIALIZED VIEW public.user_trading_stats;
