'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PriceSlider } from '@/components/products/PriceSlider';

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
  const currentMinPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const currentMaxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const currentOnlyPromotions = searchParams.get('onlyPromotions') === 'true';

  const hasActiveFilters = currentCategoryId || currentBrandId || currentMinPrice || currentMaxPrice || currentOnlyPromotions;

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

  const handlePriceApply = (min: number | null, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min !== null) params.set('minPrice', min.toString());
    else params.delete('minPrice');
    if (max !== null) params.set('maxPrice', max.toString());
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
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Rango de Precio (USD)
        </h3>
        <PriceSlider
          min={0}
          max={1000}
          defaultMin={currentMinPrice}
          defaultMax={currentMaxPrice}
          onApply={handlePriceApply}
        />
      </div>

      {/* Solo Promociones */}
      <div className="p-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Ofertas
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={currentOnlyPromotions}
            onChange={(e) => updateFilter('onlyPromotions', e.target.checked ? 'true' : '')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-primary transition-colors font-medium">
            Solo productos en promoción
          </span>
        </label>
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
