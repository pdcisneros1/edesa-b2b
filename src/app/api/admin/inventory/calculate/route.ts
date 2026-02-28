import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import {
  calculateAverageMonthlySales,
  calculateSuggestedSafetyStock,
  calculateReorderPoint,
  calculateReorderQuantity,
  applySuggestedInventorySettings,
} from '@/lib/inventory-intelligence';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/inventory/calculate
 * Calcula y opcionalmente aplica sugerencias de inventario para un producto
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const { productId, apply = false } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID es requerido' },
        { status: 400 }
      );
    }

    // Calcular métricas
    const avgMonthlySales = await calculateAverageMonthlySales(productId);
    const suggestedSafetyStock = await calculateSuggestedSafetyStock(productId);
    const suggestedReorderPoint = await calculateReorderPoint(productId);
    const suggestedReorderQuantity = await calculateReorderQuantity(productId);

    // Actualizar average monthly sales siempre
    await prisma.product.update({
      where: { id: productId },
      data: { averageMonthlySales: avgMonthlySales },
    });

    // Si apply=true, aplicar las sugerencias
    if (apply) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          safetyStock: suggestedSafetyStock,
          reorderPoint: suggestedReorderPoint,
          reorderQuantity: suggestedReorderQuantity,
        },
      });
    }

    return NextResponse.json({
      success: true,
      suggestions: {
        averageMonthlySales: avgMonthlySales,
        suggestedSafetyStock,
        suggestedReorderPoint,
        suggestedReorderQuantity,
      },
      applied: apply,
    });
  } catch (error) {
    console.error('Error al calcular sugerencias de inventario:', error);
    return NextResponse.json(
      { error: 'Error al calcular sugerencias' },
      { status: 500 }
    );
  }
}
