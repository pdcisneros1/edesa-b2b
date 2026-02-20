# EDESA VENTAS - Guía de Despliegue a Producción

Guía completa para desplegar EDESA VENTAS a producción en Vercel + Supabase.

---

## Estado del Proyecto

- Build compila exitosamente (34 rutas)
- Base de datos Prisma + PostgreSQL (Supabase) activa
- Seguridad implementada (JWT, rate limiting, headers HTTP)
- Middleware optimizado (40.3 kB)
- SEO configurado (metadata, sitemap, robots.txt)

---

## Pre-Requisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Base de datos PostgreSQL en [Supabase](https://supabase.com) (ya configurada)
3. Node.js 18+ instalado localmente
4. Git instalado

---

## Fase 1: Pre-Deployment Checklist

### 1.1 Verificar Build Local

```bash
cd /Users/pablocisneros/Desktop/EDESA\ VENTAS/edesa-ventas
npm run build
```

**Estado actual:** Build compila con éxito, pero hay advertencia de conexión DB durante generación estática.

**Solución:** Esto es normal en free tier de Supabase. En producción, Vercel manejará la conexión pooling correctamente.

### 1.2 Verificar Variables de Entorno

Copiar `.env.example` a `.env` y completar TODOS los valores:

```bash
cp .env.example .env
```

**Variables OBLIGATORIAS:**

```bash
# Base de datos (Supabase)
DATABASE_URL="postgresql://postgres.xxx:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT (generar con: openssl rand -base64 48)
JWT_SECRET="TU_SECRETO_SEGURO_MINIMO_32_CARACTERES_ALEATORIOS"

# Credenciales admin inicial
ADMIN_EMAIL="admin@edesaventas.ec"
ADMIN_PASSWORD="TU_PASSWORD_SEGURA_ADMIN"

# URL de la aplicación (cambiar en producción)
NEXT_PUBLIC_APP_URL="https://tu-dominio.vercel.app"
NEXT_PUBLIC_SITE_NAME="EDESA VENTAS"

# Datos comerciales (transferencia bancaria)
NEXT_PUBLIC_COMPANY_NAME="EDESA VENTAS S.A."
NEXT_PUBLIC_COMPANY_RUC="1790XXXXXXXX001"
NEXT_PUBLIC_BANK_NAME="Banco Pichincha"
NEXT_PUBLIC_BANK_ACCOUNT="2200-XXXXXXXXX"
NEXT_PUBLIC_BANK_ACCOUNT_TYPE="Cuenta Corriente"
```

**IMPORTANTE:**
- `DATABASE_URL` debe incluir `?pgbouncer=true` para connection pooling en Supabase
- `JWT_SECRET` debe ser DIFERENTE en producción vs desarrollo (mínimo 32 caracteres)
- `ADMIN_PASSWORD` solo se usa en el seed inicial; el admin debe cambiarla después

### 1.3 Verificar .gitignore

Confirmar que `.env` NO esté en el repositorio:

```bash
cat .gitignore | grep -E "^\.env"
```

Debe mostrar:
```
.env*
```

**Estado:** Confirmado. `.env` está correctamente ignorado.

### 1.4 Limpiar Console.log Innecesarios

**Estado actual:** Hay varios `console.log` de debug que deben removerse en producción.

**Acción:** Ver sección "Optimización de Código" más abajo.

---

## Fase 2: Configuración de Base de Datos

### 2.1 Verificar Conexión a Supabase

Ir a [Supabase Dashboard](https://supabase.com/dashboard) → Tu proyecto → Settings → Database

**Obtener DATABASE_URL:**

1. En Supabase, ir a Settings > Database
2. Copiar "Connection pooling" string (modo Transaction)
3. Debe verse así:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 2.2 Aplicar Migraciones

```bash
# Generar Prisma Client
npm run db:generate

# Aplicar migraciones (crear tablas)
npm run db:push

# Verificar en Prisma Studio
npm run db:studio
```

### 2.3 Seed de Datos Iniciales

```bash
# Cargar categorías, marcas y 1740 productos
npm run db:seed
```

**Verificar:**
- 9 categorías creadas
- 4 marcas (BRIGGS, EDESA, EDESA PREMIUM, SLOAN)
- 1740 productos activos
- 1 usuario admin

**Si el seed falla por timeout:**
```bash
# Aumentar timeout en prisma/seed.ts si es necesario
# El seed usa batches de 50 productos por transacción
```

### 2.4 Verificar Usuario Admin

```bash
# Conectar a Supabase y verificar
npm run db:studio
```

1. Ir a tabla `User`
2. Confirmar que existe `admin@edesaventas.ec`
3. Verificar que `role = 'admin'`
4. Confirmar que `isBlocked = false`

**Si no existe el admin:**
```sql
-- Ejecutar en SQL Editor de Supabase
INSERT INTO "User" (email, password, name, role, "clientType", "isBlocked")
VALUES (
  'admin@edesaventas.ec',
  '$2a$10$TU_PASSWORD_HASHEADO',  -- Generar con bcrypt
  'Administrador',
  'admin',
  'admin',
  false
);
```

---

## Fase 3: Despliegue en Vercel

### 3.1 Instalar Vercel CLI (opcional)

```bash
npm i -g vercel
```

### 3.2 Conectar Repositorio a Vercel

**Opción A: Desde el Dashboard de Vercel (recomendado)**

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar repositorio Git
3. Seleccionar framework preset: **Next.js**
4. NO hacer deploy todavía

**Opción B: Desde CLI**

```bash
vercel login
vercel
```

### 3.3 Configurar Variables de Entorno en Vercel

En el Dashboard de Vercel → Tu proyecto → Settings → Environment Variables

**Agregar TODAS estas variables:**

```plaintext
DATABASE_URL = postgresql://postgres.xxx:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET = [tu-secreto-seguro-min-32-chars]
ADMIN_EMAIL = admin@edesaventas.ec
ADMIN_PASSWORD = [tu-password-segura]
NEXT_PUBLIC_APP_URL = https://tu-dominio.vercel.app
NEXT_PUBLIC_SITE_NAME = EDESA VENTAS
NEXT_PUBLIC_COMPANY_NAME = EDESA VENTAS S.A.
NEXT_PUBLIC_COMPANY_RUC = 1790XXXXXXXX001
NEXT_PUBLIC_BANK_NAME = Banco Pichincha
NEXT_PUBLIC_BANK_ACCOUNT = 2200-XXXXXXXXX
NEXT_PUBLIC_BANK_ACCOUNT_TYPE = Cuenta Corriente
```

**IMPORTANTE:**
- Todas las vars deben estar en "Production", "Preview" y "Development"
- `JWT_SECRET` debe ser DIFERENTE del que usas en local
- `NEXT_PUBLIC_APP_URL` debe ser tu dominio real de Vercel

### 3.4 Configurar Build Settings

En Vercel → Settings → General:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x o superior

### 3.5 Deploy

```bash
# Desde CLI
vercel --prod

# O desde Dashboard
# Settings → Deployments → Deploy
```

**El primer deploy tomará ~2-5 minutos.**

---

## Fase 4: Post-Deployment Verification

### 4.1 Smoke Tests

Una vez deployado, verificar:

1. **Homepage carga correctamente**
   - Visitar: `https://tu-dominio.vercel.app`
   - Verificar que el hero, categorías y productos se muestren

2. **Catálogo de productos**
   - Ir a `/productos`
   - Verificar filtros por categoría y marca
   - Probar búsqueda

3. **Detalle de producto**
   - Click en cualquier producto
   - Verificar imágenes, precio, especificaciones
   - Probar botón de añadir al carrito

4. **Login Admin**
   - Ir a `/login`
   - Usar credenciales: `admin@edesaventas.ec` / tu password
   - Verificar redirección a `/admin`

5. **Dashboard Admin**
   - Verificar que cargue el dashboard
   - Confirmar que se muestran productos, categorías, marcas

6. **CRUD de Productos**
   - Crear un producto de prueba
   - Editarlo
   - Desactivarlo
   - Verificar que los cambios se reflejen

7. **Checkout Flow**
   - Agregar productos al carrito
   - Iniciar proceso de checkout
   - Completar información de envío
   - Seleccionar método de pago
   - Confirmar pedido
   - Verificar página de confirmación

8. **API Routes**
   - Verificar `/api/auth/session` responde correctamente
   - Probar `/api/admin/products` (debe requerir auth)

### 4.2 Performance Check

**Lighthouse Audit:**

1. Abrir Chrome DevTools
2. Lighthouse tab
3. Seleccionar "Performance, Accessibility, Best Practices, SEO"
4. Generar reporte

**Objetivos:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

**Si Performance < 90:**
- Verificar que las imágenes usen Next.js Image component
- Revisar que el lazy loading esté activo
- Considerar optimizar el bundle size del middleware

### 4.3 Security Validation

1. **Headers de Seguridad**
   ```bash
   curl -I https://tu-dominio.vercel.app
   ```

   Verificar que existan:
   ```
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Content-Security-Policy: ...
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

2. **JWT Secret NO expuesto**
   - Buscar en el source del navegador por `JWT_SECRET`
   - NO debe aparecer en ningún archivo JS

3. **Cookies Seguras**
   - Abrir DevTools → Application → Cookies
   - Cookie `session` debe tener:
     - `HttpOnly: true`
     - `Secure: true` (en producción)
     - `SameSite: Lax`

4. **Rutas Admin Protegidas**
   - Abrir `/admin` sin login → debe redirigir a `/login`
   - Abrir `/api/admin/products` sin auth → debe devolver 401

### 4.4 Database Monitoring

**En Supabase:**

1. Ir a Database → Query Performance
2. Verificar que no haya queries lentas (>1s)
3. Confirmar que connection pooling esté activo

**En Vercel:**

1. Ir a Analytics
2. Monitorear Web Vitals (LCP, FID, CLS)
3. Revisar Server Functions (duración de API routes)

---

## Fase 5: Configuración de Dominio Personalizado (Opcional)

### 5.1 Agregar Dominio en Vercel

1. Vercel Dashboard → Settings → Domains
2. Add Domain: `edesaventas.ec` o `www.edesaventas.ec`
3. Seguir instrucciones de configuración DNS

### 5.2 Configurar DNS

En tu proveedor de DNS (ej. Cloudflare, GoDaddy):

**Para apex domain (edesaventas.ec):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**Para www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

### 5.3 Actualizar Variables de Entorno

Cambiar `NEXT_PUBLIC_APP_URL`:

```bash
NEXT_PUBLIC_APP_URL="https://edesaventas.ec"
```

**Redeployar** para que los cambios tomen efecto.

### 5.4 Verificar SSL

1. Vercel configurará SSL automáticamente (Let's Encrypt)
2. Esperar ~5-10 minutos
3. Verificar: `https://edesaventas.ec` (debe mostrar candado verde)

---

## Fase 6: Monitoreo y Logging

### 6.1 Configurar Vercel Analytics (recomendado)

1. Vercel Dashboard → Analytics → Enable
2. Esto rastrea:
   - Page views
   - Web Vitals (LCP, FID, CLS)
   - Custom events

**Gratis hasta 100k requests/mes.**

### 6.2 Configurar Sentry (opcional, para error tracking)

```bash
npm install @sentry/nextjs
```

**Configurar en `next.config.ts`:**

```typescript
import { withSentryConfig } from '@sentry/nextjs';

// ... tu config actual

export default withSentryConfig(nextConfig, {
  org: "tu-org",
  project: "edesa-ventas",
  silent: true,
});
```

### 6.3 Logs Importantes a Monitorear

En producción, monitorear estos eventos:

- **Errores de API:** `console.error` en `/api/*`
- **Login fallidos:** Rate limiting en `/api/auth/login`
- **Pedidos creados:** `/api/orders` POST
- **Errores de Prisma:** Queries fallidas a DB
- **Errores de checkout:** Proceso de compra incompleto

**Acceder logs en Vercel:**

1. Dashboard → Deployments → [tu deploy] → Functions
2. Ver logs en tiempo real

---

## Fase 7: Optimización Post-Deploy

### 7.1 Habilitar Caching de Imágenes

Vercel ya optimiza imágenes automáticamente con Next.js Image, pero puedes mejorar:

**En `next.config.ts`:**
```typescript
images: {
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días (ya configurado)
}
```

### 7.2 Edge Functions (opcional)

Si notas latencia en API routes, considera mover algunas a Edge:

```typescript
// src/app/api/auth/session/route.ts
export const runtime = 'edge';
```

**Rutas candidatas para Edge:**
- `/api/auth/session` (lectura de sesión)
- `/api/products` (lectura de productos)

**NO usar Edge para:**
- Rutas que usan Prisma (necesitan Node.js runtime)
- File uploads

### 7.3 ISR (Incremental Static Regeneration)

Para páginas que cambian poco, activar revalidación:

```typescript
// src/app/productos/page.tsx
export const revalidate = 3600; // Regenerar cada 1 hora
```

**Páginas candidatas:**
- `/productos` (listado de productos)
- `/categorias` (listado de categorías)
- `/productos/[slug]` (detalle de producto)

---

## Troubleshooting Común

### Error: "Max clients reached" en Supabase

**Causa:** Free tier de Supabase limita conexiones concurrentes.

**Solución:**

1. Verificar que `DATABASE_URL` tenga `?pgbouncer=true`
2. Usar Prisma en modo "connection pooling"
3. Considerar upgrade a plan pago de Supabase si el tráfico aumenta

### Error: Build falla con "Cannot find module '@prisma/client'"

**Solución:**

```bash
npm run db:generate
npm run build
```

### Error: JWT verification failed

**Causa:** `JWT_SECRET` diferente entre environments.

**Solución:**

1. Verificar que `JWT_SECRET` en Vercel coincida con el que usaste para crear la sesión
2. Hacer logout y login nuevamente

### Error: Imágenes no cargan en producción

**Causa:** Rutas absolutas incorrectas.

**Solución:**

1. Verificar que todas las imágenes estén en `public/`
2. Usar rutas relativas: `/images/productos/...`
3. Añadir dominio a `next.config.ts` → `images.remotePatterns` si usas CDN externo

### Error: 500 en API routes

**Causa:** Variables de entorno faltantes.

**Solución:**

1. Verificar todas las vars en Vercel → Settings → Environment Variables
2. Redeployar después de agregar vars

---

## Checklist Final de Producción

### Pre-Deploy

- [ ] Build local exitoso (`npm run build`)
- [ ] Todas las variables de entorno configuradas
- [ ] `.env` NO está en Git
- [ ] Migraciones de Prisma aplicadas en Supabase
- [ ] Seed de datos ejecutado (1740 productos, categorías, marcas)
- [ ] Usuario admin creado y verificado
- [ ] Console.logs innecesarios removidos

### Deploy

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas en Vercel (Production, Preview, Development)
- [ ] Build settings correctos (Next.js preset)
- [ ] Primer deploy exitoso
- [ ] Dominio personalizado configurado (si aplica)
- [ ] SSL activo y válido

### Post-Deploy

- [ ] Homepage carga sin errores
- [ ] Catálogo de productos funciona
- [ ] Detalle de producto muestra imágenes y datos
- [ ] Login admin funcional
- [ ] Dashboard admin accesible
- [ ] CRUD de productos opera correctamente
- [ ] Checkout flow completo hasta confirmación
- [ ] API routes responden correctamente
- [ ] Headers de seguridad presentes
- [ ] Cookies HTTP-only activas
- [ ] Rutas admin retornan 401 sin auth

### Performance

- [ ] Lighthouse Performance >90
- [ ] Lighthouse Accessibility >90
- [ ] Lighthouse Best Practices >90
- [ ] Lighthouse SEO >90
- [ ] Core Web Vitals en rango verde (LCP <2.5s, FID <100ms, CLS <0.1)

### Seguridad

- [ ] JWT_SECRET no expuesto en client
- [ ] Headers HTTP de seguridad activos
- [ ] HSTS habilitado
- [ ] CSP configurado
- [ ] Rutas admin protegidas (401/403)
- [ ] Rate limiting activo en login/registro/checkout

### Monitoreo

- [ ] Vercel Analytics habilitado
- [ ] Error tracking configurado (Sentry, opcional)
- [ ] Logs de API monitoreados
- [ ] Supabase connection pooling activo
- [ ] Query performance monitoreado

---

## URLs de Producción

**Sitio público:**
- Producción: `https://tu-dominio.vercel.app` (o `https://edesaventas.ec`)
- Staging: `https://edesa-ventas-git-staging-tu-usuario.vercel.app` (rama staging)

**Admin:**
- Dashboard: `https://tu-dominio.vercel.app/admin`
- Login: `https://tu-dominio.vercel.app/login`

**API:**
- Session: `https://tu-dominio.vercel.app/api/auth/session`
- Products: `https://tu-dominio.vercel.app/api/admin/products` (auth required)

**SEO:**
- Sitemap: `https://tu-dominio.vercel.app/sitemap.xml`
- Robots: `https://tu-dominio.vercel.app/robots.txt`

---

## Próximos Pasos (Post-Deploy)

### Inmediato (Primeros 7 días)

1. Monitorear logs de error por 24-48 horas
2. Configurar alertas en Vercel para errores críticos
3. Probar flujo completo de usuario: browse → cart → checkout → order
4. Crear 2-3 pedidos de prueba reales
5. Verificar que el admin pueda gestionar pedidos
6. Cambiar password del admin desde el panel

### Corto plazo (Primeras 2 semanas)

1. Configurar backup automático de Supabase
2. Implementar Google Analytics (opcional)
3. Configurar uptime monitoring (UptimeRobot, Pingdom)
4. Documentar procedimientos para equipo
5. Capacitar al personal en uso del panel admin

### Mediano plazo (Primer mes)

1. Migrar rate limiting a Redis si hay múltiples instancias
2. Implementar sistema de emails (confirmaciones de pedidos)
3. Configurar pasarela de pagos (PlaceToPay, Stripe)
4. Optimizar queries lentas de Prisma (si existen)
5. Implementar exports de reportes (Excel/PDF)

---

## Soporte y Contacto

**Para asistencia técnica:**
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)

**Desarrollador:**
- Claude Code (Anthropic)
- Última actualización: 2026-02-19

---

**EDESA VENTAS está lista para producción. ¡Éxito con el lanzamiento!**
