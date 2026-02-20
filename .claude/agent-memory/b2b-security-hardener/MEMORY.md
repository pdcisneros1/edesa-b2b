# EDESA VENTAS — Security Hardener Memory

## Stack de seguridad actual (post-hardening 2026-02-18)
- JWT via `jose` (HS256, 7d), HTTP-only cookies, sameSite: lax
- bcryptjs (cost 12) para passwords en DB
- Rate limiting en memoria (sliding window) en `src/lib/rate-limit.ts`
- Middleware Edge-compatible en `src/middleware.ts` — usa `decryptEdge` de `src/lib/session.ts`
- CSP + security headers en `next.config.ts` Y en middleware (doble capa)

## Patrón CRÍTICO: Edge Runtime vs Node.js
`src/middleware.ts` corre en Edge Runtime — NO puede importar `bcryptjs` ni `prisma`.
Solución: `src/lib/session.ts` contiene `decryptEdge()` que solo usa `jose` (Edge-safe).
`src/lib/auth.ts` contiene todo lo que requiere Node.js (bcrypt, Prisma).
NUNCA importar auth.ts directamente desde middleware.ts.

## Vulnerabilidades encontradas y corregidas
1. **CRÍTICO: Manipulación de precios** — `POST /api/orders` usaba `item.price` del cliente.
   Fix: re-fetch precio autoritativo desde DB en transacción. Archivo: `src/app/api/orders/route.ts`

2. **Sin rate limiting** en login, register, checkout.
   Fix: `src/lib/rate-limit.ts` con sliding window. LOGIN_RATE_LIMIT: 5 intentos / 15min.

3. **Admin layout** chequeaba `role === 'cliente'` en vez de `role !== 'admin'`.
   Fix: `src/app/admin/layout.tsx` línea 17.

4. **Sin middleware global** — /checkout/*, /cuenta/* no tenían protección a nivel middleware.
   Fix: `src/middleware.ts` creado.

5. **ESLint escaneaba .next/** — pre-existing, fix: ignorar en `eslint.config.mjs`.

## Rutas API y su protección
- `/api/auth/login` → rate limit IP+email (5/15min)
- `/api/auth/register` → rate limit IP (3/hora)
- `/api/orders POST` → rate limit IP (10/hora) + precios desde DB
- `/api/orders GET` → requireAdmin
- `/api/orders/[id] GET,PUT` → requireAdmin
- `/api/admin/**` → requireAdmin (todos)

## JWT_SECRET validation
Validado en startup: mínimo 32 chars. Error fatal si no está o es corto.
Secret actual en .env: 47 chars (cumple el mínimo).

## Upload de archivos (admin only)
- Validación: tipo MIME declarado + magic bytes (JPEG/PNG/WebP/PDF)
- Tamaño: 5MB imágenes, 10MB PDFs
- Path traversal prevention: `path.resolve()` + check que filepath empieza por publicDir
- Filename sanitización: solo alphanumeric, guiones, puntos, guiones bajos

## Validators.ts
- `passwordSchema`: min 8, max 128, mayúscula, minúscula, número
- `loginSchema`: email + password con límites
- `productSchema`: prices positivos, slug regex, lengths
- `adminCreateUserSchema`: usa passwordSchema
- Zod v3+: `invalid_type_error` NO va en `.number()` como arg, va en `.number({message: ...})`

## Headers de seguridad implementados
CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff,
Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy,
HSTS (solo producción). Dos capas: next.config.ts + middleware.ts.

## getSession() null-safety
Si cookie existe pero token inválido/expirado, se elimina la cookie.
Maneja el caso de cookies corruptas sin loop de redirección.

## Archivos modificados/creados en hardening
- `src/lib/rate-limit.ts` (NUEVO)
- `src/lib/session.ts` (NUEVO — decryptEdge para Edge Runtime)
- `src/middleware.ts` (NUEVO)
- `src/lib/auth.ts` (mejorado)
- `src/lib/validators.ts` (mejorado — passwordSchema, loginSchema, productSchema)
- `src/app/api/auth/login/route.ts` (rate limiting)
- `src/app/api/auth/register/route.ts` (rate limiting)
- `src/app/api/orders/route.ts` (price fix + rate limiting)
- `src/app/api/admin/products/route.ts` (sanitización inputs)
- `src/app/api/admin/products/[id]/route.ts` (sanitización inputs)
- `src/app/api/admin/upload/route.ts` (magic bytes + path traversal)
- `src/app/api/admin/usuarios/route.ts` (Zod validation)
- `src/app/admin/layout.tsx` (role check fix)
- `next.config.ts` (CSP + HSTS)
- `.env.example` (documentación vars seguridad)
- `eslint.config.mjs` (ignorar .next/ y next-env.d.ts)
