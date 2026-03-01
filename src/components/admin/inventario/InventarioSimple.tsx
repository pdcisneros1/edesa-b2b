'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCsrfFetch } from '@/hooks/useCsrfFetch';

export function InventarioSimple() {
  const router = useRouter();
  const { csrfFetch } = useCsrfFetch();
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);

  const handleCreateAutomaticOrders = async () => {
    const confirmed = confirm(
      '¿Crear órdenes de compra automáticamente?\n\n' +
        'El sistema detectará productos con stock ≤ 10 unidades y creará órdenes de reabastecimiento.'
    );

    if (!confirmed) return;

    setIsCreatingOrders(true);
    try {
      const res = await csrfFetch('/api/admin/inventory/reorder', {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear órdenes');
      }

      const data = await res.json();

      if (data.ordersCreated === 0) {
        toast.info('✅ No hay productos con stock bajo que requieran reabastecimiento', {
          description: 'Todos los productos tienen stock suficiente (> 10 unidades)',
        });
      } else {
        toast.success(`✅ ${data.ordersCreated} órdenes creadas exitosamente`, {
          description: 'Redirigiendo a la sección de Compras...',
        });
        setTimeout(() => {
          router.push('/admin/purchases');
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error al crear órdenes', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsCreatingOrders(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inventario Automático</h1>
        <p className="text-muted-foreground mt-1">
          Sistema de reabastecimiento automático por stock bajo
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">¿Cómo funciona?</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Detecta automáticamente productos con <strong>stock ≤ 10 unidades</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Genera órdenes de compra instantáneamente con cantidad sugerida de <strong>30 unidades</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Prioriza productos críticos (stock en cero) primero</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Las órdenes creadas aparecen en la sección <strong>"Compras"</strong> con formato PO-000001, PO-000002, etc.</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Acción Rápida</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Crear Órdenes de Compra Automáticamente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Haz clic en el botón para analizar todo el inventario y generar órdenes de compra
                para todos los productos que tengan stock bajo (≤ 10 unidades).
              </p>
              <Button
                onClick={handleCreateAutomaticOrders}
                disabled={isCreatingOrders}
                className="gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isCreatingOrders ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Crear Órdenes de Compra
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-blue-900">Instrucciones</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
              <li>Haz clic en el botón "Crear Órdenes de Compra"</li>
              <li>El sistema analizará el inventario en segundos</li>
              <li>Se crearán órdenes automáticamente para productos con stock ≤ 10</li>
              <li>Serás redirigido a la sección "Compras" para revisar las órdenes creadas</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
