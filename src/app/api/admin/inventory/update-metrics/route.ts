import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateAllProductDemandMetrics } from '@/lib/inventory-intelligence';

/**
 * POST /api/admin/inventory/update-metrics
 * Actualiza las métricas de demanda para todos los productos activos
 * Debe ejecutarse periódicamente (diario) para mantener predicciones actualizadas
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    console.log('🔄 Actualizando métricas de demanda para todos los productos...');

    const result = await updateAllProductDemandMetrics();

    console.log(`✅ Actualizado: ${result.updated}/${result.total} productos`);

    return NextResponse.json({
      success: true,
      message: `Métricas actualizadas para ${result.updated} productos`,
      updated: result.updated,
      total: result.total,
    });
  } catch (error) {
    console.error('Error al actualizar métricas de demanda:', error);
    return NextResponse.json(
      { error: 'Error al actualizar métricas' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/inventory/update-metrics
 * Endpoint para verificar el estado (puede usarse para cron jobs)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    message: 'Use POST para ejecutar actualización de métricas',
  });
}
