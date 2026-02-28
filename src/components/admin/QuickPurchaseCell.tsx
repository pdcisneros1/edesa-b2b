'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCsrfFetch } from '@/hooks/useCsrfFetch';

interface QuickPurchaseCellProps {
  productId: string;
  productName: string;
  currentStock: number;
}

export function QuickPurchaseCell({ productId, productName, currentStock }: QuickPurchaseCellProps) {
  const router = useRouter();
  const { csrfFetch } = useCsrfFetch();
  const [quantity, setQuantity] = useState<number>(10); // Default: 10 unidades
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePurchase = async () => {
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    setIsCreating(true);
    try {
      const res = await csrfFetch('/api/admin/quick-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear orden de compra');
      }

      const data = await res.json();
      toast.success(data.message);

      // Refrescar la página para actualizar el stock
      router.refresh();
    } catch (error) {
      console.error('Error al crear orden de compra:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear orden de compra');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        className="w-20 h-8 text-sm"
        disabled={isCreating}
      />
      <Button
        size="sm"
        onClick={handleCreatePurchase}
        disabled={isCreating}
        className="h-8 gap-1.5 bg-green-600 hover:bg-green-700"
        title={`Crear orden de compra de ${quantity} unidades`}
      >
        {isCreating ? (
          <>
            <Check className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-xs">Creando...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="text-xs">Comprar</span>
          </>
        )}
      </Button>
    </div>
  );
}
