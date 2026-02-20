# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run lint          # Run ESLint

# Database (Prisma + PostgreSQL via Supabase)
npm run db:generate   # Generate Prisma client after schema changes
npm run db:migrate    # Run pending migrations
npm run db:push       # Push schema without migrations (dev only)
npm run db:seed       # Seed initial data from prisma/seed-data.json
npm run db:studio     # Open Prisma Studio GUI
npm run db:reset      # Reset DB and re-seed
```

No automated tests are configured.

## Architecture

**EDESA VENTAS** is a B2B e-commerce platform for construction/sanitaryware products in Ecuador. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, and Prisma + PostgreSQL (Supabase).

### App Structure

Two route groups:
- `src/app/(main)/` — Public storefront. Server components fetch data directly from Prisma. Session + categories are fetched in the layout via `Promise.all()` and passed down as props.
- `src/app/admin/` — Protected dashboard. Auth checked in `src/app/admin/layout.tsx`. Includes product CRUD, categories, brands, purchase orders, users, and order management.

### Data Layer

**Primary:** Prisma + PostgreSQL. All product/category/brand queries use `src/lib/prisma.ts` (singleton client) directly in Server Components and API routes.

**Secondary (orders only):** `src/lib/data-store.ts` handles orders via `src/data/orders.json`. Orders are not yet in the Prisma DB; they're stored in this JSON file.

**Legacy:** `src/data/products.json`, `categories.json`, `brands.json` still exist but are no longer the source of truth. Ignore them.

### Authentication & B2B Model

JWT auth via `jose` (HTTP-only cookies, 7-day expiry). All logic in `src/lib/auth.ts`.

Key functions:
- `requireAdmin(request)` — used in all `/api/admin/*` routes; returns 401/403 if not admin
- `requireAuth(request)` — returns auth status; used in non-admin protected routes
- `verifyCredentials(email, password)` — checks Prisma `User` table + `bcrypt`; blocks if `isBlocked === true`

**B2B pattern:**
- `SessionPayload` includes `clientType: 'admin' | 'ferreteria' | 'minorista'` and `clienteAprobado: boolean`
- `src/context/AuthContext.tsx` — client context; `AuthProvider` receives `session` from server layout, exposes `useAuth()` hook with `{ isAuthenticated, clientType, canSeePrices, clienteAprobado }`
- Prices are hidden behind `src/components/products/PriceGate.tsx` — only shown to authenticated users
- `AddToCartButton` shows a login CTA (with `?redirect=` param) for unauthenticated users

### API Routes

All under `src/app/api/`:
- `auth/login`, `auth/logout`, `auth/session`, `auth/register` — session management
- `admin/products/` + `admin/products/[id]/` — product CRUD (Prisma), admin-only
- `admin/upload/` — multipart upload; images → `public/images/products/`, PDFs → `public/documents/`
- `admin/usuarios/` + `admin/usuarios/[id]/` — user management, admin-only
- `orders/` + `orders/[id]/` — order creation (POST, public) and management (PUT, admin-only); writes to `orders.json`

### State Management

- `CartContext` (`src/context/CartContext.tsx`) — React Context + localStorage
- `CheckoutContext` (`src/context/CheckoutContext.tsx`) — 4-step checkout flow + `paymentMethod`
- Both provided at `(main)` layout level

### Key Conventions

- **Path alias:** `@/*` → `src/*`
- **Currency:** USD; use `formatCurrency` / `formatPrice` from `src/lib/format.ts`
- **Language:** All UI text and errors in Spanish
- **Forms:** React Hook Form + Zod (validators in `src/lib/validators.ts`)
- **Styling:** Tailwind v4 with `@theme inline` in globals.css. No `tailwind.config.js`. Primary color: `oklch(0.55 0.22 25)` (red). Font: Geist Sans.
- **Types:** `src/types/product.ts`, `cart.ts`, `order.ts`, `sales.ts`
- **Prisma → component type mismatch:** use `as any` when passing Prisma results to components expecting the local `Product` type
- **Parallel queries:** always use `Promise.all()` for multiple independent DB fetches in the same page/layout
- **Admin auth pattern:** `const r = await requireAdmin(req); if (!r.authorized) return r.response;`
- **Images:** stored in `public/images/products/`; paths in DB are relative to `public/`
