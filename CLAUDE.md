# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run lint          # Run ESLint

# Database (Prisma + PostgreSQL)
npm run db:generate   # Generate Prisma client after schema changes
npm run db:migrate    # Run pending migrations
npm run db:push       # Push schema without migrations (dev only)
npm run db:seed       # Seed initial data
npm run db:studio     # Open Prisma Studio GUI
npm run db:reset      # Reset DB and re-seed
```

There are no automated tests configured in this project.

## Architecture

**EDESA VENTAS** is a Next.js 15 (App Router) e-commerce platform for construction/sanitaryware products in Ecuador, using TypeScript, Tailwind CSS v4, and shadcn/ui.

### App Structure

Two route groups with separate layouts:
- `src/app/(main)/` — Public storefront (Header + Footer). Includes home, products, categories, cart, 4-step checkout, search, contact, about.
- `src/app/admin/` — Protected dashboard. Requires auth via `src/app/admin/layout.tsx` which checks session before rendering. Includes product CRUD, categories, brands, purchase orders, and analytics dashboard.

### Data Layer (Hybrid: JSON files + Prisma)

**Current state:** The app runs entirely from JSON files — no database required.

- `src/lib/data-store.ts` — All data reads/writes go through this file. It wraps `src/data/*.json` with typed getters/setters for products, categories, and brands.
- `src/data/products.json`, `categories.json`, `brands.json` — The actual data store.

**Future state:** PostgreSQL via Prisma is fully configured but not yet active. `src/lib/prisma.ts` exports a singleton Prisma client. The schema (`prisma/schema.prisma`) covers Products, Categories, Brands, Customers, Orders, Carts, Suppliers, and PurchaseOrders.

To migrate from JSON to Prisma: set `DATABASE_URL`, run `db:migrate`, `db:seed`, then swap `data-store` imports for Prisma client calls.

### Authentication

JWT-based auth using the `jose` library with HTTP-only cookies. All logic is in `src/lib/auth.ts`:
- `encrypt`/`decrypt` — JWT token handling (HS256, 7-day expiry)
- `createSession` / `deleteSession` / `getSession` — Cookie management
- `requireAuth(request)` — Middleware used in all `/api/admin/*` routes; returns 401 if unauthenticated
- `verifyCredentials(email, password)` — Checks against users in `products.json` (or Prisma when active)

Default admin: `admin@edesaventas.ec` / `Admin123!`

### API Routes

All under `src/app/api/`:
- `auth/login`, `auth/logout`, `auth/session` — Session management
- `admin/products/route.ts` — GET (list) and POST (create), auth-required
- `admin/products/[id]/route.ts` — GET, PUT, DELETE by ID, auth-required
- `admin/upload/route.ts` — Multipart file upload; saves images to `public/images/products/` and PDFs to `public/documents/`

### State Management

Cart state lives in `src/context/CartContext.tsx` (React Context + localStorage). Checkout flow state is in `src/context/CheckoutContext.tsx`. Both are provided at the `(main)` layout level.

### Key Conventions

- **Path alias:** `@/*` maps to `src/*`
- **Currency:** USD (Ecuador), formatted via `src/lib/format.ts` (`formatCurrency`, `formatPrice`)
- **Language:** All UI text and error messages are in Spanish
- **Forms:** React Hook Form + Zod validation (see `src/lib/validators.ts`)
- **Components:** `src/components/ui/` — shadcn/ui primitives; `src/components/admin/` — admin-specific; `src/components/home/`, `products/`, `cart/`, `checkout/` — feature components
- **Types:** Centralized in `src/types/` (`product.ts`, `cart.ts`, `order.ts`, `sales.ts`)
- **Images:** Product images referenced by relative paths stored in JSON; the `public/` directory is the root
