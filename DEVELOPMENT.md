# Guía de Desarrollo - EDESA VENTAS

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

## 📁 Estructura de Archivos

### Rutas de la Aplicación
```
app/(main)/                 # Grupo de rutas con Header/Footer
├── page.tsx               # Home (/)
├── productos/
│   ├── page.tsx          # Listado (/productos)
│   └── [slug]/page.tsx   # Detalle (/productos/:slug)
├── categorias/
│   ├── page.tsx          # Overview (/categorias)
│   └── [slug]/page.tsx   # Por categoría (/categorias/:slug)
├── carrito/page.tsx      # Carrito (/carrito)
├── buscar/page.tsx       # Búsqueda (/buscar?q=...)
├── nosotros/page.tsx     # Acerca de (/nosotros)
└── contacto/page.tsx     # Contacto (/contacto)
```

### Componentes
```
components/
├── ui/                    # shadcn/ui components (24)
├── layout/
│   ├── Header.tsx        # Navegación principal + búsqueda + carrito
│   ├── Footer.tsx        # Footer con links y contacto
│   └── MobileNav.tsx     # Menú móvil lateral
├── home/
│   ├── Hero.tsx          # Carousel con 3 slides
│   ├── Features.tsx      # 4 características principales
│   ├── FeaturedProducts.tsx  # Grid de productos destacados
│   ├── CategoryGrid.tsx  # Grid de categorías principales
│   └── BrandShowcase.tsx # Showcase de marcas
├── products/
│   ├── ProductCard.tsx   # Card reusable de producto
│   ├── ProductGrid.tsx   # Grid responsive
│   └── AddToCartButton.tsx  # Botón con selector de cantidad
├── cart/
│   ├── CartItem.tsx      # Item con controles de cantidad
│   ├── CartSummary.tsx   # Resumen con envío gratis
│   └── EmptyCart.tsx     # Estado vacío
└── shared/
    ├── Price.tsx         # Precio con descuentos
    └── LoadingSpinner.tsx # Spinners de carga
```

### Datos y Estado
```
context/
└── CartContext.tsx       # Estado global del carrito con localStorage

data/
├── mock-categories.ts    # 14 categorías jerárquicas
├── mock-brands.ts        # 7 marcas principales
└── mock-products.ts      # 20 productos + helpers

lib/
├── constants.ts          # Configuración del sitio
├── format.ts            # Funciones de formateo
└── utils.ts             # Utilidades generales
```

## 🎨 Personalización de Estilos

### Colores del Tema
Los colores están definidos en `src/app/globals.css`:
- **Primary**: Azul industrial (#0ea5e9)
- **Secondary**: Verde (#22c55e)
- **Accent**: Naranja (#f97316)

### Agregar Componentes shadcn/ui
```bash
npx shadcn@latest add [component-name]
```

## 📊 Datos Mock

### Agregar Productos
Edita `src/data/mock-products.ts`:
```typescript
{
  id: 'prod-new',
  sku: 'SKU-001',
  name: 'Nombre del Producto',
  slug: 'nombre-del-producto',
  description: 'Descripción completa...',
  shortDescription: 'Descripción corta',
  price: 1000,
  compareAtPrice: 1200, // Opcional
  stock: 50,
  categoryId: 'cat-1',
  brandId: 'brand-1',
  images: [...],
  specifications: [...],
  isActive: true,
  isFeatured: false,
  isNew: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Agregar Categorías
Edita `src/data/mock-categories.ts`:
```typescript
{
  id: 'cat-new',
  name: 'Nueva Categoría',
  slug: 'nueva-categoria',
  description: 'Descripción...',
  image: '/images/categories/nueva.jpg',
  parentId: 'cat-parent', // Opcional
  order: 10,
}
```

## 🛒 Sistema de Carrito

### Usar el Carrito
```typescript
import { useCart } from '@/context/CartContext';

function Component() {
  const { cart, addItem, removeItem, updateQuantity, itemCount } = useCart();

  // Agregar producto
  addItem(productId, quantity);

  // Actualizar cantidad
  updateQuantity(productId, newQuantity);

  // Remover producto
  removeItem(productId);
}
```

### Persistencia
El carrito se guarda automáticamente en `localStorage` y se sincroniza entre tabs.

## 🎯 Rutas Importantes

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero, productos destacados, categorías |
| `/productos` | Listado completo de productos |
| `/productos/[slug]` | Detalle de producto individual |
| `/categorias` | Vista general de todas las categorías |
| `/categorias/[slug]` | Productos filtrados por categoría |
| `/carrito` | Carrito de compras |
| `/buscar?q=...` | Resultados de búsqueda |
| `/nosotros` | Información de la empresa |
| `/contacto` | Formulario de contacto |

## 🔧 Configuración

### Variables de Entorno
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

Variables disponibles:
```
DATABASE_URL="postgresql://..."  # Para backend futuro
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="EDESA VENTAS"
```

### Constantes del Sitio
Edita `src/lib/constants.ts` para cambiar:
- Nombre del sitio
- Información de contacto
- Costos de envío
- Estados de México
- Métodos de envío
- Links de redes sociales

## 📱 Responsive Design

El sitio usa un enfoque mobile-first con breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg, xl, 2xl)

### Grids Responsivos
```typescript
// Products grid
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

// Categories grid
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

## 🖼️ Imágenes

### Agregar Imágenes de Productos
Coloca las imágenes en:
```
public/images/products/
```

Usa rutas relativas en los datos mock:
```typescript
images: [
  { url: '/images/products/producto-1.jpg', alt: 'Descripción' }
]
```

### Optimización
Next.js optimiza automáticamente las imágenes con el componente `<Image>`.

## 🔍 SEO

### Metadata Estática
Define en cada página:
```typescript
export const metadata = {
  title: 'Título',
  description: 'Descripción',
};
```

### Metadata Dinámica
Usa `generateMetadata` para páginas dinámicas:
```typescript
export async function generateMetadata({ params }) {
  const product = getProductBySlug(params.slug);
  return {
    title: product.name,
    description: product.shortDescription,
  };
}
```

## 🧪 Testing

### Build de Producción
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## 📦 Deployment

### Vercel (Recomendado)
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel
```

### Otros Hosts
El proyecto es un sitio Next.js estándar compatible con:
- Vercel
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 🚧 Próximos Pasos

### Checkout (Fase 3)
1. Crear componentes de checkout
2. Implementar formularios con validación
3. Flujo completo de 3 pasos
4. Página de confirmación

### Backend Integration (Fase 6)
1. Implementar Prisma migrations
2. Crear API routes
3. Seed database con productos reales
4. Conectar frontend a API
5. Implementar autenticación

## 🆘 Troubleshooting

### El servidor no inicia
```bash
# Limpia .next y reinstala
rm -rf .next node_modules
npm install
npm run dev
```

### Errores de TypeScript
```bash
# Regenera tipos
npm run build
```

### Problemas con shadcn/ui
```bash
# Reinstala componente
npx shadcn@latest add [component] -y --overwrite
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com/)
