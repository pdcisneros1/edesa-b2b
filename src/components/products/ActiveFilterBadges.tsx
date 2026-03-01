'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ActiveFilterBadgesProps {
  categories: Category[];
  brands: Brand[];
}

export function ActiveFilterBadges({ categories, brands }: ActiveFilterBadgesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId');
  const brandId = searchParams.get('brandId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const onlyPromotions = searchParams.get('onlyPromotions') === 'true';
  const searchQuery = searchParams.get('q') || '';

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/productos?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort && sort !== 'newest') params.set('sort', sort);
    router.push(`/productos${params.toString() ? '?' + params.toString() : ''}`);
  };

  const hasFilters = categoryId || brandId || minPrice || maxPrice || onlyPromotions || searchQuery;

  if (!hasFilters) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedBrand = brands.find((b) => b.id === brandId);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-gray-500 font-medium">Filtros activos:</span>

      {searchQuery && (
        <FilterBadge
          label={`"${searchQuery}"`}
          onRemove={() => removeFilter('q')}
        />
      )}

      {selectedCategory && (
        <FilterBadge
          label={selectedCategory.name}
          onRemove={() => removeFilter('categoryId')}
        />
      )}

      {selectedBrand && (
        <FilterBadge
          label={selectedBrand.name}
          onRemove={() => removeFilter('brandId')}
        />
      )}

      {(minPrice || maxPrice) && (
        <FilterBadge
          label={
            minPrice && maxPrice
              ? `$${minPrice} - $${maxPrice}`
              : minPrice
              ? `Desde $${minPrice}`
              : `Hasta $${maxPrice}`
          }
          onRemove={() => {
            removeFilter('minPrice');
            removeFilter('maxPrice');
          }}
        />
      )}

      {onlyPromotions && (
        <FilterBadge
          label="En promoción"
          onRemove={() => removeFilter('onlyPromotions')}
        />
      )}

      <button
        onClick={clearAllFilters}
        className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors ml-1"
      >
        Limpiar todos
      </button>
    </div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
