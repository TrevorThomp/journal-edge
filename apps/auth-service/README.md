# Auth Service

Authentication and session management microservice for JournalEdge.io.

## Responsibility

This service handles all user authentication operations including:
- User registration
- User login/logout
- JWT token management
- Session validation
- User profile retrieval

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **Authentication:** Supabase Auth
- **Validation:** Zod
- **Logging:** Pino
- **Language:** TypeScript

## API Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600,
    "expires_at": 1234567890
  }
}
```

### POST /auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600,
    "expires_at": 1234567890
  }
}
```

### POST /auth/logout
Invalidate user session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "session": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 3600,
    "expires_at": 1234567890
  }
}
```

### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /health
Health check endpoint (no authentication required).

**Response (200):**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00Z",
  "environment": "development"
}
```

## Security Features

- **Password Requirements:** Minimum 8 characters with uppercase, lowercase, and number
- **JWT Validation:** All protected routes verify token signature and expiration
- **Rate Limiting:** Prevents brute force attacks (100 requests per 15 minutes per IP)
- **CORS:** Strict origin validation from environment configuration
- **Security Headers:** Helmet.js for various HTTP security headers
- **Input Validation:** Zod schemas validate all request data
- **Error Sanitization:** Generic error messages prevent information disclosure
- **Logging:** Sensitive data (passwords, tokens) automatically redacted

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

JWT_SECRET=your-strong-secret-minimum-32-chars
CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=900000

LOG_LEVEL=info
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Project Structure

```
apps/auth-service/
├── src/
│   ├── config/
│   │   ├── env.ts           # Environment variable validation
│   │   ├── logger.ts        # Pino logger configuration
│   │   └── supabase.ts      # Supabase client setup
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification middleware
│   │   └── errorHandler.ts # Global error handler
│   ├── routes/
│   │   └── auth.routes.ts   # Authentication route handlers
│   ├── utils/
│   │   └── validation.ts    # Zod validation schemas
│   ├── app.ts               # Fastify app configuration
│   └── index.ts             # Service entry point
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Security Considerations

1. **Never commit `.env` files** - Contains sensitive credentials
2. **Service role key** - Only use server-side, never expose to frontend
3. **JWT secrets** - Must be minimum 32 characters, randomly generated
4. **HTTPS in production** - Always use HTTPS, never HTTP
5. **Rate limiting** - Adjust limits based on expected traffic
6. **Token expiration** - Access tokens expire in 1 hour, use refresh tokens for extended sessions
7. **User enumeration prevention** - Login errors don't reveal if email exists
8. **Password storage** - Handled by Supabase Auth (bcrypt hashing)

## Integration with Other Services

Other microservices should:
1. Verify JWT tokens by calling Supabase Auth directly
2. Extract user ID from token claims
3. Not call auth-service for every request (validate tokens independently)
4. Use the same JWT secret and Supabase configuration

## Future Enhancements

- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Account lockout after failed attempts
- [ ] Session management (view/revoke sessions)
- [ ] Audit logging for security events
