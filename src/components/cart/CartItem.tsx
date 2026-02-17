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
    <div className="flex gap-4 py-4 border-b last:border-0">
      {/* Image */}
      <Link
        href={`/productos/${item.product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
      >
        <Image
          src={mainImage}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <Link
              href={`/productos/${item.product.slug}`}
              className="font-semibold hover:text-primary transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              SKU: {item.product.sku}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(item.price)} c/u
            </p>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>

        {/* Quantity and subtotal */}
        <div className="flex items-center justify-between gap-4">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min="1"
              max={item.product.stock}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-16 h-8 text-center text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={item.quantity >= item.product.stock}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="font-semibold">{formatPrice(item.subtotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
