# EDESA VENTAS — UI Redesign Agent Memory

## Design System Conventions
- Primary: `oklch(0.55 0.22 25)` (~red-600). Use sparingly — CTAs, badges, links only.
- Tailwind v4: `bg-primary/8` (8% opacity) works for subtle tints — used in icon backgrounds.
- Border system: `border-gray-200` for cards, `border-gray-100` for inner dividers. NO heavy shadows.
- Card pattern: `bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors`
- Table header: `bg-gray-50 border-b border-gray-100` with `text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Table rows: `divide-y divide-gray-50` with `hover:bg-gray-50/60 transition-colors`
- Page headers: `bg-white border-b border-gray-100` with content inside `container py-7`

## Admin UI Pattern
- AdminNav: sticky top bar (h-14), not side nav. Logo + flat inline nav + actions.
- Admin layout: `bg-gray-50 min-h-screen` with `py-6` main padding.
- Admin stat cards: no shadcn `Card` — use raw `div` with `bg-white rounded-lg border border-gray-200 p-5`.
- Admin tabs: `h-9 bg-gray-100 rounded-lg p-1` inline-flex tabs, not full-width grid.

## Auth Pages Pattern
- Login/Register: split two-panel layout — dark left panel (gray-950) + white right form panel.
- Left panel width: `w-[420px]` for login, `w-[380px]` for register.
- Left panel content: logo, tagline, bullet list of benefits, copyright footer.
- Hidden on mobile (hidden lg:flex), form is centered full-width on mobile.

## Storefront Pages Pattern
- All pages: `bg-gray-50 min-h-screen` outer wrapper.
- Page header section: `bg-white border-b border-gray-100` with `container py-7` or `py-8`.
- Within header: eyebrow label (text-xs font-semibold uppercase tracking-widest text-primary), then h1, then subtitle.
- Content below header: `container py-6` or `py-8`.

## Home Page Sections
- Hero: existing carousel with dark gradients — kept as-is (already good).
- Features strip: border-based horizontal band, `bg-white border-b border-gray-100`, grid with internal dividers.
- FeaturedProducts: `bg-gray-50 border-t border-gray-100`, section header with eyebrow + h2 + subtitle.
- CategoryGrid: `bg-white border-t border-gray-100`, flat category tiles with 2-letter avatar.
- BrandShowcase: `bg-gray-50 border-t border-gray-100`, flex-wrap pill layout for brands.
- B2B CTA: `bg-gray-900 py-14` dark section at bottom of home page.

## Typography Patterns
- Section eyebrows: `text-xs font-semibold uppercase tracking-widest text-primary mb-1.5`
- Section h2: `text-2xl font-extrabold tracking-tight text-gray-900`
- Page h1: `text-xl font-bold text-gray-900` (in admin/simple pages) or `text-2xl font-extrabold` (in storefront)
- Body text: `text-sm text-gray-500 leading-relaxed`
- Meta/count text: `text-xs text-gray-400 tabular-nums`
- Status/badge labels: uppercase tracking-wide, pill shape (rounded-full)

## Key TypeScript Notes
- Always use `as any` when passing Prisma products to `ProductGrid` (type mismatch between Prisma types and local Product type).
- `products as any` pattern used in: FeaturedProducts, CategoryGrid/[slug], buscar/page, productos/page, productos/[slug].
- `product.wholesalePrice` accessed via `(product as any).wholesalePrice` in product detail page.

## Completed Redesign Work (2026-02-18)
Files modified:
- `src/components/admin/AdminNav.tsx` — flat sticky top bar, icon nav, cleaner layout
- `src/app/admin/layout.tsx` — py-6 instead of py-8
- `src/components/admin/DashboardClient.tsx` — stat cards without Card component, cleaner tabs
- `src/app/login/page.tsx` — split panel layout (dark left + form right)
- `src/app/register/page.tsx` — split panel layout with benefits list
- `src/components/home/Features.tsx` — border-based horizontal strip with internal dividers
- `src/components/home/BrandShowcase.tsx` — flex-wrap pill layout, gray-50 bg
- `src/components/home/CategoryGrid.tsx` — flat tile cards with letter avatar
- `src/components/home/FeaturedProducts.tsx` — consistent section header pattern
- `src/app/(main)/page.tsx` — added B2B CTA section at bottom
- `src/app/(main)/categorias/page.tsx` — page header bar pattern
- `src/app/(main)/categorias/[slug]/page.tsx` — page header bar with breadcrumb
- `src/app/(main)/buscar/page.tsx` — page header bar pattern
- `src/app/(main)/contacto/page.tsx` — cleaner layout, dark WhatsApp card
- `src/app/(main)/nosotros/page.tsx` — page header bar, smaller section headings
- `src/app/(main)/productos/page.tsx` — page header bar pattern
- `src/app/(main)/productos/[slug]/page.tsx` — breadcrumb bar, cleaner layout
- `src/app/(main)/cuenta/page.tsx` — page header bar, cleaner order cards
- `src/app/admin/pedidos/page.tsx` — cleaner table, ArrowRight instead of ExternalLink
- `src/app/admin/categorias/page.tsx` — raw div cards instead of shadcn Card
- `src/app/admin/marcas/page.tsx` — raw div cards, grid layout
- `src/app/admin/usuarios/page.tsx` — cleaner table, ArrowRight icon
- `src/components/cart/CartItem.tsx` — cleaner cart item with brand label, rounded controls
- `src/components/shared/LoadingSpinner.tsx` — thinner spinner border-2
- `src/app/error.tsx` — red-50 border icon bg, RotateCcw icon

## Build Status
- Build: PASSES with zero errors (verified 2026-02-18)
- TypeScript: clean compilation
- No business logic modified
