# Production Deployment Memory - EDESA VENTAS

## Project Context
- Next.js 15 App Router e-commerce B2B
- Prisma + PostgreSQL (Supabase free tier)
- JWT auth, rate limiting, security headers
- 1740 productos, 9 categorías, 4 marcas
- Build: 34 rutas, middleware 40.3 kB

## Critical Learnings

### 1. Supabase Free Tier Limitations
**Issue:** Durante `npm run build`, Prisma queries fallan con "MaxClientsInSessionMode: max clients reached"

**Root cause:** Supabase free tier limita conexiones concurrentes. Durante static generation, Next.js intenta generar múltiples páginas en paralelo, cada una abriendo conexión a DB.

**Solution:**
- Es NORMAL en desarrollo/build local con free tier
- En producción con Vercel, esto NO es problema porque:
  1. Vercel usa connection pooling automáticamente
  2. Las páginas son dynamic server-rendered (ƒ), no static prerendered
  3. `DATABASE_URL` debe incluir `?pgbouncer=true` para Supabase pooling

**Action:** Documentar en deployment guide que estos errores son esperados en build local y no bloquean deployment.

### 2. Console.log Cleanup Strategy
**Pattern:** NO remover todos los console.log ciegamente

**Keep:**
- `console.error()` en try-catch de API routes (debugging producción)
- `console.error()` con prefijos como `[Component] Error:` para identificar origen

**Remove:**
- `console.log()` de debug (ej. "Creating order with data:", "Submitting...")
- `console.error()` para errores no críticos (ej. "Error parsing draft localStorage")

**Rationale:** Error logs son CRÍTICOS para troubleshooting en producción. Debug logs contaminan logs de Vercel.

### 3. Prisma Client Optimization
**Pattern:** Configurar logging basado en environment

```typescript
new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
});
```

**Benefit:** Reduce noise en production logs, mantiene debugging en dev.

### 4. Environment Variables Checklist
**Critical vars para Next.js + Prisma + Supabase:**

**Server-only (NO exponer):**
- `DATABASE_URL` - DEBE tener `?pgbouncer=true` para Supabase
- `JWT_SECRET` - Mínimo 32 chars, DIFERENTE en prod vs dev
- `ADMIN_PASSWORD` - Solo para seed, admin debe cambiarla después

**Client-exposed (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_APP_URL` - URL de producción (afecta metadata, OG tags, sitemap)
- `NEXT_PUBLIC_COMPANY_*` - Info de empresa visible en UI
- `NEXT_PUBLIC_BANK_*` - Datos bancarios para instrucciones de pago

**Best practice:** Documentar TODAS las vars en `.env.example` con comentarios explicando:
1. Si es requerida u opcional
2. Dónde obtener el valor (ej. "Supabase > Settings > Database > Connection pooling")
3. Formato esperado (ej. "postgresql://...?pgbouncer=true")
4. Consideraciones de seguridad (ej. "DIFERENTE en producción")

### 5. Build Warnings vs Errors
**Observation:** Build puede tener warnings de conexión DB pero aún compilar exitosamente

**Pattern:**
- Errors de TypeScript → BLOQUEANTE, corregir antes de deploy
- Errors de importación → BLOQUEANTE
- Warnings de Prisma connection durante static gen → NO bloqueante si páginas son dynamic (ƒ)
- Warnings de ESLint → Corregir pero no bloqueante

**Action:** En deployment docs, explicar qué warnings ignorar vs cuáles resolver.

### 6. Middleware Size (40.3 kB)
**Current:** 40.3 kB es ACEPTABLE para middleware con:
- JWT decryption (jose library)
- Session validation
- Security headers
- CSRF protection
- Rate limiting

**Optimization opportunities (futuro):**
- Mover rate limiting a Redis (reduce in-memory state)
- Edge runtime para session check (si jose soporta)
- Code-split helpers no usados en edge

**Benchmark:** Middleware <50 kB = good, 50-100 kB = acceptable, >100 kB = investigate

### 7. Documentation Structure
**Pattern usado:**

1. `DEPLOYMENT.md` - Guía completa, exhaustiva (10-15 min lectura)
   - Pre-deployment audit
   - Database setup
   - Vercel config
   - Post-deployment verification
   - Troubleshooting
   - Monitoring

2. `VERCEL-DEPLOY.md` - Quick start (10 minutos de principio a fin)
   - Pasos mínimos necesarios
   - Copy-paste commands
   - Troubleshooting rápido

3. `PRODUCTION-CHECKLIST.md` - Checklist interactivo con checkboxes
   - Pre-deploy
   - Deploy
   - Post-deploy verification
   - Performance
   - Security

4. `.env.example` - Todas las vars con comentarios inline

5. `README.md` - Overview + link a deployment docs

**Rationale:** Usuarios diferentes tienen diferentes necesidades:
- Desarrolladores expertos → Quick start
- DevOps/SRE → Checklist
- Gerencia/stakeholders → README overview
- Troubleshooting → Guía completa

### 8. Vercel-Specific Patterns
**Key configs:**
- Framework preset: Next.js (autodetecta build/output)
- Node version: 18.x+ (especificar en `package.json` engines si es crítico)
- Environment vars: Aplicar a Production, Preview, Y Development (evita inconsistencias)

**Build settings:**
- Build command: `npm run build` (default correcto)
- Output directory: `.next` (default correcto)
- Install command: `npm install` (default correcto)
- Root directory: `./` (dejar vacío para monorepo root)

**Git integration:**
- Production branch: `main` (default)
- Preview branches: Todas las demás (configurable)
- Ignored build step: Útil para prevenir deploys innecesarios

### 9. SEO Configuration Completeness
**Verified:**
- `src/app/layout.tsx` - metadata completo (title, description, OG, Twitter)
- `src/app/robots.ts` - genera robots.txt dinámicamente
- `src/app/sitemap.ts` - genera sitemap.xml con productos y categorías desde DB
- Base URL desde `NEXT_PUBLIC_APP_URL` - CRÍTICO para OG tags y canonical URLs

**Pattern:** Base URL debe:
1. Ser env var `NEXT_PUBLIC_APP_URL`
2. Fallback a default en caso de missing (ej. "https://edesaventas.ec")
3. Usarse en: metadata.metadataBase, sitemap, robots, OG tags

### 10. Security Headers Completeness
**Implemented in:**
- `next.config.ts` - Fallback headers para todas las rutas
- `src/middleware.ts` - Headers granulares por ruta con CSP

**Headers configured:**
- `X-Frame-Options: DENY` - Anti-clickjacking
- `X-Content-Type-Options: nosniff` - Anti-MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy
- `Permissions-Policy` - Deshabilitar features innecesarias (camera, mic, geo)
- `Content-Security-Policy` - Control de recursos cargados
- `Strict-Transport-Security` - HSTS (solo producción)

**CSP Considerations:**
- Next.js requiere `'unsafe-inline'` para scripts/estilos (runtime)
- `'unsafe-eval'` puede removerse si no se usan transpiladores dinámicos
- `img-src` debe incluir CDNs usados (ej. placehold.co)

### 11. Rate Limiting State
**Current:** In-memory Map en `src/lib/rate-limit.ts`

**Pros:**
- Simple, no deps externas
- Funciona en single-instance deploys (Vercel serverless)

**Cons:**
- NO compartido entre instancias (si hay múltiples)
- Se resetea en cada cold start

**Future:** Migrar a Redis si:
1. Múltiples regiones (Vercel Edge Functions)
2. Alta concurrencia (>1000 req/min)
3. Necesidad de persistencia entre deploys

**Pattern:** Documentar como "Fase 2" en roadmap, no bloqueante para MVP.

## Common Pitfalls

1. **DATABASE_URL sin ?pgbouncer=true** → Connection pool errors en producción
2. **JWT_SECRET igual en dev y prod** → Sesiones de dev funcionan en prod (security issue)
3. **NEXT_PUBLIC_APP_URL incorrecto** → OG tags apuntan a localhost, sitemap inválido
4. **Olvidar aplicar env vars a Preview/Development** → Preview deploys rompen
5. **No cambiar ADMIN_PASSWORD post-seed** → Credenciales default expuestas

## Performance Benchmarks

**Build time:** ~2-3 seconds (compilation)
**Total build:** ~30-60 seconds (incluyendo linting, type-checking, static gen)
**Middleware size:** 40.3 kB (aceptable)
**First load JS:** 102-217 kB depending on route (good para e-commerce)
**Routes:** 34 total (30 dynamic ƒ, 4 static ○)

**Target Lighthouse scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

## Next Steps (Post-MVP Deploy)

1. Configurar Sentry para error tracking
2. Implementar emails (SMTP) para confirmaciones de pedidos
3. Migrar rate limiting a Redis si tráfico escala
4. Configurar uptime monitoring (UptimeRobot)
5. Implementar pasarela de pagos (PlaceToPay Ecuador)
6. Backups automáticos de Supabase
7. Analytics avanzado (Google Analytics + Vercel Analytics)

## Files Created This Session

- `DEPLOYMENT.md` - Guía exhaustiva de deployment
- `VERCEL-DEPLOY.md` - Quick start de 10 minutos
- `PRODUCTION-CHECKLIST.md` - Checklist interactivo
- `.env.example` - Actualizado con comentarios de producción
- `README.md` - Actualizado con instrucciones de deploy
- `src/lib/prisma.ts` - Optimizado con logging condicional
- Cleanup de console.log en purchase orders
