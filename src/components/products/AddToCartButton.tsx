'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface AddToCartButtonProps {
  product: Product;
  redirectAfterLogin?: string;
}

export function AddToCartButton({ product, redirectAfterLogin }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { canSeePrices } = useAuth();

  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) setQuantity(value);
  };

  const handleAddToCart = () => {
    addItem(product as any, quantity);
    toast.success('Producto agregado al carrito', {
      description: `${quantity}x ${product.name}`,
    });
    setQuantity(1);
  };

  // Usuario no autenticado: mostrar CTA de login
  if (!canSeePrices) {
    const loginHref = redirectAfterLogin
      ? `/login?redirect=${encodeURIComponent(redirectAfterLogin)}`
      : '/login';

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Acceso exclusivo para ferreterías</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Inicia sesión para ver precios mayoristas y agregar al carrito.
            </p>
          </div>
        </div>
        <Link
          href={loginHref}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Lock className="h-4 w-4" />
          Ingresar como ferretería
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
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
        className="h-12 gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 w-full sm:w-auto"
      >
        <ShoppingCart className="h-5 w-5" />
        {product.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
      </Button>
    </div>
  );
}
