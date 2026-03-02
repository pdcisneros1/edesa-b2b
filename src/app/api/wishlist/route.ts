import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * GET /api/wishlist
 * ============================================================================
 * Obtener lista de favoritos del usuario autenticado
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

    console.log('📋 Cargando wishlist para usuario:', userId);

    // Obtener wishlist con productos completos
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            brand: true,
            category: true,
            promotions: {
              where: {
                promotion: {
                  isActive: true,
                  isManuallyDisabled: false,
                },
              },
              include: {
                promotion: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Más recientes primero
      },
    });

    console.log(`✅ Wishlist cargada: ${wishlistItems.length} productos`);

    return NextResponse.json({
      wishlist: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error('❌ Error al cargar wishlist:', error);
    return NextResponse.json(
      { error: 'Error al cargar favoritos' },
      { status: 500 }
    );
  }
}
