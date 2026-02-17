import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SortSelector } from '@/components/products/SortSelector';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Productos',
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
  searchParams: Promise<{ sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sort = 'newest' } = await searchParams;

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: getOrderBy(sort),
    include: { images: true, category: true, brand: true },
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Todos los Productos
            </h1>
            <p className="text-muted-foreground">
              {products.length} productos en el catálogo
            </p>
          </div>

          <Suspense fallback={null}>
            <SortSelector />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ProductGrid products={products as any} />
      </Suspense>
    </div>
  );
}
