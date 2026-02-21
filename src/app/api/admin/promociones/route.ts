import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/promociones - Listar todas las promociones
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                wholesalePrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Error al obtener promociones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/promociones - Crear nueva promoción
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      daysFromActivation,
      isActive,
      productIds,
    } = body;

    // Validaciones básicas
    if (!name || !discountType || discountValue === undefined || !productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requiere nombre, tipo de descuento, valor y al menos un producto.' },
        { status: 400 }
      );
    }

    // Validar valor de descuento
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json(
        { error: 'El monto de descuento debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Validar que al menos una opción de validez esté presente
    if (!validFrom && !validUntil && !daysFromActivation) {
      return NextResponse.json(
        { error: 'Debe especificar al menos una condición de validez (fechas o días desde activación)' },
        { status: 400 }
      );
    }

    // Verificar que ningún producto tenga otra promoción activa
    const now = new Date();
    const conflictingProducts = await prisma.promotionProduct.findMany({
      where: {
        productId: { in: productIds },
        promotion: {
          isActive: true,
          isManuallyDisabled: false,
          OR: [
            // Promociones sin fecha de fin
            {
              validUntil: null,
              validFrom: { lte: now },
            },
            // Promociones vigentes por fechas
            {
              validFrom: { lte: now },
              validUntil: { gte: now },
            },
            // Promociones sin fecha de inicio pero con fin futuro
            {
              validFrom: null,
              validUntil: { gte: now },
            },
            // Promociones solo con días desde activación
            {
              validFrom: null,
              validUntil: null,
              daysFromActivation: { not: null },
            },
          ],
        },
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        promotion: {
          select: {
            name: true,
          },
        },
      },
    });

    if (conflictingProducts.length > 0) {
      const productNames = conflictingProducts
        .map((cp) => `${cp.product.name} (${cp.product.sku}) - ya tiene promoción "${cp.promotion.name}"`)
        .join(', ');

      return NextResponse.json(
        {
          error: 'Algunos productos ya tienen una promoción activa',
          details: productNames,
        },
        { status: 400 }
      );
    }

    // Crear la promoción con productos
    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || null,
        discountType,
        discountValue,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        daysFromActivation: daysFromActivation || null,
        isActive: isActive !== undefined ? isActive : true,
        products: {
          create: productIds.map((productId: string) => ({
            productId,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                wholesalePrice: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Error al crear la promoción' },
      { status: 500 }
    );
  }
}
