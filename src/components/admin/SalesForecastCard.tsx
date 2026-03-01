'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SalesForecast } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface SalesForecastCardProps {
  forecast: SalesForecast;
}

export function SalesForecastCard({ forecast }: SalesForecastCardProps) {
  const getTrendIcon = () => {
    switch (forecast.trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (forecast.trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendLabel = () => {
    switch (forecast.trend) {
      case 'increasing':
        return 'Creciente';
      case 'decreasing':
        return 'Decreciente';
      default:
        return 'Estable';
    }
  };

  const getConfidenceBadge = () => {
    const labels = {
      high: { text: 'Alta Confianza', color: 'bg-green-100 text-green-700 border-green-200' },
      medium: { text: 'Confianza Media', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      low: { text: 'Baja Confianza', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };

    const badge = labels[forecast.nextPeriod.confidence];

    return (
      <Badge variant="outline" className={badge.color}>
        {badge.text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Proyección de Ventas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Período proyectado */}
        <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-medium text-blue-600 uppercase mb-1">
            Próximo Período
          </p>
          <p className="text-lg font-bold text-blue-900">
            {forecast.nextPeriod.period}
          </p>
        </div>

        {/* Ingresos proyectados */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 uppercase">
            Ingresos Proyectados
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatPrice(forecast.nextPeriod.predictedRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ~{forecast.nextPeriod.predictedOrders} órdenes estimadas
          </p>
        </div>

        {/* Tendencia */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Tendencia</p>
            <p className={`text-lg font-bold ${getTrendColor()} mt-1`}>
              {getTrendLabel()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {forecast.trendPercentage > 0 ? '+' : ''}
              {forecast.trendPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Nivel de confianza */}
        <div className="pt-3 border-t flex justify-center">
          {getConfidenceBadge()}
        </div>

        {/* Nota informativa */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 text-center">
            Proyección basada en tendencia de los últimos 6 meses
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
