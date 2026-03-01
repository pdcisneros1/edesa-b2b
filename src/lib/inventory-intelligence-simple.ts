/**
 * ============================================================================
 * SERVICIO DE INVENTARIO SIMPLE Y RÁPIDO
 * ============================================================================
 *
 * Sistema simplificado sin cálculos complejos
 * - Detecta productos con stock bajo (≤ 10 unidades)
 * - Genera órdenes instantáneamente
 * - Sin dependencia de historial de ventas
 * ============================================================================
 */

import prisma from '@/lib/prisma';

const LOW_STOCK_THRESHOLD = 10;
const DEFAULT_REORDER_QUANTITY = 30;

/**
 * Obtiene productos que necesitan reabastecimiento
 * Ultra-rápido: una sola query, sin iteraciones
 */
export async function getProductsNeedingReorder() {
  // Una sola query eficiente
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: {
        lte: LOW_STOCK_THRESHOLD, // Stock <= 10
      },
    },
    select: {
      id: true,
      sku: true,
      name: true,
      stock: true,
      costPrice: true,
      price: true,
      brand: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      stock: 'asc', // Los más críticos primero
    },
  });

  // Mapear a formato esperado sin cálculos pesados
  return products.map((product) => ({
    ...product,
    reorderPoint: LOW_STOCK_THRESHOLD,
    suggestedQuantity: DEFAULT_REORDER_QUANTITY,
    safetyStock: 5,
    urgency: (product.stock === 0 ? 'critical' : product.stock <= 3 ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
  }));
}
