# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server (localhost:3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint

# Database (Prisma + PostgreSQL via Supabase)
npm run db:generate   # Generate Prisma client after schema changes
npm run db:migrate    # Run pending migrations (creates migration files)
npm run db:push       # Push schema changes directly to DB (dev only, no migration files)
npm run db:seed       # Seed initial data: categories, brands, 1740 products from prisma/seed-data.json
npm run db:studio     # Open Prisma Studio GUI (visual DB browser on localhost:5555)
npm run db:reset      # DESTRUCTIVE: Drop DB, run migrations, and re-seed
```

**No automated tests are configured.** When making changes, verify functionality manually in dev environment.

## Architecture

**EDESA VENTAS** is a B2B e-commerce platform for construction/sanitaryware products in Ecuador. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, and Prisma + PostgreSQL (Supabase).

### App Structure

Two route groups:
- `src/app/(main)/` — Public storefront. Server components fetch data directly from Prisma. Session + categories are fetched in the layout via `Promise.all()` and passed down as props.
- `src/app/admin/` — Protected dashboard. Auth checked in `src/app/admin/layout.tsx`. Includes product CRUD, categories, brands, purchase orders, users, and order management.

### Data Layer

**Primary:** Prisma + PostgreSQL (Supabase hosted). All product/category/brand/user/order queries use `src/lib/prisma.ts` (singleton client) directly in Server Components and API routes.

The Prisma schema (`prisma/schema.prisma`) defines:
- **Users** — Admin/staff/client accounts with role-based access, B2B fields (company, RUC, phone), approval status
- **Products** — SKU, name, slug, pricing (regular + wholesale), stock, images (1:N), specifications (1:N), technical sheets
- **Categories** — Hierarchical (parent/children), used for navigation and filtering
- **Brands** — Product manufacturers (EDESA, BRIGGS, SLOAN, EDESA PREMIUM)
- **Orders** — Order management with snapshot data (customer info, shipping address) to preserve history. All CRUD via Prisma with ACID transactions.
- **Customers** — Guest and registered buyers with addresses
- **PurchaseOrders** — Inventory management (receiving stock from suppliers)
- **Promotions** — Discount system (percentage/fixed) with time-based or manual activation

**Legacy:** `src/data/products.json`, `categories.json`, `brands.json` still exist but are **DEPRECATED**. Do not use them. All reads should go through Prisma. `src/lib/data-store.ts` contains legacy CRUD functions for products/categories/brands (still used by some admin endpoints during transition).

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
- **Currency:** USD (Ecuador uses USD); use `formatCurrency` / `formatPrice` from `src/lib/format.ts`
- **Language:** All UI text, error messages, and comments in Spanish
- **Forms:** React Hook Form + Zod (validators in `src/lib/validators.ts`)
- **Styling:** Tailwind v4 with `@theme inline` in `globals.css`. **No `tailwind.config.js` or `tailwind.config.ts`**. Use inline theme definitions. Primary color: `oklch(0.55 0.22 25)` (EDESA red). Secondary: `oklch(0.34 0 0)` (dark gray). Accent: `oklch(0.22 0 0)` (near-black). Font: Geist Sans.
- **Types:** `src/types/product.ts`, `cart.ts`, `order.ts`, `sales.ts`
- **Prisma → component type mismatch:** use `as any` when passing Prisma results to components expecting the local `Product` type (Prisma includes relations that local types don't)
- **Parallel queries:** always use `Promise.all()` for multiple independent DB fetches in the same page/layout
- **Admin auth pattern:** `const r = await requireAdmin(req); if (!r.authorized) return r.response;`
- **Images:** stored in `public/images/products/`; paths in DB are relative to `public/` (e.g., `images/products/photo.jpg`)
- **Documents:** technical sheets (PDFs) stored in `public/documents/`
- **Middleware:** `src/middleware.ts` handles auth redirects and applies security headers to all responses
- **Rate limiting:** In-memory implementation in `src/lib/rate-limit.ts` (login, register, checkout). For multi-instance production, migrate to Redis.

### Environment Variables

Required vars (see `.env.example`):
- `DATABASE_URL` — Supabase PostgreSQL connection string with `?pgbouncer=true` for pooling
- `JWT_SECRET` — Min 32 chars, use different values for dev/prod. Generate with: `openssl rand -base64 48`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — Initial admin credentials for seeding only
- `NEXT_PUBLIC_APP_URL` — Public URL (http://localhost:3000 in dev, https://edesaventas.ec in prod)
- `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_RUC` — Company info for invoices
- `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT`, `NEXT_PUBLIC_BANK_ACCOUNT_TYPE` — Bank details for payment instructions

**Security:** Variables prefixed with `NEXT_PUBLIC_` are visible in browser. Never put secrets in `NEXT_PUBLIC_` vars.

## Important Implementation Patterns

### Server Component Data Fetching

Server Components fetch data directly from Prisma. The root layout pattern is critical:

```typescript
// src/app/(main)/layout.tsx
const [session, categories] = await Promise.all([
  getSession(),
  prisma.category.findMany({ where: { parentId: null } })
]);
// Pass session to AuthProvider (client), categories to Header as props
```

This pattern:
- Fetches session and categories **once** at layout level
- Avoids redundant API calls in child components
- Passes session to client context via `AuthProvider`
- Passes categories as props to client components that need them (Header → MobileNav)

**Always use `Promise.all()` for parallel queries in the same component.**

### Authentication Flow

JWT-based auth with HTTP-only cookies (7-day expiry). Key functions in `src/lib/auth.ts`:

**Session Management:**
- `createSession(userId)` — Creates JWT, sets HTTP-only cookie
- `getSession()` — Reads and verifies session from cookie (auto-deletes if invalid)
- `deleteSession()` — Clears session cookie
- `verifyCredentials(email, password)` — Checks User table + bcrypt, blocks if `isBlocked === true`

**Route Protection (API Routes):**
```typescript
// Admin-only endpoint
const r = await requireAdmin(request);
if (!r.authorized) return r.response; // Returns 401 or 403

// Any authenticated user
const r = await requireAuth(request);
if (!r.authorized) return r.response;
```

**Route Protection (Pages):**
- Middleware (`src/middleware.ts`) protects routes at edge level
- Admin paths (`/admin/*`) require `role === 'admin'`
- Auth-required paths (`/cuenta`, `/checkout/*`) require any valid session
- Redirects unauthenticated users to `/login?redirect=/original-path`

**Client-Side Auth State:**
```typescript
// Components use useAuth() hook from AuthContext
const { isAuthenticated, clientType, canSeePrices, clienteAprobado } = useAuth();
```

### B2B Pricing Model

Products have dual pricing:
- `price` — Regular retail price (always visible to admin)
- `wholesalePrice` — Wholesale price for authenticated B2B clients (ferreterías)

**Display Logic:**
- **Unauthenticated users:** See no prices, only "Inicia sesión para ver precios" CTA via `PriceGate` component
- **Authenticated users:** See `wholesalePrice` if > 0, otherwise see regular `price`
- Admin sees both prices in product management

**Components:**
- `PriceGate` — Compact (cards) and full (detail page) variants; shows price to auth users, CTA to non-auth
- `AddToCartButton` — Auth-gated; shows login CTA with `?redirect=` param for non-auth users

### API Route Patterns

**Product CRUD (Admin):**
- `POST /api/admin/products` — Create product (multipart form with images + data JSON)
- `GET /api/admin/products` — List all products
- `GET /api/admin/products/[id]` — Get single product with relations (images, specs)
- `PUT /api/admin/products/[id]` — Update product
- `DELETE /api/admin/products/[id]` — Soft delete (set `isActive: false`)

All admin endpoints use `requireAdmin()` pattern.

**File Uploads:**
- `POST /api/admin/upload` — Multipart upload handler
  - Images (JPG/PNG/WebP, max 5MB) → `public/images/products/`
  - PDFs (max 10MB) → `public/documents/`
  - Returns file paths relative to `public/`

**Orders (Current JSON-based):**
- `POST /api/orders` — Create order (public, from checkout)
  - Calculates tax (15% IVA for Ecuador)
  - Writes to `src/data/orders.json` via `createStoredOrder()`
- `GET /api/orders` — List orders (admin only)
- `GET /api/orders/[id]` — Get single order
- `PUT /api/orders/[id]` — Update order status (admin only, uses `updateStoredOrderStatus()`)

### Security Implementation

**HTTP Security Headers (applied in middleware and next.config.ts):**
- `X-Frame-Options: DENY` — Prevent clickjacking
- `X-Content-Type-Options: nosniff` — Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — Disable camera, microphone, geolocation, payment APIs
- `Content-Security-Policy` — Restricts script/style sources (allows inline for Next.js runtime)
- `Strict-Transport-Security` — HSTS (production only, 1 year)

**Rate Limiting:**
- In-memory implementation (`src/lib/rate-limit.ts`)
- Applied to: login (5/min), register (3/min), checkout (10/min)
- **Production note:** For multi-instance deployments, migrate to Redis-backed rate limiting

**Password Security:**
- Bcrypt hashing (cost factor 10)
- Minimum requirements enforced in validators
- JWT tokens in HTTP-only cookies (not accessible via JavaScript)
- 7-day session expiry with auto-renewal on activity

**Input Validation:**
- All forms use Zod schemas (`src/lib/validators.ts`)
- API routes validate request bodies before processing
- File uploads validate MIME types and sizes

## Troubleshooting Common Issues

**Issue: Prisma Client out of sync**
```bash
npm run db:generate  # Regenerate client after schema changes
```

**Issue: Type mismatch passing Prisma results to components**
```typescript
// Prisma returns products with relations; local Product type doesn't include them
<ProductGrid products={products as any} />
```

**Issue: Session not persisting**
- Check `JWT_SECRET` is set and ≥32 chars
- Verify cookies are enabled in browser
- Check `secure` flag matches environment (false in dev, true in prod)

**Issue: Images not loading**
- Verify paths in DB are relative to `public/` (e.g., `images/products/photo.jpg`, not `/public/images/...`)
- Check `next.config.ts` image domains if using external CDN

**Issue: Rate limit blocking during development**
- Rate limits are in-memory and reset on server restart
- Restart dev server: `npm run dev`

## Future Migration Tasks

These are documented but not yet implemented:

1. **Migrate orders to Prisma** — Currently using JSON file; Order schema exists in Prisma but not in use
2. **Redis rate limiting** — Current in-memory implementation won't work across multiple instances
3. **Payment gateway integration** — PlaceToPay (Ecuador) or Stripe
4. **Email notifications** — SMTP for order confirmations
5. **File storage migration** — Move from `public/` to Supabase Storage for scalability
