import type { Metadata } from 'next';
import { Search, PackageSearch } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import prisma from '@/lib/prisma';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || '').trim();

  if (!query) {
    return {
      title: 'Buscar Productos',
      description: 'Busca productos en nuestro catálogo de sanitarios, griferías y acabados de construcción.',
    };
  }

  return {
    title: `Resultados para "${query}"`,
    description: `Resultados de búsqueda para "${query}" en el catálogo de ${process.env.NEXT_PUBLIC_SITE_NAME || 'EDESA VENTAS'}.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  const results = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { shortDescription: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { images: true, category: true, brand: true },
        orderBy: { name: 'asc' },
        take: 48,
      })
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-7">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">
            {query ? `Resultados para "${query}"` : 'Buscar Productos'}
          </h1>

          <form action="/buscar" method="GET" className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                placeholder="Buscar por nombre, SKU o descripción..."
                defaultValue={query}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Buscar
            </button>
          </form>

          {query && (
            <p className="text-sm text-gray-500 mt-3">
              <span className="font-semibold text-gray-900 tabular-nums">{results.length}</span>{' '}
              {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para{' '}
              <span className="font-semibold text-gray-900">"{query}"</span>
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        {!query ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center bg-white">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Busca en el catálogo</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Ingresa el nombre de un producto, SKU o descripción para encontrar lo que necesitas.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center bg-white">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <PackageSearch className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Sin resultados</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              No encontramos productos para{' '}
              <span className="font-semibold">"{query}"</span>. Intenta con otro término.
            </p>
          </div>
        ) : (
          <ProductGrid products={results as any} />
        )}
      </div>
    </div>
  );
}
