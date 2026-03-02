import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * POST /api/wishlist/toggle
 * ============================================================================
 * Agregar o remover producto de favoritos (toggle)
 * Body: { productId: string }
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
    const { productId } = body;

    // Validaciones
    if (!productId) {
      return NextResponse.json(
        { error: 'productId requerido' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está en favoritos
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      // Ya existe → REMOVER
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });

      console.log(`❤️‍🔥 Removido de favoritos: ${product.name}`);

      return NextResponse.json({
        action: 'removed',
        message: 'Producto removido de favoritos',
        inWishlist: false,
      });
    } else {
      // No existe → AGREGAR
      await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });

      console.log(`❤️ Agregado a favoritos: ${product.name}`);

      return NextResponse.json({
        action: 'added',
        message: 'Producto agregado a favoritos',
        inWishlist: true,
      });
    }
  } catch (error) {
    console.error('❌ Error al toggle wishlist:', error);
    return NextResponse.json(
      { error: 'Error al actualizar favoritos' },
      { status: 500 }
    );
  }
}
