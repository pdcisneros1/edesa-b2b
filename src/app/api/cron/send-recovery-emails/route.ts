import { NextRequest, NextResponse } from 'next/server';
import { getCartsForRecovery, markRecoveryEmailSent } from '@/lib/cart-abandonment';
import { sendCartRecoveryEmail } from '@/lib/email';

/**
 * ============================================================================
 * CRON JOB: ENVIAR EMAILS DE RECUPERACIÓN DE CARRITO
 * ============================================================================
 *
 * Ejecutar cada 6 horas para enviar emails a carritos abandonados:
 * - Carrito abandonado hace 2-6 horas
 * - Email de recuperación no enviado previamente
 * - Tiene email del cliente
 *
 * Configuración en Vercel Cron Jobs:
 * - Función: GET /api/cron/send-recovery-emails
 * - Schedule: "0 star-slash-6 star star star" (cada 6 horas)
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

    // Obtener carritos que necesitan email de recuperación
    console.log('🔄 Buscando carritos para enviar emails de recuperación...');
    const carts = await getCartsForRecovery();

    if (carts.length === 0) {
      console.log('✅ No hay carritos para enviar emails de recuperación');
      return NextResponse.json({
        success: true,
        message: 'No hay carritos para enviar emails',
        emailsSent: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📧 Enviando ${carts.length} emails de recuperación...`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Enviar email a cada carrito (con manejo de errores individual)
    for (const cart of carts) {
      try {
        await sendCartRecoveryEmail(cart.customerEmail, {
          customerName: cart.customerName,
          items: cart.items as any, // JSON parsed items
          total: cart.total,
        });

        // Marcar email como enviado
        await markRecoveryEmailSent(cart.id);
        emailsSent++;

        console.log(`✅ Email enviado a ${cart.customerEmail} (Cart: ${cart.id})`);
      } catch (emailError) {
        console.error(`❌ Error al enviar email a ${cart.customerEmail}:`, emailError);
        emailsFailed++;
        // Continuar con los demás carritos
      }
    }

    console.log(`✅ Proceso completado: ${emailsSent} enviados, ${emailsFailed} fallidos`);

    return NextResponse.json({
      success: true,
      message: 'Emails de recuperación enviados',
      emailsSent,
      emailsFailed,
      totalCarts: carts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error en cron job send-recovery-emails:', error);
    return NextResponse.json(
      { error: 'Error al enviar emails de recuperación' },
      { status: 500 }
    );
  }
}
