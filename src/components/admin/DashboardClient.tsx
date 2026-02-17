'use client';

import { useState } from 'react';
import { Product, Category, Brand } from '@/types';
import { Order, SalesFilters } from '@/types/sales';
import { calculateSalesMetrics } from '@/lib/sales-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, Tag, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
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

  // Calcular métricas de ventas
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/productos',
    },
    {
      title: 'Categorías',
      value: categories.length,
      subtitle: 'Organizadas',
      icon: FolderTree,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/categorias',
    },
    {
      title: 'Marcas',
      value: brands.length,
      subtitle: 'Registradas',
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/marcas',
    },
    {
      title: 'Valor Inventario',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Total en stock',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Productos Destacados',
      value: featuredProducts,
      subtitle: 'En home page',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Stock Bajo',
      value: lowStockProducts,
      subtitle: 'Menos de 10 unidades',
      icon: ShoppingCart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Resumen general de la tienda
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button size="lg" className="gap-2">
            <Package className="h-5 w-5" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Tabs para organizar el contenido */}
      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ventas">📊 Análisis de Ventas</TabsTrigger>
          <TabsTrigger value="inventario">📦 Inventario</TabsTrigger>
        </TabsList>

        {/* Tab de Ventas */}
        <TabsContent value="ventas" className="space-y-6 mt-6">
          {/* Resumen de ventas con filtros */}
          <SalesOverview
            metrics={salesMetrics}
            categories={categories}
            onFilterChange={setSalesFilters}
          />

          {/* Tabla de productos más vendidos */}
          <TopProductsTable products={salesMetrics.topSellingProducts} />

          {/* Desglose por categoría */}
          <CategorySalesBreakdown categories={salesMetrics.salesByCategory} />
        </TabsContent>

        {/* Tab de Inventario */}
        <TabsContent value="inventario" className="space-y-6 mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inventoryStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-full p-2 ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
                    {stat.href && (
                      <Link href={stat.href}>
                        <Button variant="link" size="sm" className="mt-2 px-0">
                          Ver todos →
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {lowStockProducts > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <ShoppingCart className="h-5 w-5" />
                  ⚠️ Productos con Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">
                  Hay {lowStockProducts} producto(s) con menos de 10 unidades en stock.
                </p>
                <Link href="/admin/productos">
                  <Button variant="outline" size="sm" className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                    Ver Productos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Acciones Rápidas - siempre visible */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/productos/nuevo">
            <Button variant="outline" className="w-full gap-2">
              <Package className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
          <Link href="/admin/categorias">
            <Button variant="outline" className="w-full gap-2">
              <FolderTree className="h-4 w-4" />
              Ver Categorías
            </Button>
          </Link>
          <Link href="/admin/marcas">
            <Button variant="outline" className="w-full gap-2">
              <Tag className="h-4 w-4" />
              Ver Marcas
            </Button>
          </Link>
          <Link href="/" target="_blank">
            <Button variant="outline" className="w-full gap-2">
              <TrendingUp className="h-4 w-4" />
              Ver Tienda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
