'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { X, Package, ExternalLink, ShoppingCart } from 'lucide-react';
import { PriceGate } from './PriceGate';
import { AddToCartButton } from './AddToCartButton';
import { useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  wholesalePrice?: number | null;
  compareAtPrice?: number | null;
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

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const images = product.images || [];
  const selectedImage = images[selectedImageIndex] || { url: '/images/products/placeholder.jpg', alt: product.name };
  const hasPromotion = product.promotions && product.promotions.length > 0;
  const promotion = hasPromotion ? product.promotions?.[0].promotion : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt || product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-200" />
                </div>
              )}

              {/* Promoción badge */}
              {hasPromotion && promotion && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  {promotion.discountType === 'PERCENTAGE'
                    ? `-${promotion.discountValue}%`
                    : `-$${promotion.discountValue}`}
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary shadow-md'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || product.name}
                      fill
                      className="object-contain p-2"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex flex-col">
            {/* SKU y marca */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-400 uppercase">{product.sku}</span>
              {product.brand && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-primary font-bold uppercase">
                    {product.brand.name}
                  </span>
                </>
              )}
            </div>

            {/* Nombre */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {product.name}
            </h2>

            {/* Categoría */}
            {product.category && (
              <div className="text-sm text-gray-500 mb-4">
                Categoría: <span className="font-medium">{product.category.name}</span>
              </div>
            )}

            {/* Precio */}
            <div className="mb-6">
              <PriceGate
                price={product.price}
                wholesalePrice={product.wholesalePrice}
                compareAtPrice={product.compareAtPrice}
                promotion={promotion ?? undefined}
              />
            </div>

            {/* Descripción corta */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Disponibilidad */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  En stock - {product.stock} unidades disponibles
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Agotado
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="space-y-3 mt-auto">
              <AddToCartButton product={product as any} className="w-full" />

              <Link
                href={`/productos/${product.slug}`}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Ver detalles completos
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
