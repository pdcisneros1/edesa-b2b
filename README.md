# EDESA VENTAS - E-Commerce B2B/B2C

E-commerce profesional para productos de acabados de construcción (sanitarios, griferías, lavamanos, etc.) en Ecuador.

![Next.js](https://img.shields.io/badge/Next.js-15.5.12-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000)
![Production Ready](https://img.shields.io/badge/Production-Ready-success)

---

## Estado del Proyecto

**LISTO PARA PRODUCCIÓN** - Ver [PRODUCTION-READY.md](./PRODUCTION-READY.md) para resumen ejecutivo.

**Documentación de Deployment:**
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Guía rápida (10 minutos)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa (exhaustiva)
- [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) - Checklist paso a paso

**Build status:** Compilando exitosamente (34 rutas, 0 errores)

---

## 📋 Tabla de Contenidos

- [Estado del Proyecto](#estado-del-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Panel de Administración](#-panel-de-administración)
- [Credenciales](#-credenciales)
- [Funcionalidades](#-funcionalidades)

**[Ver índice completo de documentación →](./DOCS-INDEX.md)**

---

## ✨ Características

### Para Clientes (Tienda)
- 🛒 Catálogo de productos con filtros avanzados
- 🔍 Búsqueda de productos
- 📱 Diseño responsive (móvil, tablet, desktop)
- 🛍️ Carrito de compras con persistencia
- 💳 Proceso de checkout completo
- 📄 Descarga de fichas técnicas en PDF
- 🏷️ Navegación por categorías y marcas
- ⭐ Productos destacados y nuevos
- 📊 Especificaciones técnicas detalladas
- 📲 Integración con WhatsApp

### Para Administradores (Panel Admin)
- 🔐 Autenticación segura con JWT
- 📊 Dashboard con análisis de ventas
- 💰 Gestión de rentabilidad (costos vs precios)
- 📈 Reportes por período (día/semana/mes/año)
- 🏪 Gestión completa de productos (CRUD)
- 📁 Gestión de categorías y marcas
- 🖼️ Subida de imágenes de productos
- 📄 Subida de fichas técnicas (PDF)
- 📦 Control de inventario
- 💹 Análisis de márgenes de ganancia
- 📊 Top productos más vendidos
- 🎯 Ventas por categoría

---

## 🛠 Tecnologías

### Frontend
- **Next.js 16.1.6** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos con OKLCH
- **shadcn/ui** - Componentes UI (Radix UI)
- **Lucide React** - Iconografía
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend
- **Next.js API Routes** - Endpoints REST
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Database (Supabase)
- **JWT con jose** - Autenticación
- **Bcrypt** - Password hashing
- **Rate Limiting** - Protección contra ataques

### Utilidades
- **Sonner** - Notificaciones toast
- **pdf2image** - Extracción de imágenes de PDFs
- **Poppler** - Procesamiento de PDFs

---

## 📥 Instalación

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- PostgreSQL database (Supabase recomendado)

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd edesa-ventas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase y JWT secret
```

4. **Configurar base de datos**
```bash
# Generar Prisma Client
npm run db:generate

# Aplicar migraciones (crear tablas)
npm run db:push

# Cargar datos iniciales (categorías, marcas, 1740 productos)
npm run db:seed
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en navegador**
```
http://localhost:3000
```

### Despliegue a Producción

Ver **[DEPLOYMENT.md](./DEPLOYMENT.md)** para guía completa de despliegue en Vercel + Supabase.

---

## 🚀 Uso

### Tienda (Público)
- **Inicio**: `http://localhost:3000`
- **Productos**: `http://localhost:3000/productos`
- **Categorías**: `http://localhost:3000/categorias`
- **Carrito**: `http://localhost:3000/carrito`
- **Checkout**: `http://localhost:3000/checkout`

### Panel de Administración
- **Login**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/admin`
- **Productos**: `http://localhost:3000/admin/productos`
- **Categorías**: `http://localhost:3000/admin/categorias`
- **Marcas**: `http://localhost:3000/admin/marcas`

---

## 🔑 Credenciales

### Administrador
- **Email**: `admin@edesaventas.ec`
- **Contraseña**: `Admin123!`

---

## 📁 Estructura del Proyecto

```
edesa-ventas/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── (main)/              # Grupo de rutas públicas
│   │   │   ├── layout.tsx       # Layout con Header/Footer
│   │   │   ├── page.tsx         # Página de inicio
│   │   │   ├── productos/       # Catálogo de productos
│   │   │   ├── categorias/      # Navegación por categorías
│   │   │   ├── carrito/         # Carrito de compras
│   │   │   └── checkout/        # Proceso de compra
│   │   ├── admin/               # Panel de administración
│   │   │   ├── layout.tsx       # Layout admin protegido
│   │   │   ├── page.tsx         # Dashboard con analytics
│   │   │   ├── productos/       # Gestión de productos
│   │   │   ├── categorias/      # Gestión de categorías
│   │   │   └── marcas/          # Gestión de marcas
│   │   ├── api/                 # API Routes
│   │   │   └── admin/           # Endpoints admin
│   │   ├── login/               # Página de login
│   │   └── globals.css          # Estilos globales
│   ├── components/              # Componentes React
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Header, Footer, Nav
│   │   ├── home/                # Componentes del home
│   │   ├── products/            # Componentes de productos
│   │   ├── cart/                # Componentes del carrito
│   │   ├── checkout/            # Componentes de checkout
│   │   ├── admin/               # Componentes admin
│   │   └── shared/              # Componentes compartidos
│   ├── context/                 # React Context
│   │   └── CartContext.tsx      # Estado global del carrito
│   ├── lib/                     # Utilidades
│   │   ├── auth.ts              # Autenticación JWT
│   │   ├── data-store.ts        # CRUD de archivos JSON
│   │   ├── sales-analytics.ts   # Análisis de ventas
│   │   ├── format.ts            # Formateo de datos
│   │   └── utils.ts             # Utilidades generales
│   ├── types/                   # TypeScript types
│   │   ├── product.ts           # Tipos de productos
│   │   ├── sales.ts             # Tipos de ventas
│   │   └── index.ts             # Exportaciones
│   └── data/                    # Datos mock y JSON
│       ├── products.json        # Productos (20)
│       ├── categories.json      # Categorías (14)
│       ├── brands.json          # Marcas (2: EDESA, Briggs)
│       ├── mock-orders.ts       # Órdenes de ejemplo
│       └── mock-*.ts            # Otros datos mock
├── public/                      # Archivos estáticos
│   ├── images/                  # Imágenes
│   │   ├── products/            # Imágenes de productos
│   │   ├── catalog/             # 249 páginas del catálogo
│   │   ├── categories/          # Imágenes de categorías
│   │   └── brands/              # Logos de marcas
│   └── documents/               # Fichas técnicas (PDFs)
├── next.config.ts               # Configuración de Next.js
├── tailwind.config.ts           # Configuración de Tailwind
├── tsconfig.json                # Configuración de TypeScript
└── package.json                 # Dependencias
```

---

## 🎛 Panel de Administración

### Dashboard Principal

El dashboard tiene **2 pestañas principales**:

#### 📊 Análisis de Ventas

**Métricas Principales:**
- 💰 **Ingresos Totales** - Ventas del período
- 📦 **Costos Totales** - Costo de productos vendidos
- 💵 **Ganancia Neta** - Ingresos - Costos
- 📈 **Margen de Ganancia** - Porcentaje de rentabilidad

**Filtros:**
- 📅 Por período: Hoy / Semana / Mes / Año
- 🏷️ Por categoría: Todas o específica

**Reportes:**
- 🏆 Top 10 productos más vendidos
- 📊 Ventas por categoría con gráficos
- 💹 Análisis de rentabilidad por producto
- 📈 Márgenes de ganancia con códigos de color:
  - 🟢 Verde: >30% (muy rentable)
  - 🟡 Amarillo: 20-30% (rentable)
  - 🔴 Rojo: <20% (baja rentabilidad)

#### 📦 Inventario

**Estadísticas:**
- Total de productos activos
- Valor total del inventario
- Productos destacados
- Alertas de stock bajo (<10 unidades)

### Gestión de Productos

**Crear/Editar Producto:**

1. **Información Básica**
   - SKU (único)
   - Nombre del producto
   - Slug (URL amigable, auto-generado)
   - Descripción corta y completa
   - Stock

2. **Precios y Costos**
   - 🏭 **Costo de Compra** - Lo que pagas al proveedor
   - 💲 **Precio de Venta** - Lo que cobras al cliente
   - 💰 **Precio de Comparación** - Precio antes del descuento
   - 📊 **Margen calculado automáticamente**

3. **Organización**
   - Categoría (requerida)
   - Marca (opcional: EDESA o Briggs)

4. **Estado**
   - ✅ Producto Activo
   - ⭐ Producto Destacado
   - 🆕 Producto Nuevo

5. **Multimedia**
   - 🖼️ **Imágenes** - Múltiples imágenes (JPG, PNG, WebP)
   - 📄 **Ficha Técnica** - PDF descargable

6. **Especificaciones Técnicas**
   - Pares clave-valor (Material, Dimensiones, Color, etc.)

---

## 🎯 Funcionalidades

### ✅ Implementadas

#### Tienda
- [x] Catálogo de productos con paginación
- [x] Filtros por categoría, marca, precio
- [x] Ordenamiento (nombre, precio, fecha)
- [x] Búsqueda de productos
- [x] Detalle de producto con galería
- [x] Especificaciones técnicas
- [x] Descarga de fichas técnicas (PDF)
- [x] Carrito de compras con localStorage
- [x] Proceso de checkout (4 pasos)
- [x] Navegación por categorías jerárquicas
- [x] Productos destacados y nuevos
- [x] Diseño responsive completo
- [x] Integración WhatsApp

#### Admin
- [x] Autenticación JWT
- [x] Dashboard con analytics de ventas
- [x] CRUD completo de productos
- [x] Gestión de categorías y marcas
- [x] Subida de imágenes
- [x] Subida de fichas técnicas (PDF)
- [x] Control de inventario
- [x] Gestión de costos y precios
- [x] Análisis de rentabilidad
- [x] Reportes por período
- [x] Top productos vendidos
- [x] Ventas por categoría
- [x] Cálculo de márgenes de ganancia

### ✅ Completado - Seguridad y B2B

- [x] Migración completa a Prisma + PostgreSQL (Supabase)
- [x] Sistema de autenticación B2B (admin, ferretería, minorista)
- [x] Protección de precios (PriceGate para usuarios no autenticados)
- [x] Gestión de órdenes de compra (Purchase Orders)
- [x] Gestión de usuarios y permisos (admin dashboard)
- [x] Rate limiting en login, registro y checkout
- [x] Headers HTTP de seguridad (CSP, HSTS, X-Frame-Options)
- [x] Sistema de pedidos real con estados (pendiente → confirmado → enviado → entregado)
- [x] Precios mayoristas diferenciados (wholesalePrice)
- [x] SEO optimizado (metadata, sitemap dinámico, robots.txt)

### 🚧 Por Implementar (Fase 2)

- [ ] Pasarela de pagos (PlaceToPay, Stripe)
- [ ] Sistema de emails (SMTP para confirmaciones de pedidos)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Exportación de reportes (Excel/PDF)
- [ ] Gestión de cupones/descuentos
- [ ] Sistema de reviews/reseñas
- [ ] Migración de rate limiting a Redis (multi-instancia)

---

## 🌍 Localización Ecuador

- 💵 Moneda: **USD (Dólares)**
- 📍 24 provincias ecuatorianas
- 📊 IVA: **15%**
- 📞 Contacto: **+593 2 234-5678**
- 📱 WhatsApp: **+593992686411**
- 📧 Email: **contacto@edesaventas.ec**

---

## 🎨 Diseño

### Paleta de Colores (EDESA Brand)
- **Primario**: Rojo (`oklch(0.55 0.22 25)`)
- **Secundario**: Gris Oscuro (`oklch(0.34 0 0)`)
- **Acento**: Negro (`oklch(0.22 0 0)`)

### Tipografía
- Sistema de fuentes nativas optimizado

### Breakpoints Responsive
- **Móvil**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

---

## 📊 Datos Mock

### Productos: 20
Incluye variedad de:
- Mingitorios
- Llaves/Griferías (baño y cocina)
- Lavabos
- Regaderas
- Accesorios

### Categorías: 14
Organizadas jerárquicamente:
- Sanitarios
  - Inodoros
  - Mingitorios
- Griferías
  - Griferías para Baño
  - Griferías para Cocina
- Lavamanos
  - Lavabos de Sobreponer
  - Lavabos Empotrados
- Y más...

### Marcas: 2
- **EDESA** - Marca principal
- **Briggs** - Marca asociada

### Órdenes: 7
Datos de ejemplo de los últimos 6 meses para análisis de ventas

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build           # Compilar para producción
npm run start           # Iniciar servidor de producción

# Utilidades
npm run lint            # Revisar código con ESLint
npm run type-check      # Verificar tipos TypeScript
```

---

## 📝 Notas Técnicas

### Autenticación
- Sistema JWT con cookies HttpOnly
- Sesiones de 7 días
- Rutas admin protegidas con middleware

### Almacenamiento
- **Actual**: Archivos JSON en `/src/data/`
- **Futuro**: PostgreSQL + Prisma ORM

### Imágenes
- Subidas a `/public/images/products/`
- Optimización automática con Next.js Image
- Soporte: JPG, PNG, WebP (máx 5MB)

### PDFs
- Subidos a `/public/documents/`
- Validación: Solo PDF (máx 10MB)
- Descarga directa desde detalle de producto

---

## 🤝 Contribución

Este proyecto es privado para EDESA VENTAS Ecuador.

---

## 📄 Licencia

Copyright © 2026 EDESA VENTAS Ecuador. Todos los derechos reservados.

---

## 📞 Soporte

Para preguntas o soporte:
- 📧 Email: contacto@edesaventas.ec
- 📱 WhatsApp: +593992686411
- 📞 Teléfono: +593 2 234-5678

---

**Desarrollado con ❤️ para EDESA VENTAS Ecuador**
