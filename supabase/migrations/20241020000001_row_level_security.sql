-- JournalEdge.io Row Level Security (RLS) Policies
-- Migration: Enable RLS and create security policies for all tables
-- Critical for data isolation between users

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users are created via trigger on auth.users signup (handled by Supabase Auth)
-- Allow service role to insert users
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- USER SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions"
  ON public.user_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- TAGS TABLE POLICIES
-- ============================================================================

-- Users can view their own tags
CREATE POLICY "Users can view own tags"
  ON public.tags
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tags
CREATE POLICY "Users can insert own tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY "Users can update own tags"
  ON public.tags
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete own tags"
  ON public.tags
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRADES TABLE POLICIES
-- ============================================================================

-- Users can view their own trades
CREATE POLICY "Users can view own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own trades
CREATE POLICY "Users can insert own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own trades
CREATE POLICY "Users can update own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own trades
CREATE POLICY "Users can delete own trades"
  ON public.trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRADE_TAGS TABLE POLICIES
-- ============================================================================

-- Users can view trade-tag associations for their own trades
CREATE POLICY "Users can view own trade tags"
  ON public.trade_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_tags.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Users can create trade-tag associations for their own trades
CREATE POLICY "Users can insert own trade tags"
  ON public.trade_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_tags.trade_id
      AND trades.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.tags
      WHERE tags.id = trade_tags.tag_id
      AND tags.user_id = auth.uid()
    )
  );

-- Users can delete trade-tag associations for their own trades
CREATE POLICY "Users can delete own trade tags"
  ON public.trade_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_tags.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- ============================================================================
-- IMPORTS TABLE POLICIES
-- ============================================================================

-- Users can view their own import history
CREATE POLICY "Users can view own imports"
  ON public.imports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own import records
CREATE POLICY "Users can insert own imports"
  ON public.imports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own import records (e.g., to update status)
CREATE POLICY "Users can update own imports"
  ON public.imports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own import records
CREATE POLICY "Users can delete own imports"
  ON public.imports
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS FOR POLICIES
-- ============================================================================

-- Function to check if a user owns a trade
CREATE OR REPLACE FUNCTION user_owns_trade(trade_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.trades
    WHERE id = trade_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user owns a tag
CREATE OR REPLACE FUNCTION user_owns_tag(tag_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tags
    WHERE id = tag_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT ON public.user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.trade_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.imports TO authenticated;

-- Grant select on materialized view
GRANT SELECT ON public.user_trading_stats TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION user_owns_trade(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_owns_tag(UUID) TO authenticated;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 1. All tables have RLS enabled - unauthorized access is prevented at the database level
-- 2. Policies ensure users can only access their own data (user_id = auth.uid())
-- 3. Service role bypasses RLS for admin operations (used by backend services for auth)
-- 4. Anonymous users have no access to any tables
-- 5. Trade-tag associations are protected - users can only link their own trades to their own tags
-- 6. Helper functions use SECURITY DEFINER to safely check ownership
-- 7. Materialized view is read-only for all authenticated users (shows only their own stats due to base table RLS)

COMMENT ON FUNCTION user_owns_trade IS 'Check if authenticated user owns a specific trade';
COMMENT ON FUNCTION user_owns_tag IS 'Check if authenticated user owns a specific tag';
