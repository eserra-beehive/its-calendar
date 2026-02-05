# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITS Calendar is a Next.js 16 application for managing school lesson schedules, teachers, modules, and classes. Italian-localized UI with calendar synchronization capabilities.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start development server (Turbopack enabled)
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run db:generate  # Generate Prisma client
pnpm run db:push      # Push schema to database
pnpm run db:migrate   # Run Prisma migrations
pnpm run db:seed      # Seed admin user
```

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Server Components, Server Actions)
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Auth:** Auth.js v5 (next-auth@beta) with Credentials provider, JWT strategy
- **UI:** shadcn/ui (New York style), Tailwind CSS 4, Radix UI
- **Forms:** react-hook-form + Zod validation
- **Calendar:** react-big-calendar
- **Email:** Resend

## Architecture

### Data Flow Pattern

```
Page (Server Component) → fetches data with Prisma
    ↓
Client Component → receives data as props, handles interactions
    ↓
Server Actions → mutations with Zod validation, returns ActionResult<T>
    ↓
revalidatePath() → triggers re-render
```

### Authentication Flow

```
proxy.ts (Next.js 16) → checks JWT session cookie
    ↓
Unauthenticated → redirect to /login
    ↓
/login → authenticate() server action → signIn("credentials")
    ↓
Auth.js → JWT cookie set → redirect to /
```

Public routes (no auth required): `/login`, `/api/auth/*`, `/api/calendar/ical/*`

### Key Directories

- `/src/lib/actions/` - Server Actions grouped by entity (teachers, modules, classes, lessons, auth)
- `/src/lib/auth.ts` - Auth.js v5 configuration (NextAuth, PrismaAdapter, Credentials)
- `/src/lib/validations/` - Zod schemas for all entities
- `/src/types/` - TypeScript type definitions (import types from here)
- `/src/components/ui/` - shadcn/ui components
- `/src/components/dashboard/` - Custom dashboard components
- `/src/proxy.ts` - Route protection (Next.js 16 proxy, replaces middleware.ts)
- `/prisma/schema.prisma` - Database models (PostgreSQL)
- `/prisma/seed.ts` - Admin user seed script

### Server Actions Pattern

All mutations return `ActionResult<T>`:
```typescript
export async function createEntity(data: EntityInput): Promise<ActionResult<Entity>> {
  const parsed = entitySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "..." };
  // Prisma operation + revalidatePath
}
```

### Types from Prisma

```typescript
// Use Prisma payload types for relations
export type TeacherWithModules = Prisma.TeacherGetPayload<{
  include: { modules: true };
}>;
```

## Code Style Guidelines

- **Simplicity first:** Avoid over-engineering. Only add what's directly needed.
- **Strong typing:** Use TypeScript strictly. Define reusable interfaces when patterns emerge.
- **Minimal comments:** Code should be self-explanatory. Comment only non-obvious logic.
- **Best practices:** Research current best practices before implementing patterns.
- **Italian UI:** All user-facing text in Italian.

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `AUTH_SECRET` - Auth.js secret for JWT encryption (required, generate with `npx auth secret`)
- `ADMIN_EMAIL` - Admin email for seed script
- `ADMIN_PASSWORD` - Admin password for seed script
- `RESEND_API_KEY` - Email service (optional)
- `NEXT_PUBLIC_APP_URL` - Public URL (default: http://localhost:3000)

## Database

Prisma with PostgreSQL (Neon). Models: User, Account, Session, VerificationToken (Auth.js) + Teacher, Module, Class, Lesson (App).

```bash
pnpm run db:generate  # Generate client after schema changes
pnpm run db:push      # Push schema to database (dev)
pnpm run db:migrate   # Run migrations (prod)
pnpm run db:seed      # Create admin user
```

Prisma client output: `/src/generated/prisma`

## Path Aliases

`@/*` maps to `/src/*`
