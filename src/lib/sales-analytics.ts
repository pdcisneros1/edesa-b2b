import { Order, SalesMetrics, ProductSales, CategorySales, SalesFilters, SalesByPeriod } from '@/types/sales';
import { Product, Category } from '@/types';

export function calculateSalesMetrics(
  orders: Order[],
  products: Product[],
  filters?: SalesFilters
): SalesMetrics {
  // Statuses that count as sales (exclude pending/cancelled)
  const COUNTED_STATUSES = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);
  // Filtrar órdenes según los filtros
  let filteredOrders = orders.filter((order) => COUNTED_STATUSES.has(order.status));

  if (filters?.startDate) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) >= filters.startDate!
    );
  }

  if (filters?.endDate) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) <= filters.endDate!
    );
  }

  // Calcular métricas totales
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const totalCost = filteredOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) => itemSum + (item.unitCost || 0) * item.quantity,
        0
      ),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calcular productos más vendidos
  const productSalesMap = new Map<string, ProductSales>();

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSalesMap.get(item.productSku);
      const product = products.find((p) => p.sku === item.productSku);
      const itemRevenue = item.subtotal;
      const itemCost = (item.unitCost || 0) * item.quantity;
      const itemProfit = itemRevenue - itemCost;

      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += itemRevenue;
        existing.cost += itemCost;
        existing.profit += itemProfit;
        existing.profitMargin =
          existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0;
      } else {
        productSalesMap.set(item.productSku, {
          productId: item.productId,
          productSku: item.productSku,
          productName: item.productName,
          categoryId: product?.categoryId || '',
          categoryName: product?.category?.name || 'Sin categoría',
          unitsSold: item.quantity,
          revenue: itemRevenue,
          cost: itemCost,
          profit: itemProfit,
          profitMargin: itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0,
        });
      }
    });
  });

  const topSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Calcular ventas por categoría
  const categorySalesMap = new Map<string, CategorySales>();

  topSellingProducts.forEach((productSale) => {
    if (filters?.categoryId && productSale.categoryId !== filters.categoryId) {
      return;
    }

    const existing = categorySalesMap.get(productSale.categoryId);
    if (existing) {
      existing.revenue += productSale.revenue;
      existing.cost += productSale.cost;
      existing.profit += productSale.profit;
      existing.unitsSold += productSale.unitsSold;
      existing.profitMargin =
        existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0;
    } else {
      categorySalesMap.set(productSale.categoryId, {
        categoryId: productSale.categoryId,
        categoryName: productSale.categoryName,
        revenue: productSale.revenue,
        cost: productSale.cost,
        profit: productSale.profit,
        profitMargin:
          productSale.revenue > 0
            ? (productSale.profit / productSale.revenue) * 100
            : 0,
        unitsSold: productSale.unitsSold,
        orderCount: filteredOrders.filter((order) =>
          order.items.some((item) => item.productId === productSale.productId)
        ).length,
      });
    }
  });

  const salesByCategory = Array.from(categorySalesMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    totalOrders,
    averageOrderValue,
    topSellingProducts,
    salesByCategory,
  };
}

export function getSalesByPeriod(
  orders: Order[],
  products: Product[],
  period: 'day' | 'week' | 'month' | 'year',
  filters?: SalesFilters
): SalesByPeriod[] {
  const COUNTED_STATUSES2 = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);
  const filteredOrders = orders.filter((order) => COUNTED_STATUSES2.has(order.status));
  const salesMap = new Map<string, SalesByPeriod>();

  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    let periodKey: string;

    switch (period) {
      case 'day':
        periodKey = date.toISOString().split('T')[0]; // "2026-02-16"
        break;
      case 'week':
        const weekNumber = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        break;
      case 'month':
        periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'year':
        periodKey = date.getFullYear().toString();
        break;
    }

    // Filtrar por categoría si se especifica
    if (filters?.categoryId) {
      const hasMatchingCategory = order.items.some((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product?.categoryId === filters.categoryId;
      });
      if (!hasMatchingCategory) return;
    }

    const revenue = order.subtotal;
    const cost = order.items.reduce(
      (sum, item) => sum + (item.unitCost || 0) * item.quantity,
      0
    );
    const profit = revenue - cost;
    const units = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const existing = salesMap.get(periodKey);
    if (existing) {
      existing.revenue += revenue;
      existing.cost += cost;
      existing.profit += profit;
      existing.orders += 1;
      existing.units += units;
    } else {
      salesMap.set(periodKey, {
        period: periodKey,
        revenue,
        cost,
        profit,
        orders: 1,
        units,
      });
    }
  });

  return Array.from(salesMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
