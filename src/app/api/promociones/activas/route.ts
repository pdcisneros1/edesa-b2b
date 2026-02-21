import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/promociones/activas - Obtener promociones activas para el storefront
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        isManuallyDisabled: false,
        OR: [
          // Sin fecha de fin
          {
            validUntil: null,
            OR: [
              { validFrom: null },
              { validFrom: { lte: now } },
            ],
          },
          // Con fecha de fin vigente
          {
            validUntil: { gte: now },
            OR: [
              { validFrom: null },
              { validFrom: { lte: now } },
            ],
          },
        ],
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                price: true,
                wholesalePrice: true,
                shortDescription: true,
                isActive: true,
                images: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
                category: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
                brand: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrar promociones que tienen al menos un producto activo
    const validPromotions = promotions
      .map((promo) => ({
        ...promo,
        products: promo.products.filter((pp) => pp.product && pp.product.isActive),
      }))
      .filter((promo) => promo.products.length > 0);

    return NextResponse.json(validPromotions);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return NextResponse.json(
      { error: 'Error al obtener promociones activas' },
      { status: 500 }
    );
  }
}
