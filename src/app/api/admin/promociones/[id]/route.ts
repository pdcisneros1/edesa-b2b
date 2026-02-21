import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/promociones/[id] - Obtener una promoción específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    const promotion = await prisma.promotion.findUnique({
      where: { id },
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
                images: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json(
      { error: 'Error al obtener la promoción' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promociones/[id] - Actualizar una promoción
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await params;
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
      isManuallyDisabled,
      productIds,
    } = body;

    // Verificar que la promoción existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    // Validaciones
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

    // Si se están actualizando los productos, verificar conflictos
    if (productIds && productIds.length > 0) {
      const now = new Date();

      // Productos que se van a agregar (nuevos)
      const currentProductIds = existingPromotion.products.map((p) => p.productId);
      const newProductIds = productIds.filter((pid: string) => !currentProductIds.includes(pid));

      if (newProductIds.length > 0) {
        const conflictingProducts = await prisma.promotionProduct.findMany({
          where: {
            productId: { in: newProductIds },
            promotionId: { not: id }, // Excluir la promoción actual
            promotion: {
              isActive: true,
              isManuallyDisabled: false,
              OR: [
                {
                  validUntil: null,
                  validFrom: { lte: now },
                },
                {
                  validFrom: { lte: now },
                  validUntil: { gte: now },
                },
                {
                  validFrom: null,
                  validUntil: { gte: now },
                },
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
      }

      // Actualizar productos (eliminar los actuales y crear los nuevos)
      await prisma.promotionProduct.deleteMany({
        where: { promotionId: id },
      });
    }

    // Actualizar la promoción
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name: name || existingPromotion.name,
        description: description !== undefined ? description : existingPromotion.description,
        discountType: discountType || existingPromotion.discountType,
        discountValue: discountValue !== undefined ? discountValue : existingPromotion.discountValue,
        validFrom: validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : existingPromotion.validFrom,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : existingPromotion.validUntil,
        daysFromActivation: daysFromActivation !== undefined ? daysFromActivation : existingPromotion.daysFromActivation,
        isActive: isActive !== undefined ? isActive : existingPromotion.isActive,
        isManuallyDisabled: isManuallyDisabled !== undefined ? isManuallyDisabled : existingPromotion.isManuallyDisabled,
        ...(productIds && productIds.length > 0 && {
          products: {
            create: productIds.map((productId: string) => ({
              productId,
            })),
          },
        }),
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

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la promoción' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promociones/[id] - Eliminar una promoción
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    // Verificar que existe
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar (Cascade eliminará los PromotionProduct asociados)
    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la promoción' },
      { status: 500 }
    );
  }
}
