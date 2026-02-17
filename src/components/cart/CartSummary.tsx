'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

export function CartSummary() {
  const { cart, itemCount } = useCart();

  const subtotal = cart.subtotal;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const needsForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
          </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shippingCost === 0 ? (
              <span className="text-secondary">¡Gratis!</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        {needsForFreeShipping > 0 && (
          <div className="rounded-lg bg-secondary/10 p-3 text-sm">
            <p className="text-secondary font-medium">
              Agrega {formatPrice(needsForFreeShipping)} más para obtener envío gratis
            </p>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-xl">{formatPrice(total)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild size="lg" className="w-full gap-2">
          <Link href="/checkout">
            <ShoppingBag className="h-5 w-5" />
            Proceder al Pago
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
