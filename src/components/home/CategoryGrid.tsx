import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    take: 10,
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  if (categories.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between animate-fade-in-up opacity-0">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
              Navega por Sección
            </p>
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Explorar por Categoría
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra exactamente lo que necesitas
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="default"
            className="hidden md:inline-flex gap-2"
          >
            <Link href="/categorias">
              Ver Todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid con imágenes - Diseño principal */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {categories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${Math.min(idx * 100, 800)}ms` }}
            >
              {/* Imagen de categoría */}
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
              )}

              {/* Overlay oscuro con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

              {/* Nombre de categoría */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-center text-lg font-semibold text-white">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Botón móvil */}
        <div className="mt-8 md:hidden">
          <Button asChild variant="outline" size="default" className="w-full gap-2">
            <Link href="/categorias">
              Ver Todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

{/*
  DISEÑO ALTERNATIVO - Minimalista con avatares (4 columnas)

  Para activar este diseño, reemplaza la sección completa con:

  <section className="bg-white border-t border-gray-100 py-16 md:py-24">
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
      <div className="mb-12 flex items-start justify-between animate-fade-in-up opacity-0">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
            Navega por Sección
          </p>
          <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Explorar por Categoría
          </h2>
          <p className="text-lg text-gray-600">
            Encuentra exactamente lo que necesitas
          </p>
        </div>
        <Button asChild variant="outline" className="hidden md:inline-flex gap-2">
          <Link href="/categorias">
            Ver Todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {categories.slice(0, 8).map((category, idx) => (
          <Link
            key={category.id}
            href={`/categorias/${category.slug}`}
            className="group animate-fade-in-up opacity-0"
            style={{ animationDelay: `${Math.min(idx * 100, 700)}ms` }}
          >
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-lg">
              <div className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-gray-700 transition-colors group-hover:bg-red-50 group-hover:text-red-600",
                idx === 2 ? "bg-red-50" : "bg-gray-100"
              )}>
                {category.name.slice(0, 2).toUpperCase()}
              </div>

              <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
                {category.name}
              </h3>

              <p className="text-sm text-gray-500">
                {category._count.products} productos
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 md:hidden">
        <Button asChild variant="outline" className="w-full gap-2">
          <Link href="/categorias">
            Ver Todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
*/}
