'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addItem(product as any, quantity);
    toast.success('Producto agregado al carrito', {
      description: `${quantity}x ${product.name}`,
    });
    setQuantity(1);
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity <= 1 || product.stock <= 0}
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={product.stock <= 0}
            className="w-16 h-9 text-center border-0 border-x focus-visible:ring-0 rounded-none"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={quantity >= product.stock || product.stock <= 0}
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to cart button */}
      <Button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="h-12 gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-8"
      >
        <ShoppingCart className="h-5 w-5" />
        {product.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
      </Button>
    </div>
  );
}
