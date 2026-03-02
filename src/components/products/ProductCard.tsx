'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Eye, Lock, GitCompare } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { toast } from 'sonner';
import { PriceGate } from './PriceGate';
import { QuickViewModal } from './QuickViewModal';
import { FavoriteButton } from './FavoriteButton';
import { calculateDiscount } from '@/lib/format';
import {
  getActivePromotionForProduct,
  calculateDiscountPercentage,
  type PromotionProduct,
} from '@/types/promotion';

interface ProductCardProps {
  product: Product & { promotions?: PromotionProduct[] };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { canSeePrices } = useAuth();
  const { addProduct, removeProduct, isComparing, canAddMore } = useCompare();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const mainImage = product.images[0]?.url || '/images/products/placeholder.jpg';

  const isInComparison = isComparing(product.id);

  // Verificar si tiene promoción activa
  const activePromotion = product.promotions ? getActivePromotionForProduct(product) : null;

  const hasDiscount =
    !product.wholesalePrice &&
    product.compareAtPrice &&
    product.compareAtPrice > product.price;
  const discount =
    hasDiscount && product.compareAtPrice
      ? calculateDiscount(product.price, product.compareAtPrice)
      : 0;

  // Calcular descuento de promoción si existe
  const promotionDiscountPercentage = activePromotion?.promotion
    ? calculateDiscountPercentage(
        product.wholesalePrice || product.price,
        activePromotion.promotion.discountType,
        activePromotion.promotion.discountValue
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success('Producto agregado al carrito', {
      description: product.name,
    });
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image area */}
      <Link href={`/productos/${product.slug}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {/* Action buttons - Top right */}
          <div className="absolute right-3 top-3 z-20 flex gap-2">
            {/* Favorite button */}
            <div className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-md transition-all">
              <FavoriteButton
                productId={product.id}
                productName={product.name}
                size="sm"
              />
            </div>

            {/* Compare checkbox */}
            <button
              onClick={handleCompareToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isInComparison
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary shadow-md'
              }`}
              aria-label={isInComparison ? 'Remover de comparación' : 'Agregar a comparación'}
              title={isInComparison ? 'Remover de comparación' : 'Agregar a comparación'}
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.isNew && (
              <span className="inline-flex items-center rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                Nuevo
              </span>
            )}
            {activePromotion && promotionDiscountPercentage > 0 && (
              <span className="inline-flex items-center rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm animate-pulse">
                PROMOCIÓN -{Math.round(promotionDiscountPercentage)}%
              </span>
            )}
            {!activePromotion && hasDiscount && discount > 0 && (
              <span className="inline-flex items-center rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                -{discount}%
              </span>
            )}
            {product.wholesalePrice && product.wholesalePrice > 0 && !activePromotion && (
              <span className="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                Mayorista
              </span>
            )}
          </div>

          {/* Out of stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                Agotado
              </span>
            </div>
          )}

          <Image
            src={mainImage}
            alt={product.images[0]?.alt || product.name}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover quick-view */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-white hover:text-primary hover:border-primary/40 transition-all"
            >
              <Eye className="h-3.5 w-3.5" />
              Vista Rápida
            </button>
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product as any}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/productos/${product.slug}`} className="flex-1 block">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
              {product.brand.name}
            </p>
          )}
          {/* SKU */}
          <p className="text-[10px] text-gray-400 mb-1.5">{product.sku}</p>
          {/* Product name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price — gated by auth */}
        <div className="mt-3 mb-3">
          <PriceGate
            price={product.price}
            wholesalePrice={product.wholesalePrice}
            compareAtPrice={product.compareAtPrice}
            promotion={activePromotion?.promotion}
            compact
          />
          {canSeePrices && (
            <div className="mt-1">
              {product.stock > 0 ? (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  En stock
                </p>
              ) : (
                <p className="text-[11px] text-red-500 font-semibold">Sin stock</p>
              )}
            </div>
          )}
        </div>

        {/* Cart button — gated by auth */}
        {canSeePrices ? (
          <Button
            className="w-full gap-2 h-9 text-sm font-semibold"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock <= 0 ? 'Agotado' : 'Agregar al Carrito'}
          </Button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary/40 hover:text-primary transition-colors h-9"
          >
            <Lock className="h-3.5 w-3.5" />
            Ingresar para comprar
          </Link>
        )}
      </div>
    </div>
  );
}
