import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <PackageSearch className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron productos</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Intenta ajustar los filtros o buscar con otros términos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, idx) => (
        <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
