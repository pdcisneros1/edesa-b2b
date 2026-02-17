import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import prisma from '@/lib/prisma';

export async function FeaturedProducts() {
  // Show featured products first; if fewer than 4, fill with most recent active products
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
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isFeaturedSection ? 'Productos Destacados' : 'Últimos Productos'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isFeaturedSection
                ? 'Nuestra selección de productos más populares'
                : 'Los productos más recientemente agregados al catálogo'}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex gap-2">
            <Link href="/productos">
              Ver Todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ProductGrid products={products as any} />

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/productos">
              Ver Todos los Productos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
