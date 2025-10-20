# Microservices Architecture

This document describes the microservices architecture for JournalEdge.io, refactored from the monolithic API.

## Architecture Overview

The monolithic Fastify API has been decomposed into 5 independent, deployable microservices following the Single Responsibility Principle. Each service:

- Has its own codebase and dependencies
- Runs on a dedicated port
- Manages a specific domain
- Accesses Supabase directly (no service-to-service calls)
- Implements the same security standards
- Is independently deployable

## Services

### 1. Auth Service (Port 3001)

**Location:** `/Users/trevorthompson/journal-edge/apps/auth-service`

**Responsibility:** User authentication and session management

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Authenticate and get tokens
- `POST /auth/logout` - Invalidate session
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info
- `GET /health` - Health check

**Key Features:**
- Supabase Auth integration
- JWT token management (access + refresh tokens)
- Password validation (8+ chars, uppercase, lowercase, number)
- User enumeration prevention
- Session management

**Dependencies:**
- Fastify, @fastify/cors, @fastify/helmet, @fastify/rate-limit
- Supabase client
- Zod validation
- Pino logging

---

### 2. Trade Service (Port 3002)

**Location:** `/Users/trevorthompson/journal-edge/apps/trade-service`

**Responsibility:** Trade data management and CSV imports

**Endpoints:**
- `GET /trades` - List trades (with filtering/pagination)
- `GET /trades/:id` - Get specific trade
- `POST /trades` - Create new trade
- `PUT /trades/:id` - Update trade
- `DELETE /trades/:id` - Delete trade
- `POST /trades/import` - Import trades from CSV (placeholder)
- `GET /health` - Health check

**Key Features:**
- Trade CRUD operations
- CSV file upload handling (10MB max)
- Tradovate format support (planned)
- Advanced filtering (symbol, date range, side)
- Pagination support
- User-scoped data access (RLS)

**Dependencies:**
- Fastify, @fastify/multipart (file uploads)
- csv-parse library
- Supabase client
- Zod validation

---

### 3. Analytics Service (Port 3003)

**Location:** `/Users/trevorthompson/journal-edge/apps/analytics-service`

**Responsibility:** Trading analytics and metrics calculations

**Endpoints:**
- `GET /analytics/metrics` - Overall performance metrics
- `GET /analytics/by-day-of-week` - Performance by day (placeholder)
- `GET /analytics/by-hour` - Performance by hour (placeholder)
- `GET /analytics/by-tag` - Tag-based analytics (placeholder)
- `GET /analytics/equity-curve` - Equity curve data (placeholder)
- `GET /analytics/symbols` - Symbol statistics (placeholder)
- `GET /health` - Health check

**Key Features:**
- Win rate calculation
- Profit factor, expectancy metrics
- Time-based analysis
- Tag-based performance
- Equity curve generation
- Symbol-level statistics

**Current Implementation:**
- `/metrics` endpoint is functional with basic calculations
- Other endpoints return placeholder responses

---

### 4. Calendar Service (Port 3004)

**Location:** `/Users/trevorthompson/journal-edge/apps/calendar-service`

**Responsibility:** Calendar view and date-based aggregations

**Endpoints:**
- `GET /calendar?year=YYYY&month=MM` - Monthly calendar with daily summaries
- `GET /calendar/:date` - Trades for specific date
- `GET /health` - Health check

**Key Features:**
- Monthly calendar view with daily PnL aggregations
- Daily trade details
- Date range queries
- Trade count and PnL summaries by date
- User-scoped data access

**Data Format:**
```json
{
  "year": "2024",
  "month": "10",
  "calendar": [
    {
      "date": "2024-10-15",
      "trades": [...],
      "total_pnl": 250.00,
      "trade_count": 3
    }
  ]
}
```

---

### 5. Tag Service (Port 3005)

**Location:** `/Users/trevorthompson/journal-edge/apps/tag-service`

**Responsibility:** Tag management

**Endpoints:**
- `GET /tags` - List all tags
- `GET /tags/:id` - Get specific tag
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag
- `GET /health` - Health check

**Key Features:**
- Tag CRUD operations
- Color management (hex color validation)
- Description support
- User-scoped tags
- Trade-tag associations (future)

**Validation:**
- Name: 1-50 characters
- Color: Valid hex color (#RRGGBB)
- Description: Max 200 characters

---

## Shared Architecture

### Security Features (All Services)

1. **Authentication**
   - JWT token verification on protected routes
   - Supabase Auth integration
   - User-scoped data access via RLS

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP (default)
   - Configurable via environment variables
   - Prevents brute force and DoS attacks

3. **CORS**
   - Strict origin validation
   - Configured per environment
   - Credentials support enabled

4. **Security Headers**
   - Helmet.js integration
   - Content Security Policy
   - XSS protection
   - MIME type sniffing prevention

5. **Input Validation**
   - Zod schemas for all endpoints
   - Type safety
   - SQL injection prevention (parameterized queries)

6. **Logging**
   - Pino structured logging
   - Sensitive data redaction (passwords, tokens)
   - Request/response logging
   - Error logging

### Common Structure

Each service follows this structure:

```
apps/[service-name]/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment validation
│   │   ├── logger.ts           # Pino logger config
│   │   └── supabase.ts         # Supabase clients
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/
│   │   └── [domain].routes.ts # Route handlers
│   ├── services/               # Business logic (future)
│   ├── utils/
│   │   └── validation.ts       # Zod schemas
│   ├── app.ts                  # Fastify app setup
│   └── index.ts                # Entry point
├── .env.example                # Environment template
├── .gitignore
├── .eslintrc.json
├── package.json
├── tsconfig.json
└── README.md
```

### Environment Variables

Each service requires:

```env
NODE_ENV=development|production|test
PORT=[service-port]
HOST=0.0.0.0

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

JWT_SECRET=xxx (min 32 chars)

CORS_ORIGIN=http://localhost:3000 (comma-separated)

RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=900000

LOG_LEVEL=info
```

Additional variables for specific services:
- **Trade Service:** `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`

## Service Communication

### Current Architecture
- **No inter-service communication** - Each service accesses Supabase directly
- **User authentication** - Services verify JWT tokens independently
- **Data access** - Enforced through Supabase Row Level Security (RLS)

### Benefits
- Simple deployment
- No service dependencies
- Reduced latency
- Independent scaling

### Future Considerations
- **API Gateway** - Single entry point for frontend
- **Service mesh** - For advanced routing and observability
- **Event-driven architecture** - For async operations
- **Shared cache layer** - For performance optimization

## Deployment Strategy

### Development
```bash
# Install dependencies for all services
pnpm install

# Run individual service
cd apps/[service-name]
pnpm dev

# Run multiple services (use process manager or separate terminals)
```

### Production
Each service can be deployed independently to:
- Docker containers
- Kubernetes pods
- Serverless functions (AWS Lambda, Vercel, etc.)
- Traditional VMs

### Health Checks
All services expose `/health` endpoint:
```json
{
  "status": "ok",
  "service": "service-name",
  "timestamp": "2024-10-20T...",
  "environment": "production"
}
```

## Database Access

### Supabase RLS Policies
Each service uses Supabase with Row Level Security:

1. **Service Role Key** - Bypasses RLS, used only for:
   - Auth operations (auth-service)
   - Admin queries
   - Server-side validation

2. **User Client** - Respects RLS, used for:
   - User-scoped data access
   - CRUD operations
   - Data queries

### Security Benefits
- Data isolation per user
- No cross-user data leakage
- Centralized access control
- Audit trail in database

## Migration from Monolith

### Original Structure
```
apps/api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── trades.ts
│   │   ├── analytics.ts
│   │   ├── calendar.ts
│   │   └── tags.ts
│   └── ...
```

### New Structure
```
apps/
├── auth-service/        (Port 3001)
├── trade-service/       (Port 3002)
├── analytics-service/   (Port 3003)
├── calendar-service/    (Port 3004)
└── tag-service/         (Port 3005)
```

### Benefits of Refactoring

1. **Single Responsibility** - Each service has one clear purpose
2. **Independent Deployment** - Deploy services separately
3. **Team Autonomy** - Different teams can own different services
4. **Technology Flexibility** - Use different tech stacks per service (future)
5. **Scalability** - Scale services independently based on load
6. **Fault Isolation** - Failure in one service doesn't affect others
7. **Easier Testing** - Test services in isolation
8. **Smaller Codebases** - Easier to understand and maintain

## Next Steps

### Immediate
1. Install dependencies: `pnpm install` from workspace root
2. Copy `.env.example` to `.env` in each service
3. Configure environment variables
4. Test each service independently

### Short-term
1. Implement CSV import logic in trade-service
2. Complete analytics calculations in analytics-service
3. Add trade-tag association endpoints
4. Implement comprehensive testing
5. Add API documentation (OpenAPI/Swagger)

### Long-term
1. Implement API Gateway
2. Add service-to-service authentication
3. Implement caching layer (Redis)
4. Add monitoring and observability (Prometheus, Grafana)
5. Containerize services (Docker)
6. Set up CI/CD pipelines
7. Implement event-driven architecture for async operations

## Workspace Dependencies

All services depend on shared workspace packages:
- `@journal-edge/types` - Shared TypeScript types
- `@journal-edge/utils` - Shared utility functions
- `@journal-edge/db` - Supabase client configuration

## Security Checklist

- [x] JWT authentication on all protected routes
- [x] Rate limiting configured
- [x] CORS with strict origin validation
- [x] Security headers (Helmet)
- [x] Input validation (Zod)
- [x] Sensitive data redaction in logs
- [x] Environment variable validation
- [x] Row Level Security (RLS)
- [x] Parameterized queries
- [x] Error message sanitization
- [ ] HTTPS enforcement (production)
- [ ] API request/response encryption
- [ ] Audit logging
- [ ] Penetration testing

## Monitoring & Observability

### Logging
- Structured JSON logs (Pino)
- Log levels: fatal, error, warn, info, debug, trace
- Sensitive data automatically redacted
- Request IDs for tracing

### Metrics (Future)
- Request count per endpoint
- Response times
- Error rates
- Database query performance
- Cache hit rates

### Alerting (Future)
- High error rates
- Slow response times
- Service downtime
- Rate limit violations

## Documentation

Each service has its own README.md with:
- Service responsibility
- API endpoints
- Request/response examples
- Security features
- Development instructions
- Environment variables

## Support

For questions or issues:
1. Check service-specific README
2. Review this architecture document
3. Check logs for errors
4. Consult Supabase documentation
5. Review Fastify documentation
