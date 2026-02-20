import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import prisma from '@/lib/prisma';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Categorías | ${SITE_NAME}`,
  description:
    'Explora todas nuestras categorías: sanitarios, griferías, fregaderos, muebles y acabados de construcción para ferreterías y distribuidores en Ecuador.',
  openGraph: {
    title: `Categorías de Productos | ${SITE_NAME}`,
    description:
      'Catálogo completo por categoría — sanitarios, griferías y acabados para ferreterías y distribuidores en Ecuador.',
  },
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Navega por sección
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Todas las Categorías
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length} categorías disponibles
          </p>
        </div>
      </div>

      <div className="container py-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100 p-5 mb-4">
              <LayoutGrid className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Sin categorías</h2>
            <p className="text-sm text-gray-400">Las categorías aparecerán aquí pronto.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const productCount = category._count.products;

              return (
                <Link key={category.id} href={`/categorias/${category.slug}`}>
                  <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-gray-100 group-hover:bg-primary/10 p-2 flex-shrink-0 transition-colors">
                          <LayoutGrid className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                          {category.name}
                        </h2>
                      </div>
                      {category.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {productCount} {productCount === 1 ? 'producto' : 'productos'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                        Ver catálogo
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
