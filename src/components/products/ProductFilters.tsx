'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  isMobile?: boolean;
}

function FilterContent({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get('categoryId') || '';
  const currentBrandId = searchParams.get('brandId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const hasActiveFilters = currentCategoryId || currentBrandId || currentMinPrice || currentMaxPrice;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/productos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort && sort !== 'newest') params.set('sort', sort);
    router.push(`/productos${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-sm text-gray-900">Filtros</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Categorías
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => updateFilter('categoryId', '')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !currentCategoryId
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                updateFilter('categoryId', currentCategoryId === cat.id ? '' : cat.id)
              }
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                currentCategoryId === cat.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Marcas
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => updateFilter('brandId', '')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !currentBrandId
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas las marcas
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() =>
                  updateFilter('brandId', currentBrandId === brand.id ? '' : brand.id)
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  currentBrandId === brand.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div className="p-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Rango de Precio (USD)
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Mínimo</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                min="0"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Máximo</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$999"
                min="0"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors bg-gray-50"
              />
            </div>
          </div>
          <Button
            onClick={handlePriceApply}
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold"
          >
            Aplicar precio
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductFilters({ categories, brands, isMobile = false }: ProductFiltersProps) {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-sm font-semibold">Filtros</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <FilterContent categories={categories} brands={brands} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return <FilterContent categories={categories} brands={brands} />;
}
