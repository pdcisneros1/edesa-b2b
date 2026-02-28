# EDESA VENTAS — UI Redesign Agent Memory

## Design System Conventions
- Primary: `oklch(0.55 0.22 25)` (~red-600). Use sparingly — CTAs, badges, links only.
- Tailwind v4: `bg-primary/8` (8% opacity) works for subtle tints — used in icon backgrounds.
- Border system: `border-gray-200` for cards, `border-gray-100` for inner dividers. NO heavy shadows.
- Card pattern: `bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors`
- Table header: `bg-gray-50 border-b border-gray-100` with `text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Table rows: `divide-y divide-gray-50` with `hover:bg-gray-50/60 transition-colors`
- Page headers: `bg-white border-b border-gray-100` with content inside `container py-8`

## Spacing & Border Radius System (2026-02-24)
**Container:**
- Global: `max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8` (defined in globals.css utility)

**Section Padding:**
- Home sections: `py-14 md:py-20` (CategoryGrid: `py-16 md:py-24` — larger)
- Page content: `py-8` or `py-10`
- Cards: `p-5` or `p-6`
- Features strip: `py-1` wrapper, `px-6 py-5` items

**Border Radius:**
- Cards (large): `rounded-2xl`
- Cards (medium): `rounded-xl`
- Buttons: `rounded-lg` (all sizes)
- Inputs: `rounded-lg`, h-10, px-4
- Badges: `rounded-lg`, px-2.5 py-1
- Empty states: `rounded-2xl p-10`

**Gaps:**
- ProductGrid: `gap-4 sm:gap-5 lg:gap-6`
- Category grid: `gap-4 lg:gap-6` (was `lg:gap-5`)
- Product detail sections: `gap-10 lg:gap-14`
- Cart page: `gap-8`
- Productos page: `gap-6 lg:gap-8`

**Button Sizes (updated):**
- default: h-10, rounded-lg
- xs: h-7, rounded-lg
- sm: h-9, rounded-lg
- lg: h-11, rounded-lg

**Header Heights:**
- Top bar: h-10
- Main header: h-18
- Category nav: h-11

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
- Page header section: `bg-white border-b border-gray-100` with `container py-8`.
- Within header: eyebrow label (text-xs font-semibold uppercase tracking-widest text-primary), then h1, then subtitle.
- Content below header: `container py-8` or `py-10`.

## Premium Animations System (2026-02-24)

### CSS-only Animations (No JS)
All animations defined in `globals.css` using `@keyframes`:
- `fadeInUp`: opacity 0→1, translateY(20px)→0, cubic-bezier(0.16, 1, 0.3, 1), 0.6s
- `scaleIn`: opacity 0→1, scale(0.95)→1, cubic-bezier(0.16, 1, 0.3, 1), 0.4s
- `slideInRight`: opacity 0→1, translateX(-20px)→0, cubic-bezier(0.16, 1, 0.3, 1), 0.5s

### Utility Classes
- `.animate-fade-in-up` — primary animation for cards, sections
- `.animate-scale-in` — for modals, popovers
- `.animate-slide-in-right` — for sidebars
- `.delay-100` through `.delay-800` — stagger delays (100ms increments)

### Application Pattern
```tsx
// ProductGrid stagger
{products.map((product, idx) => (
  <div className="animate-fade-in-up opacity-0" style={{ animationDelay: `${Math.min(idx * 50, 800)}ms` }}>
    <ProductCard product={product} />
  </div>
))}

// Section headers
<div className="animate-fade-in-up opacity-0">
  <h2>Title</h2>
</div>

// Feature items with stagger
<div className="animate-fade-in-up opacity-0 delay-100">...</div>
<div className="animate-fade-in-up opacity-0 delay-200">...</div>
```

**IMPORTANT**: Always include `opacity-0` base class when using animation classes to prevent FOUC.

## Hero Carousel Implementation (2026-02-24)

**Component:** `src/components/home/Hero.tsx`
**Tech:** Embla Carousel React + Autoplay plugin
**Pattern:**
```tsx
const [emblaRef, emblaApi] = useEmblaCarousel(
  { loop: true },
  [Autoplay({ delay: 6000, stopOnInteraction: true })]
);
```
**Features:**
- 3 slides with distinct messaging
- Auto-play 6s delay
- Custom navigation buttons (prev/next)
- Dot indicators with active state
- Dark gradient background + dot pattern overlay
- Animated badge with ping effect
- Dual CTAs per slide

## Home Page Sections (Updated 2026-02-24)
- Hero: Embla carousel with autoplay, dark gradients, dot pattern — PREMIUM VERSION
- Features strip: border-based horizontal band, `bg-white border-b border-gray-100 py-1`, grid with internal dividers, `px-6 py-5` items, animated with stagger delays
- FeaturedProducts: `bg-gray-50 border-t border-gray-100 py-14 md:py-20`, section header animated, explicit `max-w-[1400px]`, `mb-10`
- CategoryGrid: **REDESIGNED 2026-02-24** — `bg-gray-50 py-16 md:py-24`, 5-column image overlay grid, dark gradients, larger typography, alternative minimalista design in comments
- BrandShowcase: `bg-gray-50 border-t border-gray-100 py-14 md:py-20`, flex-wrap pill layout, `rounded-xl px-10 py-5`, `gap-4`, animated with stagger
- B2B CTA: `bg-gray-900 py-14` dark section at bottom of home page

## CategoryGrid Pattern (2026-02-24)

**Active Design:** Image overlay with dark gradient
- Grid: 5 columns desktop (`lg:grid-cols-5`), 3 tablet, 2 mobile
- Cards: `aspect-[3/4]`, `rounded-xl`, overflow-hidden
- Image: Next.js Image with `object-cover`, `scale-110` hover (500ms transition)
- Overlay: `bg-gradient-to-t from-black/80 via-black/20 to-transparent`, opacity-90 → 100 on hover
- Text: white, centered, `p-6` bottom container, `text-lg font-semibold`
- Takes 10 categories (was 8)
- Stagger animation delays capped at 800ms

**Alternative Design (in comments):** Minimalista with avatars
- Grid: 4 columns desktop
- Cards: white, `rounded-2xl border p-8`
- Avatar: 16x16 with initials, conditional `bg-red-50` for one card
- Shows product count
- Hover: `border-gray-300 shadow-lg`

**Header (both designs):**
- Eyebrow: `text-sm font-semibold uppercase tracking-wide text-red-600` (explicit red-600)
- Title: `text-3xl font-bold md:text-4xl` (larger than other sections)
- Subtitle: `text-lg text-gray-600`
- Button: `size="default"` with ArrowRight, hidden mobile, full-width shown below grid

**IMPORTANT:** Requires `category.image` populated in DB. Shows gray gradient if null.

## Typography Patterns
- Section eyebrows: `text-xs font-semibold uppercase tracking-widest text-primary mb-1.5`
- Section h2: `text-2xl font-extrabold tracking-tight text-gray-900`
- Page h1: `text-xl font-bold text-gray-900` (in admin/simple pages) or `text-2xl font-extrabold` (in storefront)
- Body text: `text-sm text-gray-500 leading-relaxed`
- Meta/count text: `text-xs text-gray-400 tabular-nums`
- Status/badge labels: uppercase tracking-wide, pill shape (rounded-lg), px-2.5 py-1

**CategoryGrid Exception:** Larger scale typography
- Eyebrow: `text-sm` (not xs), `text-red-600` (explicit, not primary)
- Title: `text-3xl md:text-4xl` (not 2xl)
- Subtitle: `text-lg` (not sm)

## Key TypeScript Notes
- Always use `as any` when passing Prisma products to `ProductGrid` (type mismatch between Prisma types and local Product type).
- `products as any` pattern used in: FeaturedProducts, CategoryGrid/[slug], buscar/page, productos/page, productos/[slug].
- `product.wholesalePrice` accessed via `(product as any).wholesalePrice` in product detail page.

## Completed Redesign Work

### Premium Design System Implementation (2026-02-24)

**System-level (4 files):**
- `src/app/globals.css` — Added `.container` utility, CSS animations (fadeInUp, scaleIn, slideInRight), delay utilities
- `src/components/ui/button.tsx` — Sizes increased (h-10 default, h-7 xs, h-9 sm, h-11 lg), all use `rounded-lg`
- `src/components/ui/input.tsx` — h-10, px-4, `rounded-lg`
- `src/components/ui/card.tsx` — `rounded-2xl`

**Hero with Autoplay (1 file):**
- `src/components/home/Hero.tsx` — COMPLETE REWRITE: Embla Carousel with Autoplay plugin, custom navigation, dot indicators, premium dark gradient design

**Product components (2 files):**
- `src/components/products/ProductCard.tsx` — `rounded-2xl`, p-5 content, badges `rounded-lg px-2.5 py-1`, left-3 top-3, gap-2, shadow-lg hover
- `src/components/products/ProductGrid.tsx` — `gap-4 sm:gap-5 lg:gap-6`, empty state `rounded-2xl p-10`, stagger animations with delays

**Home sections with animations (4 files):**
- `src/components/home/Features.tsx` — py-1 wrapper, px-6 py-5 items, gap-4, animated stagger delays
- `src/components/home/FeaturedProducts.tsx` — py-14 md:py-20, explicit `max-w-[1400px] mx-auto px-*`, mb-10, animated header
- `src/components/home/CategoryGrid.tsx` — **REDESIGNED 2026-02-24**: 5-col image overlay grid, `py-16 md:py-24`, dark gradients, larger typography, minimalista alternative in comments
- `src/components/home/BrandShowcase.tsx` — py-14 md:py-20, gap-4, `rounded-xl px-10 py-5`, mb-10, animated stagger

**Productos page (1 file):**
- `src/app/(main)/productos/page.tsx` — py-8 header/content, gap-6 lg:gap-8, w-64 sidebar, `rounded-xl` toolbar py-3 mb-5

**Total: 12 files modified/rewritten**

**Latest change (2026-02-24):** CategoryGrid.tsx redesigned with image overlay pattern

## Build Status (2026-02-24)
- Build: ✅ PASSES with zero TypeScript errors
- Warnings: Dynamic server usage warnings are expected (routes using cookies for auth)
- All animations: CSS-only, no JavaScript intersection observers
- Hero: Autoplay functional, smooth transitions
- NO business logic modified
- NO API routes changed

## Animation Best Practices
1. Always use CSS animations defined in globals.css
2. Never create Intersection Observer hooks or components
3. Stagger delays: cap at 700-800ms to avoid long delays
4. Always include `opacity-0` base class when using animation utilities
5. Use `Math.min(idx * delay, maxDelay)` to cap delays in loops
6. Cubic bezier: `cubic-bezier(0.16, 1, 0.3, 1)` for Apple-style smooth easing
