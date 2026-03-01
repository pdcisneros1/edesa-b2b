'use client';

import { useCompare } from '@/context/CompareContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { X, Package, ShoppingCart } from 'lucide-react';
import { PriceGate } from './PriceGate';
import { AddToCartButton } from './AddToCartButton';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareModal({ isOpen, onClose }: CompareModalProps) {
  const { products, removeProduct } = useCompare();

  if (products.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Comparación de Productos ({products.length})
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                  Característica
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="p-3 border-b-2 border-gray-200 min-w-[200px]"
                  >
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remover de comparación"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Imágenes */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 bg-gray-50 z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Imagen
                </td>
                {products.map((product) => {
                  const image = product.images?.[0];
                  return (
                    <td key={product.id} className="p-3 text-center border-b border-gray-200">
                      <Link
                        href={`/productos/${product.slug}`}
                        className="relative block w-32 h-32 mx-auto bg-gray-100 rounded-lg overflow-hidden"
                      >
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || product.name}
                            fill
                            className="object-contain p-2"
                            sizes="128px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </Link>
                    </td>
                  );
                })}
              </tr>

              {/* Nombre */}
              <tr>
                <td className="sticky left-0 bg-white z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Nombre
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 border-b border-gray-200">
                    <Link
                      href={`/productos/${product.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                  </td>
                ))}
              </tr>

              {/* SKU */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 bg-gray-50 z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  SKU
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-sm text-gray-600 font-mono border-b border-gray-200">
                    {product.sku}
                  </td>
                ))}
              </tr>

              {/* Marca */}
              <tr>
                <td className="sticky left-0 bg-white z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Marca
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-sm text-gray-600 border-b border-gray-200">
                    {product.brand?.name || '-'}
                  </td>
                ))}
              </tr>

              {/* Categoría */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 bg-gray-50 z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Categoría
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-sm text-gray-600 border-b border-gray-200">
                    {product.category?.name || '-'}
                  </td>
                ))}
              </tr>

              {/* Precio */}
              <tr>
                <td className="sticky left-0 bg-white z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Precio
                </td>
                {products.map((product) => {
                  const displayPrice = product.wholesalePrice && product.wholesalePrice > 0
                    ? product.wholesalePrice
                    : product.price;
                  return (
                    <td key={product.id} className="p-3 border-b border-gray-200">
                      <PriceGate price={displayPrice} compact />
                    </td>
                  );
                })}
              </tr>

              {/* Disponibilidad */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 bg-gray-50 z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Disponibilidad
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-sm border-b border-gray-200">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Descripción */}
              <tr>
                <td className="sticky left-0 bg-white z-10 p-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Descripción
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-sm text-gray-600 border-b border-gray-200">
                    {product.shortDescription || '-'}
                  </td>
                ))}
              </tr>

              {/* Acciones */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 bg-gray-50 z-10 p-3 text-sm font-medium text-gray-700">
                  Acciones
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <AddToCartButton product={product as any} size="sm" className="w-full" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
