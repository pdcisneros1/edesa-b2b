/**
 * ============================================================================
 * SERVICIO DE INVENTARIO INTELIGENTE
 * ============================================================================
 *
 * Funcionalidades:
 * - Cálculo de predicción de demanda
 * - Sugerencias de stock de seguridad
 * - Identificación de productos para reorden
 * - Cálculo de cantidades óptimas de reorden
 * ============================================================================
 */

import prisma from '@/lib/prisma';

/**
 * Calcula el promedio de ventas mensuales de un producto
 * Basado en los últimos 3 meses de órdenes
 */
export async function calculateAverageMonthlySales(productId: string): Promise<number> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Obtener todas las órdenes de los últimos 3 meses que incluyan este producto
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        createdAt: {
          gte: threeMonthsAgo,
        },
        status: {
          notIn: ['cancelado'], // Excluir órdenes canceladas
        },
      },
    },
    select: {
      quantity: true,
    },
  });

  if (orderItems.length === 0) return 0;

  const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const averagePerMonth = totalSold / 3;

  return Math.round(averagePerMonth * 100) / 100; // Redondear a 2 decimales
}

/**
 * Calcula el stock de seguridad sugerido para un producto
 * Fórmula: Stock de Seguridad = (Demanda Promedio Diaria × Lead Time en días) × Factor de Seguridad
 */
export async function calculateSuggestedSafetyStock(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      averageMonthlySales: true,
      leadTimeDays: true,
    },
  });

  if (!product) return 0;

  const avgMonthlySales = product.averageMonthlySales || 0;
  const leadTime = product.leadTimeDays || 7;

  // Demanda promedio diaria (asumiendo 30 días por mes)
  const avgDailySales = avgMonthlySales / 30;

  // Stock de seguridad = demanda durante lead time × 1.5 (factor de seguridad)
  const safetyStock = Math.ceil(avgDailySales * leadTime * 1.5);

  return safetyStock;
}

/**
 * Calcula el punto de reorden sugerido
 * Fórmula: Punto de Reorden = (Demanda Diaria × Lead Time) + Stock de Seguridad
 */
export async function calculateReorderPoint(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      averageMonthlySales: true,
      leadTimeDays: true,
      safetyStock: true,
    },
  });

  if (!product) return 0;

  const avgMonthlySales = product.averageMonthlySales || 0;
  const leadTime = product.leadTimeDays || 7;
  const safetyStock = product.safetyStock || await calculateSuggestedSafetyStock(productId);

  // Demanda durante lead time
  const avgDailySales = avgMonthlySales / 30;
  const demandDuringLeadTime = Math.ceil(avgDailySales * leadTime);

  return demandDuringLeadTime + safetyStock;
}

/**
 * Calcula la cantidad óptima de reorden
 * Usa la fórmula EOQ simplificada o un múltiplo de la demanda mensual
 */
export async function calculateReorderQuantity(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      averageMonthlySales: true,
      reorderQuantity: true, // Si ya está definida manualmente, usarla
    },
  });

  if (!product) return 0;

  // Si ya tiene cantidad de reorden manual, usarla
  if (product.reorderQuantity && product.reorderQuantity > 0) {
    return product.reorderQuantity;
  }

  // Sino, ordenar 1.5 meses de demanda
  const avgMonthlySales = product.averageMonthlySales || 0;
  const suggestedQuantity = Math.ceil(avgMonthlySales * 1.5);

  return Math.max(suggestedQuantity, 10); // Mínimo 10 unidades
}

/**
 * Identifica todos los productos que necesitan reorden
 * Retorna lista de productos donde stock actual <= punto de reorden
 */
export async function getProductsNeedingReorder() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      stock: true,
      safetyStock: true,
      reorderPoint: true,
      reorderQuantity: true,
      averageMonthlySales: true,
      costPrice: true,
      price: true,
      brand: {
        select: {
          name: true,
        },
      },
    },
  });

  const productsNeedingReorder = [];

  for (const product of products) {
    // Calcular punto de reorden si no existe
    const reorderPoint = product.reorderPoint || await calculateReorderPoint(product.id);

    // Si el stock actual es menor o igual al punto de reorden, necesita reabastecimiento
    if (product.stock <= reorderPoint) {
      const suggestedQuantity = product.reorderQuantity || await calculateReorderQuantity(product.id);

      productsNeedingReorder.push({
        ...product,
        reorderPoint,
        suggestedQuantity,
        urgency: product.stock === 0 ? 'critical' : product.stock < (product.safetyStock || 0) ? 'high' : 'medium',
      });
    }
  }

  // Ordenar por urgencia (crítico primero)
  return productsNeedingReorder.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
  });
}

/**
 * Actualiza las métricas de demanda para todos los productos activos
 * Debe ejecutarse periódicamente (ej: diariamente via cron)
 */
export async function updateAllProductDemandMetrics() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  let updated = 0;

  for (const product of products) {
    const avgMonthlySales = await calculateAverageMonthlySales(product.id);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        averageMonthlySales: avgMonthlySales,
      },
    });

    updated++;
  }

  return { updated, total: products.length };
}

/**
 * Aplica sugerencias automáticas de stock de seguridad y punto de reorden
 * a productos que no los tienen configurados manualmente
 */
export async function applySuggestedInventorySettings(productId: string) {
  const safetyStock = await calculateSuggestedSafetyStock(productId);
  const reorderPoint = await calculateReorderPoint(productId);
  const reorderQuantity = await calculateReorderQuantity(productId);

  await prisma.product.update({
    where: { id: productId },
    data: {
      safetyStock,
      reorderPoint,
      reorderQuantity,
    },
  });

  return { safetyStock, reorderPoint, reorderQuantity };
}
