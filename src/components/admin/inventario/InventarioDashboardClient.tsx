'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  RefreshCw,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCsrfFetch } from '@/hooks/useCsrfFetch';
import { formatPrice } from '@/lib/format';

export function InventarioDashboardClient() {
  const router = useRouter();
  const { csrfFetch } = useCsrfFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [productsNeedingReorder, setProductsNeedingReorder] = useState<any[]>([]);
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/inventory/reorder');
      if (!res.ok) throw new Error('Error al cargar productos');

      const data = await res.json();
      setProductsNeedingReorder(data.products || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAutomaticOrders = async () => {
    if (productsNeedingReorder.length === 0) {
      toast.info('No hay productos que requieran reabastecimiento');
      return;
    }

    const confirmed = confirm(
      `¿Crear ${productsNeedingReorder.length} órdenes de compra automáticamente?\n\n` +
        `Esto generará órdenes para todos los productos que necesitan reabastecimiento.`
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
      toast.success(data.message);
      loadProducts(); // Recargar lista
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
        'Esto recalculará el promedio de ventas mensuales basado en los últimos 3 meses.'
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
      loadProducts(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar métricas');
    } finally {
      setIsUpdatingMetrics(false);
    }
  };

  const getUrgencyBadge = (urgency: 'critical' | 'high' | 'medium') => {
    switch (urgency) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">🔴 Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">🟠 Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">🟡 Medio</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    productsNeedingReorder: productsNeedingReorder.length,
    criticalProducts: productsNeedingReorder.filter((p) => p.urgency === 'critical').length,
    highUrgencyProducts: productsNeedingReorder.filter((p) => p.urgency === 'high').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Requieren Reorden</p>
              <p className="text-2xl font-bold text-orange-600">{stats.productsNeedingReorder}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.criticalProducts} críticos
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">Stock en cero</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alta Urgencia</p>
              <p className="text-2xl font-bold text-orange-600">{stats.highUrgencyProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">Urgente</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCreateAutomaticOrders}
          disabled={isCreatingOrders || productsNeedingReorder.length === 0}
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
              Crear Órdenes Automáticamente ({productsNeedingReorder.length})
            </>
          )}
        </Button>

        <Button
          onClick={handleUpdateMetrics}
          disabled={isUpdatingMetrics}
          variant="outline"
          className="gap-2"
        >
          {isUpdatingMetrics ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Actualizar Métricas
            </>
          )}
        </Button>
      </div>

      {/* Products Table */}
      {productsNeedingReorder.length > 0 ? (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">
            Productos que Requieren Reabastecimiento ({productsNeedingReorder.length})
          </h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Punto Reorden</TableHead>
                  <TableHead>Cantidad Sugerida</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Urgencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsNeedingReorder.map((product: any) => {
                  const unitCost = product.costPrice || product.price * 0.6;
                  const totalCost = unitCost * product.suggestedQuantity;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock < (product.safetyStock || 0)
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {product.stock} unid.
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{product.reorderPoint} unid.</TableCell>
                      <TableCell className="font-medium text-sm">
                        {product.suggestedQuantity} unid.
                      </TableCell>
                      <TableCell className="text-sm">{formatPrice(totalCost)}</TableCell>
                      <TableCell>{getUrgencyBadge(product.urgency)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            ¡Todo el inventario está bajo control!
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            No hay productos que requieran reabastecimiento en este momento.
          </p>
        </Card>
      )}
    </div>
  );
}
