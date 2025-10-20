-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Trade Identification
  instrument VARCHAR(100) NOT NULL,
  trade_date DATE NOT NULL,

  -- Trade Details
  side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,

  -- Entry
  entry_price DECIMAL(12, 4) NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Exit
  exit_price DECIMAL(12, 4) NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Performance
  pnl DECIMAL(12, 2) NOT NULL,
  pnl_percent DECIMAL(8, 4),

  -- Additional Metrics
  duration_seconds INTEGER,
  commission DECIMAL(8, 2) DEFAULT 0,

  -- Metadata
  import_id UUID,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trades
CREATE INDEX idx_trades_user_date ON trades(user_id, trade_date);
CREATE INDEX idx_trades_user_entry_time ON trades(user_id, entry_time);
CREATE INDEX idx_trades_user_instrument ON trades(user_id, instrument);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

CREATE INDEX idx_tags_user ON tags(user_id);

-- Trade_Tags table (Many-to-Many)
CREATE TABLE trade_tags (
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (trade_id, tag_id)
);

CREATE INDEX idx_trade_tags_tag ON trade_tags(tag_id);

-- Imports table
CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_size INTEGER,

  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  trades_imported INTEGER DEFAULT 0,
  trades_skipped INTEGER DEFAULT 0,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_imports_user ON imports(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Trades RLS Policies
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Tags RLS Policies
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Trade_Tags RLS Policies
CREATE POLICY "Users can view own trade_tags"
  ON trade_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own trade_tags"
  ON trade_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own trade_tags"
  ON trade_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
  ));

-- Imports RLS Policies
CREATE POLICY "Users can view own imports"
  ON imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imports"
  ON imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imports"
  ON imports FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
