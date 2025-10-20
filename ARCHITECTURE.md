# JournalEdge.io - Microservices Architecture

**Version:** 2.0.0
**Last Updated:** October 20, 2025
**Status:** Production-Ready Microservices Architecture

---

## Overview

JournalEdge.io is built as a **microservices-based** Turborepo monorepo, featuring independent, scalable services that follow the Single Responsibility Principle. The architecture enables independent deployment, horizontal scaling, and fault isolation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    User Portal (Next.js 14+)                        │
│                        Port 3000                                    │
│                                                                     │
│  - React 18 with App Router                                        │
│  - Redux Toolkit State Management                                  │
│  - Tailwind CSS Styling                                            │
│  - Supabase Auth Integration                                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ REST API Calls
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Auth Service    │  │  Trade Service   │  │Analytics Service │
│  Port 3001       │  │  Port 3002       │  │  Port 3003       │
│                  │  │                  │  │                  │
│ - Registration   │  │ - Trade CRUD     │  │ - Metrics        │
│ - Login/Logout   │  │ - CSV Import     │  │ - Statistics     │
│ - JWT Tokens     │  │ - Filtering      │  │ - Calculations   │
│ - Session Mgmt   │  │ - Pagination     │  │ - Aggregations   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         │                     │                      │
┌────────┴─────────┐  ┌────────┴─────────┐  ┌────────┴─────────┐
│Calendar Service  │  │  Tag Service     │  │                  │
│  Port 3004       │  │  Port 3005       │  │                  │
│                  │  │                  │  │                  │
│ - Monthly View   │  │ - Tag CRUD       │  │                  │
│ - Daily Summary  │  │ - Trade Tags     │  │                  │
│ - Date Filter    │  │ - Tag Analytics  │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    │ Direct Database Access (RLS)
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                           │
│                                                                     │
│  Tables:                                                            │
│  - users (with RLS)                                                 │
│  - trades (with RLS)                                                │
│  - tags (with RLS)                                                  │
│  - trade_tags (with RLS)                                            │
│  - imports (with RLS)                                               │
│                                                                     │
│  Features:                                                          │
│  - Row Level Security                                               │
│  - Authentication                                                   │
│  - Storage (CSV files)                                              │
│  - Real-time (future)                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Applications

### 1. User Portal (`apps/user-portal`)
**Technology:** Next.js 14+ with App Router
**Port:** 3000
**Purpose:** User-facing web application

**Features:**
- Authentication pages (login, register)
- Dashboard with performance overview
- Trading calendar view
- Trade management interface
- Analytics dashboard
- Settings and preferences

**Key Technologies:**
- React 18.3.1
- Redux Toolkit 2.2.7
- Tailwind CSS 3.4.13
- Lightweight Charts 4.2.0

---

### 2. Auth Service (`apps/auth-service`)
**Technology:** Fastify 4+
**Port:** 3001
**Purpose:** User authentication and session management

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

**Responsibilities:**
- Supabase Auth integration
- JWT token issuance and validation
- Password strength validation
- Session management

---

### 3. Trade Service (`apps/trade-service`)
**Technology:** Fastify 4+
**Port:** 3002
**Purpose:** Trade data management and imports

**Endpoints:**
- `GET /trades` - List trades (with filters)
- `GET /trades/:id` - Get single trade
- `POST /trades` - Create trade
- `PUT /trades/:id` - Update trade
- `DELETE /trades/:id` - Delete trade
- `POST /trades/import` - Import from CSV

**Responsibilities:**
- Trade CRUD operations
- CSV parsing (Tradovate format)
- Trade validation
- File upload handling
- Advanced filtering

---

### 4. Analytics Service (`apps/analytics-service`)
**Technology:** Fastify 4+
**Port:** 3003
**Purpose:** Trading analytics and metrics

**Endpoints:**
- `GET /analytics/metrics` - Overall metrics
- `GET /analytics/by-day-of-week` - Day analysis
- `GET /analytics/by-hour` - Hour analysis
- `GET /analytics/by-tag` - Tag performance
- `GET /analytics/equity-curve` - Equity curve
- `GET /analytics/symbols` - Symbol stats

**Responsibilities:**
- Performance calculations
- Win rate, profit factor, expectancy
- Time-based analysis
- Tag-based analytics
- Statistical aggregations

---

### 5. Calendar Service (`apps/calendar-service`)
**Technology:** Fastify 4+
**Port:** 3004
**Purpose:** Calendar view and date aggregations

**Endpoints:**
- `GET /calendar?year=YYYY&month=MM` - Monthly calendar
- `GET /calendar/:date` - Daily trades

**Responsibilities:**
- Monthly calendar generation
- Daily P/L summaries
- Trade count aggregations
- Date-based filtering

---

### 6. Tag Service (`apps/tag-service`)
**Technology:** Fastify 4+
**Port:** 3005
**Purpose:** Tag management

**Endpoints:**
- `GET /tags` - List all tags
- `GET /tags/:id` - Get single tag
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

**Responsibilities:**
- Tag CRUD operations
- Trade-tag associations
- Tag validation
- Color management

---

## Shared Packages

### @journal-edge/types
**Purpose:** Shared TypeScript type definitions

**Contents:**
- Trade, Tag, User, Import interfaces
- Analytics types (metrics, stats)
- API request/response types
- Database types

### @journal-edge/utils
**Purpose:** Shared utility functions

**Contents:**
- Trading calculations (win rate, profit factor)
- Date formatting and manipulation
- Currency and percentage formatting
- Input validation

### @journal-edge/config
**Purpose:** Shared configuration files

**Contents:**
- ESLint configuration
- Tailwind CSS configuration
- TypeScript base configuration

### @journal-edge/db
**Purpose:** Database client and schema

**Contents:**
- Supabase client factory
- Database type definitions
- SQL migration scripts

---

## Security Architecture

### Authentication Flow

```
1. User Login → Auth Service
   ↓
2. Validate Credentials (Supabase Auth)
   ↓
3. Issue JWT Tokens (Access + Refresh)
   ↓
4. Return Tokens to Client
   ↓
5. Client Stores Tokens (httpOnly cookies)
   ↓
6. Subsequent Requests → All Services
   ↓
7. Services Verify JWT (Auth Middleware)
   ↓
8. Extract User ID from Token
   ↓
9. Access Database with RLS (user_id = auth.uid())
```

### Security Layers

**Layer 1: Network Security**
- CORS with strict origin validation
- HTTPS in production
- Rate limiting per IP
- Request size limits

**Layer 2: Authentication**
- JWT token verification
- Supabase Auth integration
- Secure httpOnly cookies
- Token expiration and refresh

**Layer 3: Authorization**
- Row Level Security (RLS)
- User-scoped data access
- Service role key protection

**Layer 4: Input Validation**
- Zod schema validation
- Type-safe requests
- SQL injection prevention
- XSS protection

**Layer 5: Logging & Monitoring**
- Structured logging with Pino
- Sensitive data redaction
- Error tracking
- Audit trails

---

## Data Flow Examples

### Example 1: Create Trade

```
1. User submits trade form in User Portal
   ↓
2. Frontend validates input (React Hook Form + Zod)
   ↓
3. API call to Trade Service (POST /trades)
   ↓
4. Trade Service verifies JWT token
   ↓
5. Trade Service validates request body (Zod)
   ↓
6. Trade Service inserts trade into Supabase
   ↓
7. Supabase RLS ensures user_id = auth.uid()
   ↓
8. Trade Service returns created trade
   ↓
9. Frontend updates Redux store
   ↓
10. UI shows success notification
```

### Example 2: View Analytics

```
1. User navigates to Analytics page
   ↓
2. Frontend requests analytics from Analytics Service
   ↓
3. Analytics Service verifies JWT token
   ↓
4. Analytics Service queries Supabase (with RLS)
   ↓
5. Analytics Service calculates metrics
   ↓
6. Analytics Service returns aggregated data
   ↓
7. Frontend renders charts (Lightweight Charts)
   ↓
8. User views interactive visualizations
```

---

## Deployment Architecture

### Development

```
Local Machine:
├── User Portal (localhost:3000)
├── Auth Service (localhost:3001)
├── Trade Service (localhost:3002)
├── Analytics Service (localhost:3003)
├── Calendar Service (localhost:3004)
└── Tag Service (localhost:3005)
```

### Production (Recommended)

```
Cloud Infrastructure:
├── CDN (Vercel/Cloudflare)
│   └── User Portal (Static Site)
│
├── Container Orchestration (Kubernetes/ECS)
│   ├── Auth Service (2+ instances)
│   ├── Trade Service (2+ instances)
│   ├── Analytics Service (2+ instances)
│   ├── Calendar Service (2+ instances)
│   └── Tag Service (2+ instances)
│
├── API Gateway (Optional)
│   └── Single entry point for all services
│
├── Load Balancer
│   └── Distributes traffic to service instances
│
└── Supabase (Managed PostgreSQL)
    └── Database with RLS
```

---

## Scalability Considerations

### Horizontal Scaling
- Each service can scale independently
- Stateless design enables load balancing
- No inter-service dependencies

### Vertical Scaling
- Increase resources per service instance
- Optimize database queries
- Add caching layer (Redis)

### Caching Strategy
- API response caching
- Database query caching
- Static asset CDN

### Performance Targets
- API response time: < 500ms (p95)
- Page load time: < 2 seconds
- Database query time: < 100ms
- Chart rendering: < 1 second

---

## Monitoring & Observability

### Logging
- Structured JSON logs (Pino)
- Log levels: error, warn, info, debug
- Centralized log aggregation (future)

### Metrics
- Request count and latency
- Error rates
- Database query performance
- Memory and CPU usage

### Health Checks
- Each service: `GET /health`
- Database connectivity
- Dependency checks

### Alerting (Future)
- High error rates
- Service downtime
- Performance degradation
- Security events

---

## Development Workflow

### Starting All Services

```bash
# Terminal 1: User Portal
cd apps/user-portal && pnpm dev

# Terminal 2: Auth Service
cd apps/auth-service && pnpm dev

# Terminal 3: Trade Service
cd apps/trade-service && pnpm dev

# Terminal 4: Analytics Service
cd apps/analytics-service && pnpm dev

# Terminal 5: Calendar Service
cd apps/calendar-service && pnpm dev

# Terminal 6: Tag Service
cd apps/tag-service && pnpm dev
```

### Building All Services

```bash
pnpm build
```

### Testing

```bash
# Lint all services
pnpm lint

# Type check all services
pnpm type-check

# Run tests (future)
pnpm test
```

---

## Benefits of Microservices Architecture

✅ **Independent Deployment** - Deploy services separately without downtime
✅ **Fault Isolation** - Service failures don't cascade
✅ **Technology Flexibility** - Use different tech for different services
✅ **Team Autonomy** - Teams can own specific services
✅ **Scalability** - Scale services based on demand
✅ **Maintainability** - Smaller, focused codebases
✅ **Testing** - Easier to test individual services
✅ **Security** - Security boundaries between services

---

## Future Enhancements

### Phase 2
- API Gateway for unified entry point
- Service mesh (Istio/Linkerd)
- Message queue (RabbitMQ/Kafka)
- Caching layer (Redis)
- Docker containerization
- CI/CD pipelines

### Phase 3
- Distributed tracing (Jaeger)
- Advanced monitoring (Prometheus + Grafana)
- Auto-scaling policies
- Blue-green deployments
- Canary releases

### Phase 4
- GraphQL federation
- gRPC inter-service communication
- Event-driven architecture
- CQRS pattern
- Saga pattern for distributed transactions

---

## Documentation

### Service Documentation
- `/apps/auth-service/README.md`
- `/apps/trade-service/README.md`
- `/apps/analytics-service/README.md`
- `/apps/calendar-service/README.md`
- `/apps/tag-service/README.md`
- `/apps/user-portal/README.md`

### Architecture Documentation
- `/ARCHITECTURE.md` (this file)
- `/MICROSERVICES_ARCHITECTURE.md`
- `/REFACTORING_SUMMARY.md`
- `/PROJECT_SUMMARY.md`

---

## Contact

For architecture questions or contributions, please refer to the documentation in each service's directory.

**Generated:** October 20, 2025
**Version:** 2.0.0
**Status:** Production-Ready Microservices
