import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * POST /api/wishlist/check
 * ============================================================================
 * Verificar si un producto está en favoritos
 * Body: { productId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Requiere autenticación
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.session) {
      return NextResponse.json({ inWishlist: false });
    }

    const { userId } = authResult.session;
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ inWishlist: false });
    }

    // Verificar si está en favoritos
    const exists = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return NextResponse.json({
      inWishlist: !!exists,
    });
  } catch (error) {
    console.error('❌ Error al verificar wishlist:', error);
    return NextResponse.json({ inWishlist: false });
  }
}
