'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Percent } from 'lucide-react';
import { SalesMetrics, SalesFilters } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { Category } from '@/types';

interface SalesOverviewProps {
  metrics: SalesMetrics;
  categories: Category[];
  onFilterChange: (filters: SalesFilters) => void;
}

export function SalesOverview({ metrics, categories, onFilterChange }: SalesOverviewProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [categoryId, setCategoryId] = useState<string>('all');

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as 'day' | 'week' | 'month' | 'year';
    setPeriod(newPeriod);

    const now = new Date();
    let startDate: Date;

    switch (newPeriod) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    onFilterChange({
      period: newPeriod,
      startDate,
      endDate: now,
      categoryId: categoryId === 'all' ? undefined : categoryId
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    onFilterChange({
      period,
      categoryId: value === 'all' ? undefined : value,
      startDate: getStartDate(period),
      endDate: new Date()
    });
  };

  const getStartDate = (p: string): Date => {
    const now = new Date();
    switch (p) {
      case 'day':
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        return day;
      case 'week':
        const week = new Date(now);
        week.setDate(now.getDate() - 7);
        return week;
      case 'month':
        const month = new Date(now);
        month.setMonth(now.getMonth() - 1);
        return month;
      case 'year':
        const year = new Date(now);
        year.setFullYear(now.getFullYear() - 1);
        return year;
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Label htmlFor="period">Período</Label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoy</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mes</SelectItem>
              <SelectItem value="year">Último Año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Label htmlFor="category">Categoría</Label>
          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalOrders} órdenes
            </p>
          </CardContent>
        </Card>

        {/* Costos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPrice(metrics.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Costo de productos vendidos
            </p>
          </CardContent>
        </Card>

        {/* Ganancia Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            {metrics.totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatPrice(metrics.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos - Costos
            </p>
          </CardContent>
        </Card>

        {/* Margen de Ganancia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio por venta: {formatPrice(metrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
