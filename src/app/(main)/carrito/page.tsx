'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart } = useCart();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2 mb-4">
          <Link href="/productos">
            <ArrowLeft className="h-4 w-4" />
            Seguir Comprando
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">
          Carrito de Compras
        </h1>
      </div>

      {cart.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Productos ({cart.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
