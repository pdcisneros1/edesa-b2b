'use client';

import { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { ProductList } from './ProductList';
import { ViewToggle, ViewMode } from './ViewToggle';
import { SortSelector } from './SortSelector';
import { ProductFilters } from './ProductFilters';

interface ProductViewContainerProps {
  products: any[];
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
}

export function ProductViewContainer({ products, categories, brands }: ProductViewContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <>
      {/* Toolbar con ordenamiento y toggle de vista */}
      <div className="flex items-center justify-between mb-5 gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        {/* Filtros móviles */}
        <div className="lg:hidden">
          <ProductFilters categories={categories} brands={brands} isMobile />
        </div>

        <span className="text-sm text-gray-500 hidden lg:block tabular-nums">
          {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">Ordenar por:</span>
            <SortSelector />
          </div>
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />
          <ViewToggle onViewChange={setViewMode} />
        </div>
      </div>

      {/* Grid o Lista según selección */}
      {viewMode === 'grid' ? (
        <ProductGrid products={products} />
      ) : (
        <ProductList products={products} />
      )}
    </>
  );
}
