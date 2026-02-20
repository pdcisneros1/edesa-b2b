'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart } = useCart();

  return (
    <>
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-5">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 mb-3 -ml-2 h-8">
            <Link href="/productos">
              <ArrowLeft className="h-3.5 w-3.5" />
              Seguir Comprando
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <ShoppingBag className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Carrito de Compras
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
