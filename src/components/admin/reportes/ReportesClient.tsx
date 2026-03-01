'use client';

import { useState } from 'react';
import { Product, Category } from '@/types';
import { Order, SalesFilters } from '@/types/sales';
import { calculateSalesMetrics, getChartData } from '@/lib/sales-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Download, BarChart3, Users, Package } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

// Componentes de visualización
import { SalesTrendChart } from '@/components/admin/charts/SalesTrendChart';
import { TopProductsBarChart } from '@/components/admin/charts/TopProductsBarChart';
import { CategoryPieChart } from '@/components/admin/charts/CategoryPieChart';
import { TopCustomersTable } from '@/components/admin/TopCustomersTable';
import { PeriodComparisonCard } from '@/components/admin/PeriodComparisonCard';
import { SalesForecastCard } from '@/components/admin/SalesForecastCard';

interface ReportesClientProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  purchaseOrders: any[];
  users: any[];
}

export function ReportesClient({
  products,
  categories,
  orders,
  purchaseOrders,
  users,
}: ReportesClientProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [reportType, setReportType] = useState<'ventas' | 'inventario' | 'compras' | 'clientes'>(
    'ventas'
  );

  // Calcular fechas según período
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
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

    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange();

  const salesFilters: SalesFilters = {
    period,
    startDate,
    endDate,
    categoryId: categoryId === 'all' ? undefined : categoryId,
  };

  const salesMetrics = calculateSalesMetrics(orders, products, salesFilters);
  const chartData = getChartData(orders, period, period === 'day' ? 30 : 12);

  // ============================================================================
  // EXPORTACIÓN DE REPORTES
  // ============================================================================

  const handleExportSalesReport = (format: 'excel' | 'pdf') => {
    const data = salesMetrics.topSellingProducts.map((p, index) => ({
      '#': index + 1,
      SKU: p.productSku,
      Producto: p.productName,
      Categoría: p.categoryName,
      'Unidades Vendidas': p.unitsSold,
      Ingresos: p.revenue,
      Costo: p.cost,
      Ganancia: p.profit,
      'Margen (%)': p.profitMargin.toFixed(2),
    }));

    const columns = [
      { header: '#', dataKey: '#' },
      { header: 'SKU', dataKey: 'SKU' },
      { header: 'Producto', dataKey: 'Producto' },
      { header: 'Categoría', dataKey: 'Categoría' },
      { header: 'Unidades Vendidas', dataKey: 'Unidades Vendidas' },
      { header: 'Ingresos', dataKey: 'Ingresos' },
      { header: 'Costo', dataKey: 'Costo' },
      { header: 'Ganancia', dataKey: 'Ganancia' },
      { header: 'Margen (%)', dataKey: 'Margen (%)' },
    ];

    if (format === 'excel') {
      exportToExcel(data, 'reporte-ventas');
      toast.success('Reporte de ventas exportado a Excel');
    } else {
      exportToPDF(data, columns, 'Reporte de Ventas', 'reporte-ventas');
      toast.success('Reporte de ventas exportado a PDF');
    }
  };

  const handleExportInventoryReport = (format: 'excel' | 'pdf') => {
    const data = products
      .filter((p) => p.isActive)
      .map((p, index) => ({
        '#': index + 1,
        SKU: p.sku,
        Producto: p.name,
        Categoría: p.category?.name || 'Sin categoría',
        Marca: p.brand?.name || 'Sin marca',
        Stock: p.stock,
        'Precio Venta': p.price,
        'Precio Costo': p.costPrice || 0,
        'Valor Inventario': p.stock * p.price,
        Estado: p.stock < 10 ? 'Stock Bajo' : 'Normal',
      }));

    const columns = [
      { header: '#', dataKey: '#' },
      { header: 'SKU', dataKey: 'SKU' },
      { header: 'Producto', dataKey: 'Producto' },
      { header: 'Categoría', dataKey: 'Categoría' },
      { header: 'Marca', dataKey: 'Marca' },
      { header: 'Stock', dataKey: 'Stock' },
      { header: 'Precio Venta', dataKey: 'Precio Venta' },
      { header: 'Precio Costo', dataKey: 'Precio Costo' },
      { header: 'Valor Inventario', dataKey: 'Valor Inventario' },
      { header: 'Estado', dataKey: 'Estado' },
    ];

    if (format === 'excel') {
      exportToExcel(data, 'reporte-inventario');
      toast.success('Reporte de inventario exportado a Excel');
    } else {
      exportToPDF(data, columns, 'Reporte de Inventario', 'reporte-inventario');
      toast.success('Reporte de inventario exportado a PDF');
    }
  };

  const handleExportPurchasesReport = (format: 'excel' | 'pdf') => {
    const data = purchaseOrders.map((po, index) => ({
      '#': index + 1,
      'Número Factura': po.invoiceNumber,
      Proveedor: po.supplier.name,
      Fecha: new Date(po.date).toLocaleDateString('es-EC'),
      Estado: po.status === 'RECEIVED' ? 'Recibido' : 'Pendiente',
      'Total Items': po.items.length,
      'Monto Total': po.totalAmount,
    }));

    const columns = [
      { header: '#', dataKey: '#' },
      { header: 'Número Factura', dataKey: 'Número Factura' },
      { header: 'Proveedor', dataKey: 'Proveedor' },
      { header: 'Fecha', dataKey: 'Fecha' },
      { header: 'Estado', dataKey: 'Estado' },
      { header: 'Total Items', dataKey: 'Total Items' },
      { header: 'Monto Total', dataKey: 'Monto Total' },
    ];

    if (format === 'excel') {
      exportToExcel(data, 'reporte-compras');
      toast.success('Reporte de compras exportado a Excel');
    } else {
      exportToPDF(data, columns, 'Reporte de Órdenes de Compra', 'reporte-compras');
      toast.success('Reporte de compras exportado a PDF');
    }
  };

  const handleExportCustomersReport = (format: 'excel' | 'pdf') => {
    const data = salesMetrics.topCustomers.map((c, index) => ({
      '#': index + 1,
      Cliente: c.customerName,
      Email: c.customerEmail,
      Empresa: c.customerCompany || 'N/A',
      'Total Órdenes': c.totalOrders,
      'Ingresos Totales': c.totalRevenue,
      'Ticket Promedio': c.averageOrderValue,
      Frecuencia: c.frequency === 'high' ? 'Alta' : c.frequency === 'medium' ? 'Media' : 'Baja',
      'Última Compra': new Date(c.lastOrderDate).toLocaleDateString('es-EC'),
    }));

    const columns = [
      { header: '#', dataKey: '#' },
      { header: 'Cliente', dataKey: 'Cliente' },
      { header: 'Email', dataKey: 'Email' },
      { header: 'Empresa', dataKey: 'Empresa' },
      { header: 'Total Órdenes', dataKey: 'Total Órdenes' },
      { header: 'Ingresos Totales', dataKey: 'Ingresos Totales' },
      { header: 'Ticket Promedio', dataKey: 'Ticket Promedio' },
      { header: 'Frecuencia', dataKey: 'Frecuencia' },
      { header: 'Última Compra', dataKey: 'Última Compra' },
    ];

    if (format === 'excel') {
      exportToExcel(data, 'reporte-clientes');
      toast.success('Reporte de clientes exportado a Excel');
    } else {
      exportToPDF(data, columns, 'Reporte de Clientes B2B', 'reporte-clientes');
      toast.success('Reporte de clientes exportado a PDF');
    }
  };

  const handleExportReport = (format: 'excel' | 'pdf') => {
    switch (reportType) {
      case 'ventas':
        handleExportSalesReport(format);
        break;
      case 'inventario':
        handleExportInventoryReport(format);
        break;
      case 'compras':
        handleExportPurchasesReport(format);
        break;
      case 'clientes':
        handleExportCustomersReport(format);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes y Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Reportes detallados con exportación a Excel y PDF
        </p>
      </div>

      {/* Filtros globales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="reportType">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                <SelectTrigger id="reportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Ventas</SelectItem>
                  <SelectItem value="inventario">Inventario</SelectItem>
                  <SelectItem value="compras">Compras</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
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

            {reportType === 'ventas' && (
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Todas" />
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
            )}

            <div className="flex items-end gap-2">
              <Button
                onClick={() => handleExportReport('excel')}
                variant="outline"
                className="flex-1 gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={() => handleExportReport('pdf')}
                variant="outline"
                className="flex-1 gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido según tipo de reporte */}
      <Tabs value={reportType} onValueChange={(v: any) => setReportType(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ventas">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="inventario">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="compras">
            <Download className="h-4 w-4 mr-2" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* Reporte de Ventas */}
        <TabsContent value="ventas" className="space-y-5">
          <SalesTrendChart data={chartData} />

          <div className="grid gap-5 md:grid-cols-2">
            {salesMetrics.periodComparison && (
              <PeriodComparisonCard comparison={salesMetrics.periodComparison} />
            )}
            {salesMetrics.salesForecast && (
              <SalesForecastCard forecast={salesMetrics.salesForecast} />
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TopProductsBarChart products={salesMetrics.topSellingProducts} />
            <CategoryPieChart categories={salesMetrics.salesByCategory} />
          </div>
        </TabsContent>

        {/* Reporte de Inventario */}
        <TabsContent value="inventario" className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{products.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(products.reduce((sum, p) => sum + p.price * p.stock, 0))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.stock < 10).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Sin Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.stock === 0).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Productos con Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products
                  .filter((p) => p.stock < 10)
                  .slice(0, 10)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{p.stock} unidades</p>
                        <p className="text-xs text-gray-500">
                          Valor: {formatPrice(p.price * p.stock)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Compras */}
        <TabsContent value="compras" className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Órdenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{purchaseOrders.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">
                  {purchaseOrders.filter((po) => po.status === 'PENDING').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Recibidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {purchaseOrders.filter((po) => po.status === 'RECEIVED').length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Órdenes de Compra Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchaseOrders.slice(0, 10).map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{po.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        {po.supplier.name} • {new Date(po.date).toLocaleDateString('es-EC')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatPrice(po.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {po.status === 'RECEIVED' ? 'Recibido' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Clientes */}
        <TabsContent value="clientes" className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{salesMetrics.topCustomers.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Clientes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {salesMetrics.topCustomers.filter((c) => c.frequency !== 'low').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Revenue/Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(
                    salesMetrics.totalRevenue / Math.max(salesMetrics.topCustomers.length, 1)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <TopCustomersTable customers={salesMetrics.topCustomers} limit={50} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
