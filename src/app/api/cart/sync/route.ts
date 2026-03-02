import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * POST /api/cart/sync
 * ============================================================================
 * Sincronizar carrito del usuario a la base de datos
 * Permite persistencia multi-dispositivo
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Requiere autenticación
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { userId } = authResult.session;
    const body = await request.json();
    const { items, subtotal, total } = body;

    console.log('🔄 Sincronizando carrito para usuario:', userId);
    console.log('📦 Items recibidos:', items?.length);

    // Validaciones
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items inválidos' },
        { status: 400 }
      );
    }

    if (typeof subtotal !== 'number' || typeof total !== 'number') {
      return NextResponse.json(
        { error: 'Subtotal y total requeridos' },
        { status: 400 }
      );
    }

    // Buscar carrito existente del usuario
    const existingCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (existingCart) {
      console.log('🔄 Actualizando carrito existente:', existingCart.id);

      // Eliminar items antiguos
      await prisma.cartItem.deleteMany({
        where: { cartId: existingCart.id },
      });

      // Actualizar carrito con nuevos items
      await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          subtotal,
          total,
          updatedAt: new Date(),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      console.log('✅ Carrito actualizado exitosamente');
    } else {
      console.log('🆕 Creando nuevo carrito');

      // Crear nuevo carrito
      await prisma.cart.create({
        data: {
          userId,
          subtotal,
          total,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      console.log('✅ Carrito creado exitosamente');
    }

    return NextResponse.json({
      success: true,
      message: 'Carrito sincronizado exitosamente',
    });
  } catch (error) {
    console.error('❌ Error al sincronizar carrito:', error);
    return NextResponse.json(
      { error: 'Error al sincronizar carrito' },
      { status: 500 }
    );
  }
}
