'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodComparison } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface PeriodComparisonCardProps {
  comparison: PeriodComparison;
}

export function PeriodComparisonCard({ comparison }: PeriodComparisonCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Comparación de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Comparación de Ingresos */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Ingresos</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(comparison.current.revenue)}
                </span>
                <span className="text-xs text-gray-500">
                  vs {formatPrice(comparison.previous.revenue)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {comparison.growth.revenueGrowth > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : comparison.growth.revenueGrowth < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : null}
              <span
                className={`text-sm font-semibold ${
                  comparison.growth.revenueGrowth > 0
                    ? 'text-green-600'
                    : comparison.growth.revenueGrowth < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {comparison.growth.revenueGrowth > 0 ? '+' : ''}
                {comparison.growth.revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Comparación de Órdenes */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Órdenes</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {comparison.current.orders}
                </span>
                <span className="text-xs text-gray-500">
                  vs {comparison.previous.orders}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {comparison.growth.ordersGrowth > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : comparison.growth.ordersGrowth < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : null}
              <span
                className={`text-sm font-semibold ${
                  comparison.growth.ordersGrowth > 0
                    ? 'text-green-600'
                    : comparison.growth.ordersGrowth < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {comparison.growth.ordersGrowth > 0 ? '+' : ''}
                {comparison.growth.ordersGrowth.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Comparación de Ganancias */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Ganancias</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(comparison.current.profit)}
                </span>
                <span className="text-xs text-gray-500">
                  vs {formatPrice(comparison.previous.profit)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {comparison.growth.profitGrowth > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : comparison.growth.profitGrowth < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : null}
              <span
                className={`text-sm font-semibold ${
                  comparison.growth.profitGrowth > 0
                    ? 'text-green-600'
                    : comparison.growth.profitGrowth < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {comparison.growth.profitGrowth > 0 ? '+' : ''}
                {comparison.growth.profitGrowth.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Períodos comparados */}
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 text-center">
              <span className="font-medium">{comparison.current.period}</span>
              {' vs '}
              <span className="font-medium">{comparison.previous.period}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
