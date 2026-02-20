'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const mainImage = item.product.images[0]?.url || '/images/products/placeholder.jpg';

  const handleIncrement = () => {
    if (item.quantity < item.product.stock) {
      updateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= item.product.stock) {
      updateQuantity(item.productId, value);
    }
  };

  const handleRemove = () => {
    removeItem(item.productId);
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link
        href={`/productos/${item.product.slug}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
      >
        <Image
          src={mainImage}
          alt={item.product.name}
          fill
          className="object-contain p-2"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex justify-between gap-3">
          <div className="flex-1 min-w-0">
            {item.product.brand && (
              <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">
                {item.product.brand.name}
              </p>
            )}
            <Link
              href={`/productos/${item.product.slug}`}
              className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
            >
              {item.product.name}
            </Link>
            <p className="text-xs text-gray-400 mt-1 font-mono">{item.product.sku}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.price)} c/u</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-7 w-7 flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="h-7 w-7 rounded-md"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min="1"
              max={item.product.stock}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-14 h-7 text-center text-sm rounded-md"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={item.quantity >= item.product.stock}
              className="h-7 w-7 rounded-md"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="font-bold text-gray-900 text-sm tabular-nums">
            {formatPrice(item.subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
