'use client';

import { useState } from 'react';
import { Product, Category, Brand } from '@/types';
import { Order, SalesFilters } from '@/types/sales';
import { calculateSalesMetrics } from '@/lib/sales-analytics';
import { Package, FolderTree, Tag, ShoppingCart, TrendingUp, DollarSign, AlertTriangle, Users, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SalesOverview } from '@/components/admin/SalesOverview';
import { TopProductsTable } from '@/components/admin/TopProductsTable';
import { CategorySalesBreakdown } from '@/components/admin/CategorySalesBreakdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
}

export function DashboardClient({ products, categories, brands, orders }: DashboardClientProps) {
  const [salesFilters, setSalesFilters] = useState<SalesFilters>({
    period: 'month',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  const salesMetrics = calculateSalesMetrics(orders, products, salesFilters);

  const activeProducts = products.filter((p) => p.isActive).length;
  const featuredProducts = products.filter((p) => p.isFeatured).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  const inventoryStats = [
    {
      title: 'Total Productos',
      value: products.length,
      subtitle: `${activeProducts} activos`,
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/admin/productos',
    },
    {
      title: 'Categorías',
      value: categories.length,
      subtitle: 'Organizadas',
      icon: FolderTree,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/admin/categorias',
    },
    {
      title: 'Marcas',
      value: brands.length,
      subtitle: 'Registradas',
      icon: Tag,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/admin/marcas',
    },
    {
      title: 'Valor Inventario',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subtitle: 'Total en stock',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Destacados',
      value: featuredProducts,
      subtitle: 'En home page',
      icon: TrendingUp,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Stock Bajo',
      value: lowStockProducts,
      subtitle: 'Menos de 10 unidades',
      icon: ShoppingCart,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general de la tienda</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="h-9 bg-gray-100 rounded-lg p-1 gap-1 w-auto inline-flex">
          <TabsTrigger value="ventas" className="text-sm h-7 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Análisis de Ventas
          </TabsTrigger>
          <TabsTrigger value="inventario" className="text-sm h-7 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Inventario
          </TabsTrigger>
        </TabsList>

        {/* Tab de Ventas */}
        <TabsContent value="ventas" className="space-y-5 mt-5">
          <SalesOverview
            metrics={salesMetrics}
            categories={categories}
            onFilterChange={setSalesFilters}
          />
          <TopProductsTable products={salesMetrics.topSellingProducts} />
          <CategorySalesBreakdown categories={salesMetrics.salesByCategory} />
        </TabsContent>

        {/* Tab de Inventario */}
        <TabsContent value="inventario" className="space-y-5 mt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inventoryStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <div className={`rounded-md p-2 ${stat.iconBg}`}>
                      <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  {stat.href && (
                    <Link
                      href={stat.href}
                      className="mt-3 inline-flex text-xs text-primary font-medium hover:underline"
                    >
                      Ver todos
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {lowStockProducts > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {lowStockProducts} producto{lowStockProducts > 1 ? 's' : ''} con stock bajo
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Menos de 10 unidades disponibles. Considera reabastecer pronto.
                </p>
                <Link href="/admin/productos">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Ver Productos
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/admin/categorias', icon: FolderTree, label: 'Ver Categorías' },
            { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
            { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
            { href: '/admin/compras', icon: Truck, label: 'Compras' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href}>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-9 text-sm font-medium justify-start"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
