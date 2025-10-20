// Trade Types
export interface Trade {
  id: string;
  userId: string;
  instrument: string;
  tradeDate: string; // ISO date string
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  entryTime: string; // ISO datetime string
  exitPrice: number;
  exitTime: string;
  pnl: number;
  pnlPercent?: number;
  durationSeconds?: number;
  commission?: number;
  importId?: string;
  notes?: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

// Tag Types
export interface Tag {
  id: string;
  userId: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt: string;
}

// Import Types
export interface TradeImport {
  id: string;
  userId: string;
  filename: string;
  filePath?: string;
  fileSize?: number;
  status: 'processing' | 'completed' | 'failed';
  tradesImported: number;
  tradesSkipped: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Calendar Types
export interface CalendarDay {
  date: string; // ISO date
  totalPnl: number;
  tradeCount: number;
  winRate: number;
  wins: number;
  losses: number;
}

// Analytics Types
export interface AnalyticsMetrics {
  totalPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageDuration: number; // seconds
  expectancy: number;
}

export interface DayOfWeekStats {
  day: string; // 'Monday', 'Tuesday', etc.
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

export interface HourOfDayStats {
  hour: number; // 0-23
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

export interface TagStats {
  tagId: string;
  tagName: string;
  tagColor: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
  profitFactor: number;
}

export interface EquityCurvePoint {
  date: string;
  cumulativePnl: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// Trade Filters
export interface TradeFilters {
  startDate?: string;
  endDate?: string;
  tags?: string[];
  instrument?: string;
  minPnl?: number;
  maxPnl?: number;
  limit?: number;
  offset?: number;
}

// Tradovate CSV Row
export interface TradovateCSVRow {
  Contract: string;
  'Trade Date': string;
  'Buy/Sell': string;
  Qty: string;
  Price: string;
  'T. Price': string;
  'P/L Open': string;
  'P/L': string;
  'Entry Time': string;
  'Exit Time': string;
  Duration: string;
}
