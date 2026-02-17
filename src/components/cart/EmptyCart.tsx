import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Agrega productos a tu carrito para comenzar tu compra
      </p>
      <Button asChild size="lg">
        <Link href="/productos">Explorar Productos</Link>
      </Button>
    </div>
  );
}
