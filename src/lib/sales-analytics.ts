import {
  Order,
  SalesMetrics,
  ProductSales,
  CategorySales,
  SalesFilters,
  SalesByPeriod,
  CustomerSales,
  PeriodComparison,
  SalesForecast,
  ChartDataPoint,
} from '@/types/sales';
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

  // Calcular top clientes
  const topCustomers = getTopCustomers(filteredOrders);

  // Calcular comparación de períodos (si hay filtro de período)
  const periodComparison = filters?.period
    ? comparePeriods(orders, filters.period)
    : undefined;

  // Calcular proyección de ventas
  const salesForecast = forecastSales(orders);

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    totalOrders,
    averageOrderValue,
    topSellingProducts,
    salesByCategory,
    topCustomers,
    periodComparison,
    salesForecast,
    conversionRate: undefined, // Requiere tracking de visitas
    cartAbandonmentRate: undefined, // Requiere tracking de carritos
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

// ============================================================================
// NUEVAS FUNCIONES PARA KPIs AVANZADOS
// ============================================================================

/**
 * Calcula top clientes por cantidad de órdenes y revenue total
 */
export function getTopCustomers(orders: Order[], limit = 10): CustomerSales[] {
  const COUNTED_STATUSES = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);
  const customerMap = new Map<string, CustomerSales>();

  orders
    .filter((order) => COUNTED_STATUSES.has(order.status))
    .forEach((order) => {
      const existing = customerMap.get(order.customerId);
      const orderRevenue = order.subtotal;
      const orderCost = order.items.reduce(
        (sum, item) => sum + (item.unitCost || 0) * item.quantity,
        0
      );
      const orderProfit = orderRevenue - orderCost;

      if (existing) {
        existing.totalOrders += 1;
        existing.totalRevenue += orderRevenue;
        existing.totalProfit += orderProfit;
        existing.averageOrderValue = existing.totalRevenue / existing.totalOrders;

        const currentLastOrder = new Date(existing.lastOrderDate);
        const thisOrderDate = new Date(order.createdAt);
        if (thisOrderDate > currentLastOrder) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(order.customerId, {
          customerId: order.customerId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerCompany: order.customerCompany,
          totalOrders: 1,
          totalRevenue: orderRevenue,
          totalProfit: orderProfit,
          averageOrderValue: orderRevenue,
          lastOrderDate: order.createdAt,
          frequency: 'low', // Se calcula después
        });
      }
    });

  // Calcular frecuencia (basada en # de órdenes)
  const customers = Array.from(customerMap.values());
  if (customers.length > 0) {
    const sortedByOrders = [...customers].sort((a, b) => b.totalOrders - a.totalOrders);
    const top33Index = Math.floor(customers.length * 0.33);
    const top66Index = Math.floor(customers.length * 0.66);

    customers.forEach((customer) => {
      const index = sortedByOrders.findIndex((c) => c.customerId === customer.customerId);
      if (index < top33Index) {
        customer.frequency = 'high';
      } else if (index < top66Index) {
        customer.frequency = 'medium';
      } else {
        customer.frequency = 'low';
      }
    });
  }

  return customers
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

/**
 * Compara el período actual con el anterior (mes vs mes, año vs año)
 */
export function comparePeriods(
  orders: Order[],
  period: 'day' | 'week' | 'month' | 'year'
): PeriodComparison {
  const COUNTED_STATUSES = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);
  const now = new Date();

  // Definir rangos de fechas para período actual y anterior
  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
  let currentLabel: string, previousLabel: string;

  switch (period) {
    case 'day':
      currentStart = new Date(now);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(now);
      currentEnd.setHours(23, 59, 59, 999);

      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(currentEnd);
      previousEnd.setDate(previousEnd.getDate() - 1);

      currentLabel = currentStart.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
      previousLabel = previousStart.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
      break;

    case 'week':
      currentEnd = new Date(now);
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);

      previousEnd = new Date(currentStart);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);

      currentLabel = 'Última semana';
      previousLabel = 'Semana anterior';
      break;

    case 'month':
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      currentLabel = currentStart.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
      previousLabel = previousStart.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
      break;

    case 'year':
    default:
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear(), 11, 31);

      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);

      currentLabel = currentStart.getFullYear().toString();
      previousLabel = previousStart.getFullYear().toString();
      break;
  }

  // Filtrar órdenes por períodos
  const currentOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      COUNTED_STATUSES.has(order.status) &&
      orderDate >= currentStart &&
      orderDate <= currentEnd
    );
  });

  const previousOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      COUNTED_STATUSES.has(order.status) &&
      orderDate >= previousStart &&
      orderDate <= previousEnd
    );
  });

  // Calcular métricas para cada período
  const currentRevenue = currentOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const currentProfit = currentOrders.reduce((sum, order) => {
    const cost = order.items.reduce((s, item) => s + (item.unitCost || 0) * item.quantity, 0);
    return sum + (order.subtotal - cost);
  }, 0);

  const previousProfit = previousOrders.reduce((sum, order) => {
    const cost = order.items.reduce((s, item) => s + (item.unitCost || 0) * item.quantity, 0);
    return sum + (order.subtotal - cost);
  }, 0);

  // Calcular crecimiento (%)
  const revenueGrowth =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersGrowth =
    previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0;
  const profitGrowth =
    previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0;

  return {
    current: {
      period: currentLabel,
      revenue: currentRevenue,
      orders: currentOrders.length,
      profit: currentProfit,
    },
    previous: {
      period: previousLabel,
      revenue: previousRevenue,
      orders: previousOrders.length,
      profit: previousProfit,
    },
    growth: {
      revenueGrowth,
      ordersGrowth,
      profitGrowth,
    },
  };
}

/**
 * Proyección de ventas basada en tendencia lineal simple
 */
export function forecastSales(orders: Order[]): SalesForecast {
  const COUNTED_STATUSES = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);

  // Agrupar ventas por mes (últimos 6 meses)
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const monthlyData: { month: number; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now);
    monthDate.setMonth(now.getMonth() - i);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        COUNTED_STATUSES.has(order.status) &&
        orderDate >= monthStart &&
        orderDate <= monthEnd
      );
    });

    const revenue = monthOrders.reduce((sum, o) => sum + o.subtotal, 0);
    monthlyData.push({ month: i, revenue, orders: monthOrders.length });
  }

  // Calcular tendencia lineal simple (regresión lineal básica)
  const n = monthlyData.length;
  if (n < 2) {
    // No hay suficientes datos para proyectar
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    return {
      nextPeriod: {
        period: nextMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' }),
        predictedRevenue: 0,
        predictedOrders: 0,
        confidence: 'low',
      },
      trend: 'stable',
      trendPercentage: 0,
    };
  }

  const sumX = monthlyData.reduce((sum, d, i) => sum + i, 0);
  const sumY = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const sumXY = monthlyData.reduce((sum, d, i) => sum + i * d.revenue, 0);
  const sumX2 = monthlyData.reduce((sum, d, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Proyectar siguiente mes (índice 6)
  const predictedRevenue = slope * n + intercept;

  // Proyectar órdenes (proporción similar)
  const avgOrdersPerMonth = monthlyData.reduce((sum, d) => sum + d.orders, 0) / n;
  const predictedOrders = Math.round(avgOrdersPerMonth);

  // Determinar tendencia
  const avgRevenue = sumY / n;
  const trendPercentage = avgRevenue > 0 ? (slope / avgRevenue) * 100 : 0;
  let trend: 'increasing' | 'stable' | 'decreasing';
  if (trendPercentage > 5) trend = 'increasing';
  else if (trendPercentage < -5) trend = 'decreasing';
  else trend = 'stable';

  // Confianza basada en varianza de datos
  const variance =
    monthlyData.reduce((sum, d) => {
      const diff = d.revenue - avgRevenue;
      return sum + diff * diff;
    }, 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = avgRevenue > 0 ? stdDev / avgRevenue : 1; // Coeficiente de variación

  let confidence: 'high' | 'medium' | 'low';
  if (cv < 0.2) confidence = 'high';
  else if (cv < 0.5) confidence = 'medium';
  else confidence = 'low';

  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);

  return {
    nextPeriod: {
      period: nextMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' }),
      predictedRevenue: Math.max(0, predictedRevenue),
      predictedOrders: Math.max(0, predictedOrders),
      confidence,
    },
    trend,
    trendPercentage,
  };
}

/**
 * Obtiene datos formateados para gráficos de Recharts
 * Agrupa por día, semana, mes o año según el período
 */
export function getChartData(
  orders: Order[],
  period: 'day' | 'week' | 'month' | 'year',
  lastNPeriods = 12
): ChartDataPoint[] {
  const COUNTED_STATUSES = new Set(['completed', 'pagado', 'en_proceso', 'enviado', 'entregado']);
  const dataMap = new Map<string, ChartDataPoint>();

  // Generar períodos vacíos
  const now = new Date();
  for (let i = lastNPeriods - 1; i >= 0; i--) {
    let date: Date;
    let key: string;

    switch (period) {
      case 'day':
        date = new Date(now);
        date.setDate(now.getDate() - i);
        key = date.toISOString().split('T')[0]; // "2026-02-15"
        break;

      case 'week':
        date = new Date(now);
        date.setDate(now.getDate() - i * 7);
        const weekNum = getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
        break;

      case 'month':
        date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;

      case 'year':
        date = new Date(now.getFullYear() - i, 0, 1);
        key = date.getFullYear().toString();
        break;

      default:
        date = now;
        key = now.toISOString().split('T')[0];
    }

    dataMap.set(key, {
      date: key,
      revenue: 0,
      orders: 0,
      profit: 0,
      units: 0,
    });
  }

  // Llenar con datos reales
  orders
    .filter((order) => COUNTED_STATUSES.has(order.status))
    .forEach((order) => {
      const orderDate = new Date(order.createdAt);
      let key: string;

      switch (period) {
        case 'day':
          key = orderDate.toISOString().split('T')[0];
          break;
        case 'week':
          const weekNum = getWeekNumber(orderDate);
          key = `${orderDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
          break;
        case 'month':
          key = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
          break;
        case 'year':
          key = orderDate.getFullYear().toString();
          break;
      }

      const existing = dataMap.get(key);
      if (existing) {
        const revenue = order.subtotal;
        const cost = order.items.reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0);
        const profit = revenue - cost;
        const units = order.items.reduce((sum, item) => sum + item.quantity, 0);

        existing.revenue += revenue;
        existing.orders += 1;
        existing.profit += profit;
        existing.units += units;
      }
    });

  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
