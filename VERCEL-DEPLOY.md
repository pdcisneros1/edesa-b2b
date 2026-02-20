# Deploy Rápido a Vercel

Guía paso a paso para desplegar EDESA VENTAS en Vercel en menos de 10 minutos.

---

## Paso 1: Preparación Local (2 minutos)

1. Verificar que el build funciona:
```bash
npm run build
```

2. Confirmar que `.env` NO esté en Git:
```bash
git status
# .env NO debe aparecer en la lista
```

3. Verificar que todas las variables estén en `.env.example`:
```bash
cat .env.example
```

---

## Paso 2: Crear Proyecto en Vercel (3 minutos)

### Opción A: Desde el Dashboard (recomendado)

1. Ir a [vercel.com/new](https://vercel.com/new)

2. Importar repositorio Git:
   - Conectar GitHub/GitLab/Bitbucket
   - Seleccionar repositorio `edesa-ventas`

3. Configurar proyecto:
   - **Framework Preset:** Next.js (autodetectado)
   - **Root Directory:** `./` (dejar vacío)
   - **Build Command:** `npm run build` (autodetectado)
   - **Output Directory:** `.next` (autodetectado)
   - **Install Command:** `npm install` (autodetectado)

4. NO hacer deploy todavía - ir a "Environment Variables" primero

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Iniciar deploy interactivo
vercel

# Seguir prompts (NO deployar todavía)
```

---

## Paso 3: Configurar Variables de Entorno (3 minutos)

En Vercel Dashboard → Settings → Environment Variables

Agregar estas variables (copiar de tu `.env` local):

```bash
# Database
DATABASE_URL
# Ejemplo: postgresql://postgres.xxx:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Auth (IMPORTANTE: usar secreto DIFERENTE en producción)
JWT_SECRET
# Generar nuevo: openssl rand -base64 48

# Admin inicial
ADMIN_EMAIL
ADMIN_PASSWORD

# App URLs
NEXT_PUBLIC_APP_URL
# Ejemplo: https://edesa-ventas.vercel.app (cambiar después si usas dominio custom)

NEXT_PUBLIC_SITE_NAME
# Ejemplo: EDESA VENTAS

# Company Info
NEXT_PUBLIC_COMPANY_NAME
NEXT_PUBLIC_COMPANY_RUC
NEXT_PUBLIC_BANK_NAME
NEXT_PUBLIC_BANK_ACCOUNT
NEXT_PUBLIC_BANK_ACCOUNT_TYPE
```

**IMPORTANTE:** Aplicar a todos los environments:
- [x] Production
- [x] Preview
- [x] Development

---

## Paso 4: Deploy (1 minuto)

### Desde Dashboard:

1. Click "Deploy" en la parte superior
2. Esperar 2-5 minutos
3. Ver progreso en tiempo real

### Desde CLI:

```bash
vercel --prod
```

---

## Paso 5: Verificación Post-Deploy (1 minuto)

Una vez deployado, Vercel te dará una URL: `https://edesa-ventas-xxx.vercel.app`

### Quick Smoke Test:

1. Abrir la URL en el navegador
2. Verificar que la homepage carga
3. Ir a `/login`
4. Login con admin: `admin@edesaventas.ec` / tu password
5. Verificar que redirige a `/admin`
6. Logout

**Si todo funciona → Deploy exitoso.**

---

## Configuración Adicional (Opcional)

### A. Dominio Personalizado

1. Vercel Dashboard → Settings → Domains
2. Add Domain: `edesaventas.ec`
3. Configurar DNS según instrucciones
4. Esperar 5-15 minutos para propagación
5. Actualizar `NEXT_PUBLIC_APP_URL` a `https://edesaventas.ec`
6. Redeployar

### B. Analytics

1. Vercel Dashboard → Analytics
2. Enable Analytics
3. Gratis hasta 100k requests/mes

### C. Configurar Git Branch para Preview

Por defecto, Vercel crea preview deploy para cada push a cualquier branch.

Para limitar a branch específico:
1. Settings → Git → Production Branch: `main`
2. Settings → Git → Ignored Build Step: configurar si es necesario

---

## Troubleshooting Rápido

### Error: Build Failed

**Causa común:** Variables de entorno faltantes

**Solución:**
1. Ir a Settings → Environment Variables
2. Verificar que TODAS las variables estén configuradas
3. Redeployar: Deployments → [último deploy] → Redeploy

### Error: Database Connection Failed

**Causa común:** `DATABASE_URL` mal configurado

**Solución:**
1. Verificar que DATABASE_URL tenga `?pgbouncer=true` al final
2. Verificar que la password sea correcta
3. En Supabase, ir a Settings → Database → Connection pooling
4. Copiar el string completo (Transaction mode)
5. Actualizar en Vercel → Settings → Environment Variables
6. Redeployar

### Error: 500 en Login

**Causa común:** `JWT_SECRET` faltante o mal configurado

**Solución:**
1. Generar nuevo JWT_SECRET: `openssl rand -base64 48`
2. Agregar en Vercel → Environment Variables
3. Redeployar

### Build OK pero páginas no cargan datos

**Causa común:** Supabase bloqueando requests (free tier limit)

**Solución:**
1. Verificar en Supabase Dashboard → Database → Connection pooling
2. Considerar upgrade a plan pago si tráfico es alto
3. Por ahora, esperar unos minutos y reintentar

---

## Comandos Útiles CLI

```bash
# Ver logs en tiempo real
vercel logs https://edesa-ventas-xxx.vercel.app

# Ver deployments
vercel ls

# Rollback a deployment anterior
vercel rollback

# Abrir dashboard del proyecto
vercel

# Remover proyecto
vercel remove edesa-ventas
```

---

## Próximos Pasos

Después del deploy exitoso:

1. Cambiar password del admin desde `/admin/usuarios`
2. Crear usuarios de prueba (ferretería, minorista)
3. Procesar 2-3 pedidos de prueba
4. Verificar Lighthouse score (meta: >90)
5. Configurar monitoreo (Sentry, UptimeRobot)
6. Documentar para el equipo

---

## URLs Importantes

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Docs Next.js en Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Deployment Completo:** Ver `DEPLOYMENT.md`

---

**¡Listo para producción en 10 minutos!**

Última actualización: 2026-02-19
