# EDESA VENTAS - Production Deployment Checklist

Checklist rápido para verificar antes de desplegar a producción.

---

## Pre-Deployment

### 1. Build Local
- [ ] `npm run build` compila sin errores
- [ ] Verificar que no hay warnings críticos en build
- [ ] Build genera 34 rutas correctamente

### 2. Variables de Entorno
- [ ] `.env.example` está completo y documentado
- [ ] `.env` NO está en Git (verificar `.gitignore`)
- [ ] Todas las variables NEXT_PUBLIC_* están documentadas
- [ ] `JWT_SECRET` tiene mínimo 32 caracteres aleatorios
- [ ] `DATABASE_URL` apunta a Supabase con `?pgbouncer=true`
- [ ] Datos bancarios (`NEXT_PUBLIC_BANK_*`) están completos
- [ ] Datos de empresa (`NEXT_PUBLIC_COMPANY_*`) están completos

### 3. Base de Datos
- [ ] Conexión a Supabase funciona
- [ ] Migraciones de Prisma aplicadas (`npm run db:push`)
- [ ] Seed ejecutado exitosamente (`npm run db:seed`)
- [ ] Verificar en Prisma Studio:
  - [ ] 9 categorías
  - [ ] 4 marcas (BRIGGS, EDESA, EDESA PREMIUM, SLOAN)
  - [ ] 1740 productos activos
  - [ ] Usuario admin existe y `isBlocked = false`

### 4. Código Limpio
- [ ] Console.logs de debug removidos (mantener console.error)
- [ ] Dead code removido
- [ ] Comentarios de desarrollo limpiados
- [ ] Código formateado (`npm run lint`)

### 5. Seguridad
- [ ] Headers HTTP configurados en `next.config.ts` y `middleware.ts`
- [ ] JWT cookies con `httpOnly: true` y `secure: true` en producción
- [ ] Rate limiting activo en login, registro y checkout
- [ ] CSP configurado correctamente
- [ ] Rutas admin protegidas con `requireAdmin()`

---

## Deployment (Vercel)

### 1. Configuración Inicial
- [ ] Repositorio conectado a Vercel
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node version: 18.x o superior

### 2. Variables de Entorno en Vercel
Configurar en Vercel Dashboard > Settings > Environment Variables:

**Obligatorias:**
- [ ] `DATABASE_URL` (con `?pgbouncer=true`)
- [ ] `JWT_SECRET` (DIFERENTE del desarrollo)
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`
- [ ] `NEXT_PUBLIC_APP_URL` (URL de producción)
- [ ] `NEXT_PUBLIC_SITE_NAME`
- [ ] `NEXT_PUBLIC_COMPANY_NAME`
- [ ] `NEXT_PUBLIC_COMPANY_RUC`
- [ ] `NEXT_PUBLIC_BANK_NAME`
- [ ] `NEXT_PUBLIC_BANK_ACCOUNT`
- [ ] `NEXT_PUBLIC_BANK_ACCOUNT_TYPE`

**Aplicar a:**
- [ ] Production
- [ ] Preview
- [ ] Development

### 3. Deploy
- [ ] Hacer deploy inicial: `vercel --prod` o desde Dashboard
- [ ] Build exitoso (2-5 minutos)
- [ ] Deployment URL accesible

---

## Post-Deployment Verification

### 1. Smoke Tests Básicos
- [ ] Homepage carga (`/`)
- [ ] Hero, categorías y productos se muestran
- [ ] Catálogo de productos funciona (`/productos`)
- [ ] Filtros por categoría y marca operan
- [ ] Búsqueda funcional
- [ ] Detalle de producto carga (`/productos/[slug]`)
- [ ] Imágenes se muestran correctamente
- [ ] Carrito funciona (agregar/quitar productos)

### 2. Autenticación
- [ ] Login admin funciona (`/login`)
- [ ] Redirección a `/admin` después de login
- [ ] Dashboard admin carga
- [ ] Logout funcional
- [ ] Rutas admin retornan 401 sin auth
- [ ] Rutas admin retornan 403 para usuarios no-admin

### 3. CRUD Admin
- [ ] Crear producto nuevo
- [ ] Editar producto existente
- [ ] Subir imagen de producto
- [ ] Desactivar/activar producto
- [ ] Ver lista de categorías
- [ ] Ver lista de marcas
- [ ] Gestión de usuarios (crear, editar, bloquear)

### 4. Checkout Flow
- [ ] Agregar productos al carrito
- [ ] Iniciar checkout
- [ ] Completar información personal
- [ ] Completar información de envío
- [ ] Seleccionar método de pago
- [ ] Confirmar pedido
- [ ] Ver página de confirmación con datos bancarios
- [ ] Pedido creado en base de datos (verificar en admin)

### 5. API Routes
- [ ] `/api/auth/session` responde correctamente
- [ ] `/api/admin/products` requiere autenticación (401 sin token)
- [ ] `/api/orders` POST crea pedido correctamente
- [ ] `/api/orders/[id]` GET retorna pedido (solo admin)

### 6. Seguridad
Verificar headers HTTP con `curl -I https://tu-dominio.vercel.app`:
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Content-Security-Policy: ...`
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

Verificar cookies en DevTools > Application > Cookies:
- [ ] Cookie `session` existe
- [ ] `HttpOnly: true`
- [ ] `Secure: true` (solo en producción HTTPS)
- [ ] `SameSite: Lax`

### 7. Performance (Lighthouse)
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

Core Web Vitals:
- [ ] LCP (Largest Contentful Paint): <2.5s
- [ ] FID (First Input Delay): <100ms
- [ ] CLS (Cumulative Layout Shift): <0.1

### 8. SEO
- [ ] Sitemap accesible (`/sitemap.xml`)
- [ ] Robots.txt accesible (`/robots.txt`)
- [ ] Meta tags correctos (verificar con View Source)
- [ ] Open Graph tags presentes
- [ ] Twitter Card tags presentes
- [ ] Canonical URL correcto

### 9. Database
En Supabase Dashboard:
- [ ] Connection pooling activo
- [ ] No hay queries lentas (>1s)
- [ ] Conexiones no exceden el límite
- [ ] Logs no muestran errores de conexión

En Vercel Dashboard:
- [ ] Functions (API routes) responden en <1s
- [ ] No hay errores 500 en logs
- [ ] Web Vitals en rango verde

---

## Dominio Personalizado (Opcional)

### 1. Configurar Dominio
- [ ] Agregar dominio en Vercel > Settings > Domains
- [ ] Configurar DNS en proveedor:
  - [ ] A record para apex domain → `76.76.21.21`
  - [ ] CNAME para www → `cname.vercel-dns.com`
- [ ] Esperar propagación DNS (5-15 minutos)

### 2. SSL
- [ ] SSL configurado automáticamente por Vercel
- [ ] Certificado válido (candado verde en navegador)
- [ ] HTTPS funciona correctamente
- [ ] HTTP redirige a HTTPS

### 3. Actualizar Variables
- [ ] `NEXT_PUBLIC_APP_URL` actualizado a dominio personalizado
- [ ] Redeployar para aplicar cambios

---

## Monitoreo

### 1. Analytics
- [ ] Vercel Analytics habilitado
- [ ] Métricas de page views rastreadas
- [ ] Web Vitals monitoreados

### 2. Error Tracking (Opcional)
- [ ] Sentry configurado (si se decide usar)
- [ ] Errores de producción se reportan
- [ ] Notificaciones configuradas

### 3. Uptime Monitoring (Opcional)
- [ ] Servicio configurado (UptimeRobot, Pingdom, etc.)
- [ ] Alertas por email/SMS si el sitio cae
- [ ] Check cada 5 minutos

---

## Post-Deploy Actions

### Primeras 24 Horas
- [ ] Monitorear logs de Vercel por errores
- [ ] Verificar que no haya picos de errores 500
- [ ] Probar flujo completo 3 veces:
  1. Usuario no autenticado: browse → intenta comprar → se le pide login
  2. Usuario ferretería: login → ve precios mayoristas → compra → confirma
  3. Admin: login → gestiona productos → gestiona pedidos

### Primera Semana
- [ ] Cambiar password del admin desde el panel
- [ ] Crear 2-3 usuarios de prueba (ferretería, minorista)
- [ ] Procesar 5-10 pedidos de prueba completos
- [ ] Verificar que los emails de confirmación lleguen (si implementado)
- [ ] Revisar analytics: page views, bounce rate, conversiones

### Primer Mes
- [ ] Configurar backup automático de Supabase
- [ ] Documentar procedimientos para el equipo
- [ ] Capacitar personal en uso del admin
- [ ] Optimizar queries lentas (si existen)
- [ ] Considerar plan pago de Supabase si tráfico aumenta

---

## Rollback Plan

Si algo falla durante el deploy:

1. **Desde Vercel Dashboard:**
   - Deployments > [deployment anterior] > Promote to Production

2. **Desde CLI:**
   ```bash
   vercel rollback
   ```

3. **Verificar que el rollback funcionó:**
   - Probar homepage
   - Probar login admin
   - Verificar que la DB siga accesible

4. **Investigar el error:**
   - Revisar logs en Vercel
   - Verificar variables de entorno
   - Verificar conexión a DB
   - Corregir localmente y redeployar

---

## Contactos de Soporte

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://prisma.io/docs

---

**Última actualización:** 2026-02-19
**Mantenido por:** Claude Code (Anthropic)

**El proyecto está production-ready cuando TODOS los checkboxes estén marcados.**
