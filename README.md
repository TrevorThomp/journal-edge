# JournalEdge.io

Trading Journal and Analytics Platform - A comprehensive solution for traders to track, analyze, and improve their trading performance.

## Project Structure

This is a Turborepo monorepo containing:

### Apps
- `user-portal`: Next.js 14+ user portal (App Router, TypeScript, Tailwind CSS, Redux Toolkit)
- `auth-service`: Authentication microservice (Port 3001)
- `trade-service`: Trade management microservice (Port 3002)
- `analytics-service`: Analytics and metrics microservice (Port 3003)
- `calendar-service`: Calendar view microservice (Port 3004)
- `tag-service`: Tag management microservice (Port 3005)

### Packages
- `@journal-edge/types`: Shared TypeScript types and interfaces
- `@journal-edge/ui`: Shared UI components
- `@journal-edge/config`: Shared configuration files
- `@journal-edge/utils`: Shared utility functions
- `@journal-edge/db`: Database schema and Supabase client

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **State Management**: Redux Toolkit
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **Charts**: Lightweight Charts (primary), D3.js (advanced visualizations)
- **Form Management**: React Hook Form
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4+
- **Language**: TypeScript 5+
- **API Style**: REST
- **File Upload**: @fastify/multipart
- **Validation**: Zod

### Database & Auth
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for CSV uploads)
- **Real-time**: Supabase Realtime (future use)

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/user-portal/.env.example apps/user-portal/.env.local
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/trade-service/.env.example apps/trade-service/.env
cp apps/analytics-service/.env.example apps/analytics-service/.env
cp apps/calendar-service/.env.example apps/calendar-service/.env
cp apps/tag-service/.env.example apps/tag-service/.env

# Run development servers
pnpm dev
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format
```

## Features (MVP Phase 1)

1. **Authentication System**
   - Email/password authentication via Supabase Auth
   - JWT token-based session management
   - Password reset functionality

2. **Trade Import System**
   - CSV file upload (Tradovate format)
   - Trade data parsing and validation
   - Duplicate detection

3. **Calendar View**
   - Monthly calendar with trading day summaries
   - Visual indicators for profitable/losing days
   - Day-level metrics

4. **Trade Detail View**
   - Comprehensive trade information
   - TradingView chart integration with execution markers
   - Custom tag management

5. **Analytics Dashboard**
   - Core metrics (Win Rate, Profit Factor, P/L, etc.)
   - P/L by day of week
   - P/L by hour
   - Equity curve
   - Tag performance analysis

6. **Custom Tags System**
   - Create and manage trade tags
   - Tag-based filtering and analytics
   - Color-coded organization

## Environment Variables

### Frontend (apps/user-portal/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_TRADE_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_CALENDAR_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_TAG_SERVICE_URL=http://localhost:3005
NEXT_PUBLIC_TRADINGVIEW_API_KEY=
```

### Backend Services (.env for each)
```
PORT=[service-port]
NODE_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## License

Proprietary - All rights reserved

## Version
1.0.0 - Initial Release
# journal-edge
