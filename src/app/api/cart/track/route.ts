import { NextRequest, NextResponse } from 'next/server';
import { trackCart } from '@/lib/cart-abandonment';

/**
 * POST /api/cart/track
 * Endpoint para trackear carritos desde el cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, customerEmail, customerName, items, subtotal, total } = body;

    console.log('📦 Datos recibidos en /api/cart/track:', {
      userId,
      customerEmail,
      customerName,
      itemsCount: items?.length,
      subtotal,
      total,
    });

    // Validar que al menos tengamos items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ No hay items');
      return NextResponse.json(
        { error: 'Items requeridos' },
        { status: 400 }
      );
    }

    // Validar que tengamos userId o email
    if (!userId && !customerEmail) {
      console.log('❌ No hay userId ni email');
      return NextResponse.json(
        { error: 'Usuario no identificado' },
        { status: 400 }
      );
    }

    // Trackear el carrito
    console.log('🔄 Llamando a trackCart...');
    await trackCart({
      userId,
      customerEmail,
      customerName,
      items,
      subtotal,
      total,
    });

    console.log('✅ trackCart completado exitosamente');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en /api/cart/track:', error);
    return NextResponse.json(
      { error: 'Error al trackear carrito' },
      { status: 500 }
    );
  }
}
