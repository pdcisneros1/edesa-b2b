import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/shared/LoadingSpinner';
import { SortSelector } from '@/components/products/SortSelector';
import { ProductFilters } from '@/components/products/ProductFilters';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo completo de sanitarios, griferías, lavamanos y acabados de construcción',
};

function getOrderBy(sort: string) {
  switch (sort) {
    case 'oldest':     return { createdAt: 'asc' as const };
    case 'price-asc':  return { price: 'asc' as const };
    case 'price-desc': return { price: 'desc' as const };
    case 'name-asc':   return { name: 'asc' as const };
    case 'name-desc':  return { name: 'desc' as const };
    default:           return { createdAt: 'desc' as const };
  }
}

interface ProductsPageProps {
  searchParams: Promise<{
    sort?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sort = 'newest', categoryId, brandId, minPrice, maxPrice } = await searchParams;

  const whereClause: Record<string, unknown> = { isActive: true };
  if (categoryId) whereClause.categoryId = categoryId;
  if (brandId) whereClause.brandId = brandId;
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
    whereClause.price = priceFilter;
  }

  const now = new Date();

  const [rawProducts, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: getOrderBy(sort),
      include: {
        images: true,
        category: true,
        brand: true,
        promotions: {
          where: {
            promotion: {
              isActive: true,
              isManuallyDisabled: false,
              OR: [
                {
                  validUntil: null,
                  OR: [
                    { validFrom: null },
                    { validFrom: { lte: now } },
                  ],
                },
                {
                  validUntil: { gte: now },
                  OR: [
                    { validFrom: null },
                    { validFrom: { lte: now } },
                  ],
                },
              ],
            },
          },
          include: {
            promotion: true,
          },
          take: 1,
        },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Serializar fechas para pasar al Client Component
  const products = rawProducts.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category ? {
      ...product.category,
    } : undefined,
    brand: product.brand ? {
      ...product.brand,
    } : undefined,
    promotions: product.promotions?.map((pp) => ({
      id: pp.id,
      promotionId: pp.promotionId,
      productId: pp.productId,
      activatedAt: pp.activatedAt.toISOString(),
      promotion: pp.promotion ? {
        id: pp.promotion.id,
        name: pp.promotion.name,
        description: pp.promotion.description,
        discountType: pp.promotion.discountType,
        discountValue: pp.promotion.discountValue,
        validFrom: pp.promotion.validFrom?.toISOString() ?? null,
        validUntil: pp.promotion.validUntil?.toISOString() ?? null,
        daysFromActivation: pp.promotion.daysFromActivation,
        isActive: pp.promotion.isActive,
        isManuallyDisabled: pp.promotion.isManuallyDisabled,
        createdAt: pp.promotion.createdAt.toISOString(),
        updatedAt: pp.promotion.updatedAt.toISOString(),
      } : undefined,
    })) ?? [],
  }));

  const hasFilters = categoryId || brandId || minPrice || maxPrice;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-7">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="tabular-nums font-medium text-gray-700">{products.length}</span>{' '}
            {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            {hasFilters && (
              <span className="ml-2 text-primary font-medium">· Filtros activos</span>
            )}
          </p>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-5">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <Suspense fallback={null}>
              <ProductFilters categories={categories} brands={brands} />
            </Suspense>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
              <div className="lg:hidden">
                <Suspense fallback={null}>
                  <ProductFilters categories={categories} brands={brands} isMobile />
                </Suspense>
              </div>

              <span className="text-sm text-gray-500 hidden lg:block tabular-nums">
                {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-400 hidden sm:inline">Ordenar por:</span>
                <Suspense fallback={null}>
                  <SortSelector />
                </Suspense>
              </div>
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={products as any} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
