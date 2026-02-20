'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REAL_ORDER_STATUSES } from '@/types/sales';
import type { OrderStatus } from '@/types/sales';

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: OrderStatus | string;
}

export function OrderStatusChanger({ orderId, currentStatus }: OrderStatusChangerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(
    (REAL_ORDER_STATUSES.find((s) => s.value === currentStatus)?.value) ?? 'pendiente_pago'
  );
  const [isSaving, setIsSaving] = useState(false);

  const hasChanged = status !== currentStatus;

  const handleSave = async () => {
    if (!hasChanged) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error al actualizar');
      }

      toast.success('Estado actualizado correctamente');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar estado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          {REAL_ORDER_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleSave}
        disabled={!hasChanged || isSaving}
        className="w-full"
        size="sm"
      >
        {isSaving ? 'Guardando...' : 'Guardar Estado'}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Los cambios se aplican de inmediato.
      </p>
    </div>
  );
}
