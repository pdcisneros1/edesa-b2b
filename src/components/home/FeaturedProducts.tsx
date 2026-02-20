import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import prisma from '@/lib/prisma';

export async function FeaturedProducts() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { images: true, category: true, brand: true },
  });

  const products =
    featuredProducts.length >= 4
      ? featuredProducts
      : await prisma.product.findMany({
          where: { isActive: true },
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: { images: true, category: true, brand: true },
        });

  const isFeaturedSection = featuredProducts.length >= 4;

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="flex items-end justify-between mb-8 animate-fade-in">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
              {isFeaturedSection ? 'Selección especial' : 'Catálogo'}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              {isFeaturedSection ? 'Productos Destacados' : 'Últimos Productos'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isFeaturedSection
                ? 'Nuestra selección de productos más populares'
                : 'Los productos más recientemente agregados al catálogo'}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-1.5 text-sm font-medium h-8"
          >
            <Link href="/productos">
              Ver Todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <ProductGrid products={products as any} />

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/productos">
              Ver Todos los Productos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
