'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { PriceGate } from '@/components/products/PriceGate';
import { useCompare } from '@/context/CompareContext';
import { Package, Tag, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: number;
  wholesalePrice?: number | null;
  stock: number;
  images?: Array<{ url: string; alt?: string | null }>;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  promotions?: Array<{
    promotion?: {
      name: string;
      discountType: string;
      discountValue: number;
    };
  }>;
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { addProduct, removeProduct, isComparing, canAddMore } = useCompare();

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">No se encontraron productos</p>
      </div>
    );
  }

  const handleCompareToggle = (product: Product, isInComparison: boolean) => {
    if (isInComparison) {
      removeProduct(product.id);
      toast.info('Producto removido de comparación');
    } else if (canAddMore) {
      addProduct(product as any);
      toast.success('Producto agregado a comparación');
    } else {
      toast.error('Máximo 4 productos para comparar');
    }
  };

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const image = product.images?.[0];
        const hasPromotion = product.promotions && product.promotions.length > 0;
        const promotion = hasPromotion ? product.promotions?.[0].promotion : null;
        const isInComparison = isComparing(product.id);

        return (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex gap-4 p-4">
              {/* Imagen */}
              <Link
                href={`/productos/${product.slug}`}
                className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-200" />
                  </div>
                )}

                {hasPromotion && promotion && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {promotion.discountType === 'PERCENTAGE'
                      ? `-${promotion.discountValue}%`
                      : `-$${promotion.discountValue}`}
                  </div>
                )}
              </Link>

              {/* Información del producto */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* SKU y marca */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-gray-400 uppercase">
                        {product.sku}
                      </span>
                      {product.brand && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {product.brand.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Nombre */}
                    <Link
                      href={`/productos/${product.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-1"
                    >
                      {product.name}
                    </Link>

                    {/* Descripción */}
                    {product.shortDescription && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Categoría */}
                    {product.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        <Tag className="h-3 w-3" />
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* Precio y acciones */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <PriceGate
                      price={product.price}
                      wholesalePrice={product.wholesalePrice}
                      promotion={promotion as any}
                      compact
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCompareToggle(product, isInComparison)}
                        className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                          isInComparison
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                        }`}
                        aria-label={isInComparison ? 'Remover de comparación' : 'Agregar a comparación'}
                        title={isInComparison ? 'Remover de comparación' : 'Agregar a comparación'}
                      >
                        <GitCompare className="h-4 w-4" />
                      </button>
                      <AddToCartButton product={product as any} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
