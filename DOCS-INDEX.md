# EDESA VENTAS - Índice de Documentación

Guía de navegación rápida para toda la documentación del proyecto.

---

## Para Empezar

### Si eres nuevo en el proyecto

1. **[README.md](./README.md)** - Empieza aquí
   - Qué es EDESA VENTAS
   - Características principales
   - Stack tecnológico
   - Instalación local

### Si vas a desplegar a producción

2. **[PRODUCTION-READY.md](./PRODUCTION-READY.md)** - Resumen ejecutivo
   - Estado del proyecto
   - Funcionalidades completadas
   - Costos estimados
   - Riesgos y mitigaciones

3. **[VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md)** - Quick start (10 min)
   - Pasos mínimos para deploy
   - Configuración de Vercel
   - Variables de entorno
   - Troubleshooting rápido

4. **[PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md)** - Checklist paso a paso
   - Pre-deployment
   - Deployment
   - Post-deployment verification
   - Performance y seguridad

5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa
   - Auditoría exhaustiva
   - Configuración detallada
   - Troubleshooting avanzado
   - Monitoreo y logging

---

## Por Tipo de Usuario

### Desarrolladores

- **[CLAUDE.md](./CLAUDE.md)** - Comandos y arquitectura
  - Scripts npm disponibles
  - Estructura del proyecto
  - Convenciones de código
  - Patrones de desarrollo

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guía de desarrollo
  - Setup local completo
  - Database con Prisma
  - Testing (cuando se implemente)

- **[.env.example](./.env.example)** - Variables de entorno
  - Todas las vars documentadas
  - Dónde obtener cada valor
  - Notas de seguridad

### DevOps / SRE

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy completo
- **[PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md)** - Verificación
- **[pre-deploy-check.sh](./pre-deploy-check.sh)** - Script de verificación
  ```bash
  ./pre-deploy-check.sh
  ```

### Gerencia / Stakeholders

- **[PRODUCTION-READY.md](./PRODUCTION-READY.md)** - Estado del proyecto
  - Funcionalidades
  - Costos
  - Timeline
  - Próximos pasos

- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - Resumen técnico
  - Trabajo realizado
  - Verificaciones completadas
  - Métricas de éxito

---

## Por Fase del Proyecto

### Fase 1: Desarrollo Local

1. [README.md](./README.md) - Instalación
2. [CLAUDE.md](./CLAUDE.md) - Comandos
3. [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup completo
4. [.env.example](./.env.example) - Variables

### Fase 2: Pre-Deployment

1. [PRODUCTION-READY.md](./PRODUCTION-READY.md) - Verificar estado
2. [pre-deploy-check.sh](./pre-deploy-check.sh) - Ejecutar checks
3. [DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md) - Revisar trabajo

### Fase 3: Deployment

1. [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Quick start
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Referencia completa
3. [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) - Verificación

### Fase 4: Post-Deployment

1. [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) - Smoke tests
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Monitoreo y optimización
3. [README.md](./README.md) - Próximos pasos (Fase 2)

---

## Archivos de Configuración

### Next.js
- **[next.config.ts](./next.config.ts)** - Configuración de Next.js
  - Headers de seguridad
  - Optimización de imágenes
  - Cache control

- **[src/middleware.ts](./src/middleware.ts)** - Middleware
  - Protección de rutas
  - Headers HTTP
  - Auth checks

### Base de Datos
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Schema de DB
  - Modelos (Product, Category, Brand, User, Order, etc.)
  - Relaciones
  - Indexes

- **[src/lib/prisma.ts](./src/lib/prisma.ts)** - Prisma client
  - Singleton pattern
  - Logging condicional
  - Error handling

### TypeScript
- **[tsconfig.json](./tsconfig.json)** - Configuración de TS
  - Path aliases (@/*)
  - Compiler options
  - Strict mode

### Tailwind CSS
- **[src/app/globals.css](./src/app/globals.css)** - Estilos globales
  - Tailwind v4 inline theme
  - Custom properties
  - Color palette

---

## Scripts Útiles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Linter
npm run lint
```

### Base de Datos

```bash
# Generar Prisma client
npm run db:generate

# Aplicar migraciones
npm run db:push

# Seed de datos
npm run db:seed

# Abrir Prisma Studio
npm run db:studio

# Reset completo
npm run db:reset
```

### Pre-Deploy

```bash
# Verificar que todo esté listo
./pre-deploy-check.sh

# Build + verificación completa
npm run build && npm run lint
```

---

## Mapa de Funcionalidades

### Tienda Pública (/)

**Componentes:**
- [src/app/(main)/page.tsx](./src/app/(main)/page.tsx) - Homepage
- [src/app/(main)/productos/page.tsx](./src/app/(main)/productos/page.tsx) - Catálogo
- [src/app/(main)/productos/[slug]/page.tsx](./src/app/(main)/productos/[slug]/page.tsx) - Detalle
- [src/app/(main)/carrito/page.tsx](./src/app/(main)/carrito/page.tsx) - Carrito
- [src/app/(main)/checkout/\*](./src/app/(main)/checkout/) - Checkout

**Contextos:**
- [src/context/CartContext.tsx](./src/context/CartContext.tsx) - Estado del carrito
- [src/context/CheckoutContext.tsx](./src/context/CheckoutContext.tsx) - Estado checkout
- [src/context/AuthContext.tsx](./src/context/AuthContext.tsx) - Sesión usuario

### Panel Admin (/admin)

**Componentes:**
- [src/app/admin/page.tsx](./src/app/admin/page.tsx) - Dashboard
- [src/app/admin/productos/page.tsx](./src/app/admin/productos/page.tsx) - Gestión productos
- [src/app/admin/pedidos/page.tsx](./src/app/admin/pedidos/page.tsx) - Gestión pedidos
- [src/app/admin/usuarios/page.tsx](./src/app/admin/usuarios/page.tsx) - Gestión usuarios

**API Routes:**
- [src/app/api/admin/products/\*](./src/app/api/admin/products/) - CRUD productos
- [src/app/api/admin/usuarios/\*](./src/app/api/admin/usuarios/) - CRUD usuarios
- [src/app/api/orders/\*](./src/app/api/orders/) - Gestión pedidos
- [src/app/api/auth/\*](./src/app/api/auth/) - Autenticación

### Autenticación

**Core:**
- [src/lib/auth.ts](./src/lib/auth.ts) - JWT, sessions, cookies
- [src/middleware.ts](./src/middleware.ts) - Route protection
- [src/app/login/page.tsx](./src/app/login/page.tsx) - Login UI
- [src/app/register/page.tsx](./src/app/register/page.tsx) - Registro

---

## Preguntas Frecuentes

### Dónde está la documentación de...

**Deploy a producción?**
→ [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) (rápido) o [DEPLOYMENT.md](./DEPLOYMENT.md) (completo)

**Variables de entorno?**
→ [.env.example](./.env.example)

**Comandos npm?**
→ [CLAUDE.md](./CLAUDE.md) sección Commands

**Arquitectura del proyecto?**
→ [CLAUDE.md](./CLAUDE.md) sección Architecture

**Troubleshooting?**
→ [DEPLOYMENT.md](./DEPLOYMENT.md) sección Troubleshooting

**Costos de hosting?**
→ [PRODUCTION-READY.md](./PRODUCTION-READY.md) sección Costos

**Próximos pasos?**
→ [README.md](./README.md) sección "Por Implementar (Fase 2)"

### Qué archivo leer si...

**Voy a hacer el primer deploy**
→ [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md)

**Necesito verificar si está listo**
→ Ejecutar `./pre-deploy-check.sh`

**Soy stakeholder no técnico**
→ [PRODUCTION-READY.md](./PRODUCTION-READY.md)

**Necesito troubleshooting**
→ [DEPLOYMENT.md](./DEPLOYMENT.md) sección "Troubleshooting Común"

**Quiero entender la arquitectura**
→ [CLAUDE.md](./CLAUDE.md)

**Necesito configurar variables**
→ [.env.example](./.env.example)

---

## Árbol de Decisión

```
¿Qué necesitas hacer?
│
├─ Instalar localmente
│  └─> README.md → CLAUDE.md → .env.example
│
├─ Entender el proyecto
│  └─> README.md → CLAUDE.md → DEVELOPMENT.md
│
├─ Desplegar a producción
│  ├─ Rápido (10 min)
│  │  └─> VERCEL-DEPLOY.md
│  │
│  ├─ Completo (con verificación)
│  │  └─> PRODUCTION-CHECKLIST.md → DEPLOYMENT.md
│  │
│  └─ Verificar estado
│     └─> ./pre-deploy-check.sh → PRODUCTION-READY.md
│
├─ Troubleshooting
│  └─> DEPLOYMENT.md (sección Troubleshooting)
│
├─ Presentar a stakeholders
│  └─> PRODUCTION-READY.md → DEPLOYMENT-SUMMARY.md
│
└─ Desarrollar nuevas features
   └─> CLAUDE.md → DEVELOPMENT.md → prisma/schema.prisma
```

---

## Contactos y Recursos

**Documentación Externa:**
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Prisma: https://prisma.io/docs
- Supabase: https://supabase.com/docs

**Soporte:**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support

**Desarrollado por:**
Claude Sonnet 4.5 (Anthropic)
Production Deployment Specialist

---

**Última actualización:** 2026-02-19
**Versión:** 1.0.0 (Production Ready)
