import { Search } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import prisma from '@/lib/prisma';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
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
      })
    : [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Resultados de Búsqueda
        </h1>
        <form action="/buscar" method="GET" className="flex items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Buscar por nombre, SKU o descripción..."
              defaultValue={query}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Buscar
          </button>
        </form>
        {query && (
          <p className="text-muted-foreground mt-4">
            {results.length}{' '}
            {results.length === 1 ? 'resultado' : 'resultados'} para{' '}
            <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        )}
      </div>

      {!query ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Búsqueda</h3>
          <p className="text-muted-foreground max-w-sm">
            Ingresa un término de búsqueda para encontrar productos
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Sin resultados</h3>
          <p className="text-muted-foreground max-w-sm">
            No se encontraron productos para "{query}". Intenta con otro término.
          </p>
        </div>
      ) : (
        <ProductGrid products={results as any} />
      )}
    </div>
  );
}
