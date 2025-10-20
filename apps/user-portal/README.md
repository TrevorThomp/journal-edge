# JournalEdge.io - User Portal

Next.js 14+ user portal application for JournalEdge.io trading journal platform.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Supabase
- **Forms**: React Hook Form + Zod
- **Charts**: Lightweight Charts React
- **Date Utilities**: date-fns

## Project Structure

```
apps/user-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── dashboard/
│   │   ├── calendar/
│   │   ├── trades/
│   │   ├── analytics/
│   │   └── settings/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utilities and helpers
│   ├── api/              # API client
│   └── utils/            # Utility functions
├── store/                 # Redux store
│   ├── slices/           # Redux slices
│   ├── hooks.ts          # Typed hooks
│   ├── index.ts          # Store configuration
│   └── StoreProvider.tsx # Redux provider
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Or from the monorepo root:

```bash
turbo dev --filter=@journal-edge/user-portal
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build

Build the application for production:

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_TRADINGVIEW_API_KEY`: TradingView API key

## Features

### Authentication

- Login and registration pages
- Session management with Supabase
- Protected routes

### Dashboard

- Performance overview
- Recent trades
- Key metrics
- Charts and visualizations

### Trading Calendar

- Calendar view of trades
- Daily performance tracking
- Trade filtering by date

### Trades Management

- Create, edit, and delete trades
- Filter and search trades
- Detailed trade information

### Analytics

- Advanced performance metrics
- Multiple chart views
- Statistical analysis

### Settings

- User profile management
- Account settings
- Notification preferences
- Trading preferences

## State Management

The application uses Redux Toolkit for state management with the following slices:

- `authSlice`: User authentication state
- `tradeSlice`: Trading data and filters
- `uiSlice`: UI state (sidebar, theme, notifications)

## API Client

The API client (`lib/api/client.ts`) provides a typed interface for communicating with the Fastify backend:

- Automatic token management
- Request/response interceptors
- Error handling
- TypeScript support

## Components

### UI Components

Reusable UI components in `components/ui/`:

- `Button`: Flexible button component with variants
- `Card`: Card layout components
- `Input`: Form input with label and validation
- `Badge`: Status badges

### Layout Components

Layout components in `components/layout/`:

- `Sidebar`: Navigation sidebar
- `Header`: Top header bar

## Styling

The application uses Tailwind CSS for styling with:

- Custom color scheme (primary, profit, loss, warning)
- Responsive breakpoints
- Custom animations
- Utility classes
- Dark mode support (planned)

## Type Safety

All components, API calls, and state management are fully typed with TypeScript. The application extends shared types from `@journal-edge/types`.

## Code Quality

- ESLint for code linting
- TypeScript strict mode
- Prettier for code formatting

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm type-check`: Run TypeScript type checking
- `pnpm clean`: Clean build artifacts

## Contributing

This is part of a Turborepo monorepo. See the root README for contribution guidelines.

## License

Proprietary - All rights reserved
