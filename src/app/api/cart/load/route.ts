import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * GET /api/cart/load
 * ============================================================================
 * Cargar carrito persistente del usuario desde la base de datos
 * Permite recuperar el carrito en cualquier dispositivo
 */
export async function GET(request: NextRequest) {
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

    console.log('🔍 Cargando carrito para usuario:', userId);

    // Buscar carrito activo del usuario
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!cart) {
      console.log('📭 No hay carrito guardado para este usuario');
      return NextResponse.json({
        cart: null,
        message: 'No hay carrito guardado',
      });
    }

    console.log(`✅ Carrito cargado: ${cart.items.length} items`);

    // Transformar a formato del frontend
    const frontendCart = {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          sku: item.product.sku,
          price: item.product.price,
          wholesalePrice: item.product.wholesalePrice,
          stock: item.product.stock,
          images: item.product.images,
          brand: item.product.brand,
          category: item.product.category,
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      subtotal: cart.subtotal,
      total: cart.total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    return NextResponse.json({
      cart: frontendCart,
      message: 'Carrito cargado exitosamente',
    });
  } catch (error) {
    console.error('❌ Error al cargar carrito:', error);
    return NextResponse.json(
      { error: 'Error al cargar carrito' },
      { status: 500 }
    );
  }
}
