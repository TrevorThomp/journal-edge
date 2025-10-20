# Environment Variables Setup - JournalEdge.io

All environment variables have been configured with your Supabase credentials.

## ✅ Files Created

### Backend Services
- `apps/auth-service/.env` (Port 3001)
- `apps/data-service/.env` (Port 3002)
- `apps/analytics-service/.env` (Port 3003)

### Frontend
- `apps/user-portal/.env.local` (Port 3000)

---

## 🔑 Supabase Credentials Used

```
Project: juadlzqqdyimiwqqjlpc
URL: https://juadlzqqdyimiwqqjlpc.supabase.co
```

**Keys configured:**
- ✅ SUPABASE_ANON_KEY (public, safe for frontend)
- ✅ SUPABASE_SERVICE_KEY (private, backend only)

---

## 🚨 IMPORTANT: Auth Service JWT Secret

The auth-service `.env` file contains a placeholder JWT secret:

```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this-in-production
```

**🔐 You MUST generate a secure JWT secret!**

### Generate a secure secret:

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

Then update `apps/auth-service/.env`:
```bash
JWT_SECRET=<your-generated-secret-here>
```

---

## 📝 Service Configuration Summary

### Auth Service (Port 3001)
```bash
PORT=3001
SUPABASE_URL=https://juadlzqqdyimiwqqjlpc.supabase.co
JWT_SECRET=<CHANGE THIS!>
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003
```

### Data Service (Port 3002)
```bash
PORT=3002
SUPABASE_URL=https://juadlzqqdyimiwqqjlpc.supabase.co
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Analytics Service (Port 3003)
```bash
PORT=3003
SUPABASE_URL=https://juadlzqqdyimiwqqjlpc.supabase.co
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### User Portal (Port 3000)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://juadlzqqdyimiwqqjlpc.supabase.co
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
NEXT_PUBLIC_DATA_API_URL=http://localhost:3002
NEXT_PUBLIC_ANALYTICS_API_URL=http://localhost:3003
```

---

## ✅ Next Steps

### 1. Generate JWT Secret
```bash
openssl rand -base64 32
# Copy output and update apps/auth-service/.env
```

### 2. Run Database Migrations
```bash
# Option A: Supabase CLI
supabase link --project-ref juadlzqqdyimiwqqjlpc
supabase db push

# Option B: Supabase Dashboard
# Go to SQL Editor and run each migration file:
# - supabase/migrations/20241020000000_initial_schema.sql
# - supabase/migrations/20241020000001_row_level_security.sql
```

### 3. Generate TypeScript Types
```bash
supabase gen types typescript --project-id juadlzqqdyimiwqqjlpc > packages/db/types/database.types.ts
```

### 4. Start Services
```bash
# Terminal 1: Data Service
cd apps/data-service
pnpm install
pnpm dev

# Terminal 2: Auth Service
cd apps/auth-service
pnpm dev

# Terminal 3: Analytics Service
cd apps/analytics-service
pnpm dev

# Terminal 4: Frontend
cd apps/user-portal
pnpm dev
```

---

## 🔒 Security Notes

**⚠️ NEVER commit these files to Git!**

Verify `.gitignore` includes:
```
.env
.env.*
.env.local
!.env.example
```

**Service Role Key Security:**
- ✅ Used in backend services only
- ❌ NEVER expose in frontend
- ❌ NEVER commit to version control
- ❌ NEVER log or expose in error messages

**Frontend Keys:**
- ✅ ANON_KEY is safe for frontend (public)
- ✅ All frontend env vars prefixed with `NEXT_PUBLIC_`

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Check if .env file exists
ls -la apps/*/.*env*

# Verify environment variables loaded
cd apps/data-service
pnpm dev
# Should see: "🚀 Data Service started on 0.0.0.0:3002"
```

### CORS errors
Update `CORS_ORIGIN` in each service's `.env` to include all origins that need access.

### Database connection errors
1. Verify `SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_KEY` is the service role key (not anon key)
3. Ensure migrations have been run

### Frontend can't connect to backend
1. Check all services are running
2. Verify `NEXT_PUBLIC_*_API_URL` variables point to correct ports
3. Check browser console for CORS errors

---

## 📊 Port Assignment

| Service | Port | Purpose |
|---------|------|---------|
| User Portal | 3000 | Next.js frontend |
| Auth Service | 3001 | Authentication & sessions |
| Data Service | 3002 | Trades, tags, calendar |
| Analytics Service | 3003 | Trading statistics |

All services communicate via HTTP on localhost in development.

---

## 🎉 You're Ready!

All environment variables are configured. Next steps:
1. ✅ Generate JWT secret
2. ✅ Run database migrations
3. ✅ Generate TypeScript types
4. ✅ Start all services
5. ✅ Test the application

See `REFACTORING_SUMMARY.md` for complete migration guide.
