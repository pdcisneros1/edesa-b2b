import { NextRequest, NextResponse } from 'next/server';
import { identifyAbandonedCarts } from '@/lib/cart-abandonment';

/**
 * ============================================================================
 * CRON JOB: IDENTIFICAR CARRITOS ABANDONADOS
 * ============================================================================
 *
 * Ejecutar cada hora para:
 * - Marcar carritos ACTIVE > 1 hora como ABANDONED
 * - Marcar carritos ABANDONED/ACTIVE > 7 días como EXPIRED
 *
 * Configuración en Vercel Cron Jobs:
 * - Función: GET /api/cron/identify-abandoned-carts
 * - Schedule: 0 * * * * (cada hora)
 *
 * SEGURIDAD: Este endpoint debe protegerse con un token secreto o limitarse por IP.
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 AUTENTICACIÓN: Verificar token secreto de cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('❌ CRON_SECRET no configurado en variables de entorno');
      return NextResponse.json(
        { error: 'Configuración de cron incompleta' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Intento de acceso no autorizado a cron job');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Ejecutar identificación de carritos abandonados
    console.log('🔄 Iniciando identificación de carritos abandonados...');
    await identifyAbandonedCarts();

    return NextResponse.json({
      success: true,
      message: 'Carritos abandonados identificados correctamente',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error en cron job identify-abandoned-carts:', error);
    return NextResponse.json(
      { error: 'Error al identificar carritos abandonados' },
      { status: 500 }
    );
  }
}
