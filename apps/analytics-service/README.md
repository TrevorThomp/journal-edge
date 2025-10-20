# Analytics Service

Trading analytics and metrics calculation microservice for JournalEdge.io.

## Responsibility

Calculates trading performance metrics and analytics including:
- Overall performance metrics (win rate, profit factor, expectancy)
- Time-based analysis (by day of week, by hour)
- Tag-based performance analytics
- Equity curve generation
- Symbol-level statistics

## Port

3003

## API Endpoints

### GET /analytics/metrics
Calculate overall trading metrics.

**Response:**
```json
{
  "metrics": {
    "total_trades": 100,
    "winning_trades": 60,
    "losing_trades": 40,
    "win_rate": 60.0,
    "total_pnl": 5000.00
  }
}
```

### GET /analytics/by-day-of-week
Analyze performance by day of week (placeholder).

### GET /analytics/by-hour
Analyze performance by hour of day (placeholder).

### GET /analytics/by-tag
Analyze performance by tag (placeholder).

### GET /analytics/equity-curve
Generate equity curve data (placeholder).

### GET /analytics/symbols
Get symbol-level statistics (placeholder).

## Security Features

- JWT authentication on all endpoints
- User-scoped data access (RLS)
- Input validation
- Rate limiting
- Structured logging

## Technology Stack

- Fastify
- Supabase client
- Zod validation
- Pino logging
