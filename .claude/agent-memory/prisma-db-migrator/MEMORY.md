# EDESA VENTAS — Prisma Migration Agent Memory

## Migration Status (as of 2026-02-18)

### Completed
- Products, Categories, Brands, Users: fully on Prisma
- Orders + OrderItems: fully on Prisma (completed 2026-02-18)
- 2 existing JSON orders migrated to Prisma via `prisma/migrate-orders.ts`
- All JSON data-store functions for orders are no longer called by any active route

### Remaining JSON usage in data-store.ts
- `getProducts/createProduct/updateProduct/deleteProduct` — still used in admin product APIs
  (These should be migrated next, but products are already in Prisma via seed)
- `getCategories/getBrands` — same pattern, not yet fully removed from data-store.ts
- The file `src/data/orders.json` is now LEGACY — all new orders go to Prisma

## Prisma Schema Key Decisions

### Order model (finalized)
- `customerId String?` — optional FK; guest checkout allowed (customerId = null)
- `OrderStatus` enum uses Spanish values: `pendiente_pago | pagado | en_proceso | enviado | entregado | cancelado`
- Customer info stored as snapshot columns (not FK to Customer): `customerName`, `customerEmail`, `customerPhone`, `customerCompany`, `customerTaxId`
- Shipping address stored as flat snapshot columns: `shippingStreet`, `shippingCity`, `shippingProvince`, `shippingZipCode`, `shippingCountry`
- `shipping Float` (not `shippingCost`) — matches the local Order type
- `paymentMethod String?` — nullable; values: `transferencia | tarjeta | efectivo`

### OrderItem model
- `unitPrice Float` — renamed from `price` to match local OrderItem type

### Customer model
- Exists in schema but NOT used by the current app (guest checkout only). Keep for future.

## Key Patterns

### prismaOrderToLocal() helper
Both `src/app/api/orders/route.ts` and `src/app/api/orders/[id]/route.ts` have a local `prismaOrderToLocal()` helper that maps Prisma's flat snapshot columns back to the nested `Order` type (with `shippingAddress: { street, city, province, zipCode, country }`).

Ideal next step: extract to `src/lib/order-utils.ts` to avoid duplication.

### OrderStatus type conflict
The local `OrderStatus` type (string union from `src/types/sales.ts`) conflicts with Prisma's generated `OrderStatus` enum. Solution:
```typescript
import type { OrderStatus as PrismaOrderStatus } from '@prisma/client';
data: { status: status as PrismaOrderStatus }
```

### Stock decrement (atomic)
Orders are created inside `prisma.$transaction()` which:
1. Validates stock for all items
2. Creates the Order with items (nested create)
3. Decrements stock for each item
If any step fails, everything rolls back.

### Admin pages use direct Prisma (no API)
`/admin/pedidos/page.tsx` and `/admin/pedidos/[id]/page.tsx` are Server Components
that call `prisma.order.findMany/findUnique` directly (no API call needed).

### Dashboard page
`/admin/page.tsx` maps Prisma orders to the local `Order` type for `DashboardClient`
compatibility. `DashboardClient` receives typed `Order[]`.

## JSON → Prisma Product ID Mismatch
When migrating JSON orders: JSON product IDs (e.g. `cmlq4pc3r0001rhfhb2cz5dig`)
DO NOT match Prisma product IDs after re-seeding (Prisma generates new cuid() IDs).
Resolution order: exact ID → SKU lookup → name partial → fallback to any product.
The item's `productName`/`productSku` snapshot preserves the original data for display.

## Commands
```bash
# After any schema change:
npm run db:generate

# Dev (no migration history):
npx prisma db push --accept-data-loss  # only if enum values changed

# Migrate existing JSON orders (run once):
npx tsx prisma/migrate-orders.ts

# Build check:
npx tsc --noEmit && npm run build
```

## Files Modified in Orders Migration
- `prisma/schema.prisma` — Order/OrderItem models + OrderStatus enum
- `src/app/api/orders/route.ts` — full Prisma rewrite (POST+GET)
- `src/app/api/orders/[id]/route.ts` — full Prisma rewrite (GET+PUT)
- `src/app/admin/pedidos/page.tsx` — Prisma instead of getStoredOrders
- `src/app/admin/pedidos/[id]/page.tsx` — Prisma instead of getStoredOrderById
- `src/app/admin/page.tsx` — orders from Prisma instead of getStoredOrders
- `src/app/admin/usuarios/[id]/page.tsx` — Prisma instead of getStoredOrders (filter by email)
- `src/app/(main)/cuenta/page.tsx` — Prisma instead of getStoredOrders (filter by session email)
- `prisma/migrate-orders.ts` — one-time JSON → Prisma migration script (NEW)

## Grep to verify no more data-store order usages:
```bash
grep -r "getStoredOrder\|createStoredOrder\|updateStoredOrder" src/
# Should only appear in src/lib/data-store.ts itself
```
