import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/cron/stock-alerts
 *
 * Endpoint para Vercel Cron - Verifica stock bajo y envía alertas.
 *
 * 🔒 Seguridad: Requiere Authorization header con CRON_SECRET
 *
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/stock-alerts",
 *     "schedule": "0 8 * * *"  // Diario a las 8:00 AM
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // 🔒 VERIFICAR CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET;

  // Si hay CRON_SECRET configurado, validarlo
  if (CRON_SECRET) {
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('❌ Acceso no autorizado a cron job');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    console.log('🕐 [CRON] Iniciando verificación de stock bajo...');

    // Buscar productos con stock bajo
    const MIN_STOCK = 10;

    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lt: MIN_STOCK,
        },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        stock: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // Si no hay productos con stock bajo, terminar
    if (lowStockProducts.length === 0) {
      console.log('✅ [CRON] No hay productos con stock bajo');
      return NextResponse.json({
        success: true,
        message: 'No hay productos con stock bajo',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`⚠️ [CRON] ${lowStockProducts.length} productos con stock bajo detectados`);

    // 📧 Enviar email al admin
    try {
      const { sendLowStockAlert } = await import('@/lib/email');

      const productsForEmail = lowStockProducts.map(product => ({
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        minStock: MIN_STOCK,
      }));

      await sendLowStockAlert(productsForEmail);

      console.log(`✅ [CRON] Email de alerta enviado exitosamente`);
      console.log(`   SKUs en alerta: ${lowStockProducts.map(p => p.sku).join(', ')}`);

      return NextResponse.json({
        success: true,
        message: `Alerta enviada: ${lowStockProducts.length} productos`,
        productsCount: lowStockProducts.length,
        timestamp: new Date().toISOString(),
      });
    } catch (emailError) {
      console.error('❌ [CRON] Error al enviar email:', emailError);
      return NextResponse.json(
        {
          error: 'Error al enviar email',
          details: emailError instanceof Error ? emailError.message : 'Unknown',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [CRON] Error en stock-alerts:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar alertas',
        details: error instanceof Error ? error.message : 'Unknown',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
