'use client';

import { CategorySales } from '@/types/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/format';
import { Layers } from 'lucide-react';

interface CategorySalesBreakdownProps {
  categories: CategorySales[];
}

export function CategorySalesBreakdown({ categories }: CategorySalesBreakdownProps) {
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Ventas por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay datos de ventas por categoría
            </p>
          ) : (
            categories.map((category) => {
              const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;

              return (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{category.categoryName}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{category.unitsSold} unidades</span>
                        <span>{category.orderCount} órdenes</span>
                        <span className="font-medium text-green-600">
                          Margen: {category.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(category.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% del total</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Detalles de rentabilidad */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-green-700">Ingresos</p>
                      <p className="font-semibold text-green-900">{formatPrice(category.revenue)}</p>
                    </div>
                    <div className="bg-red-50 rounded p-2">
                      <p className="text-xs text-red-700">Costos</p>
                      <p className="font-semibold text-red-900">{formatPrice(category.cost)}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-blue-700">Ganancia</p>
                      <p className="font-semibold text-blue-900">{formatPrice(category.profit)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
