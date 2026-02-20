import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    take: 8,
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white border-t border-gray-100">
      <div className="container">
        <div className="flex items-end justify-between mb-8 animate-fade-in">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
              Navega por sección
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Explorar por Categoría
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Encuentra exactamente lo que necesitas
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-1.5 text-sm font-medium h-8"
          >
            <Link href="/categorias">
              Ver Todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, idx) => (
            <Link key={category.id} href={`/categorias/${category.slug}`} className="group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all p-5 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 group-hover:bg-primary/10 transition-colors flex items-center justify-center text-gray-500 group-hover:text-primary font-bold text-sm">
                  {category.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {category._count.products} productos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/categorias">
              Ver Todas las Categorías
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
