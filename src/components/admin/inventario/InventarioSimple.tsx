'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useCsrfFetch } from '@/hooks/useCsrfFetch';

export function InventarioSimple() {
  const router = useRouter();
  const { csrfFetch } = useCsrfFetch();
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);

  const handleCreateAutomaticOrders = async () => {
    const confirmed = confirm(
      '¿Crear órdenes de compra automáticamente?\n\n' +
        'Esto generará órdenes para todos los productos que necesitan reabastecimiento.'
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
        toast.info(data.message || 'No hay productos que requieran reabastecimiento');
      } else {
        toast.success(data.message);
        router.push('/admin/purchases');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear órdenes');
    } finally {
      setIsCreatingOrders(false);
    }
  };

  const handleUpdateMetrics = async () => {
    const confirmed = confirm(
      '¿Actualizar métricas de demanda para todos los productos?\n\n' +
        'Esto recalculará el promedio de ventas mensuales basado en los últimos 3 meses.\n' +
        'Puede tardar 10-20 segundos.'
    );

    if (!confirmed) return;

    setIsUpdatingMetrics(true);
    try {
      const res = await csrfFetch('/api/admin/inventory/update-metrics', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Error al actualizar métricas');
      }

      const data = await res.json();
      toast.success(data.message);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar métricas');
    } finally {
      setIsUpdatingMetrics(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inventario Inteligente</h1>
        <p className="text-muted-foreground mt-1">
          Sistema de predicción de demanda y reorden automático
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Sistema de Inventario Inteligente</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Este sistema analiza el historial de ventas de los últimos 3 meses para predecir la demanda
              y generar órdenes de compra automáticamente cuando los productos alcanzan su punto de reorden.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-medium">✓</span> Cálculo automático de stock de seguridad
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">✓</span> Predicción de demanda basada en ventas
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">✓</span> Punto de reorden inteligente
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">✓</span> Órdenes de compra automáticas
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-1">1. Actualizar Métricas de Demanda</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Primero debes actualizar las métricas para calcular el promedio de ventas mensuales
                de todos los productos basándose en el historial de los últimos 3 meses.
              </p>
              <Button
                onClick={handleUpdateMetrics}
                disabled={isUpdatingMetrics}
                variant="outline"
                className="gap-2"
              >
                {isUpdatingMetrics ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Actualizando Métricas...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Actualizar Métricas de Demanda
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-medium mb-1">2. Crear Órdenes de Compra Automáticas</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Una vez actualizadas las métricas, el sistema identificará automáticamente qué productos
                  necesitan reabastecimiento y generará las órdenes de compra correspondientes.
                </p>
                <Button
                  onClick={handleCreateAutomaticOrders}
                  disabled={isCreatingOrders}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isCreatingOrders ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creando Órdenes...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Crear Órdenes de Compra Automáticas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">💡 Cómo usar el sistema</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li><strong>Opción 1 (Recomendada):</strong> Actualizar métricas primero para predicción inteligente basada en ventas históricas</li>
          <li><strong>Opción 2 (Rápida):</strong> Crear órdenes directamente - el sistema detectará automáticamente productos con stock ≤ 10 unidades</li>
          <li>Las órdenes creadas aparecerán en la sección "Compras" (PO-000001, PO-000002, etc.)</li>
        </ol>
      </Card>
    </div>
  );
}
