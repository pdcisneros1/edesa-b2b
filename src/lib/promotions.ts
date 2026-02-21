/**
 * Utilidades para manejar promociones en Server Components
 */

/**
 * Condición de Prisma WHERE para obtener solo promociones activas y vigentes
 */
export function getActivePromotionsWhere(now: Date = new Date()) {
  return {
    promotion: {
      isActive: true,
      isManuallyDisabled: false,
      OR: [
        {
          validUntil: null,
          OR: [
            { validFrom: null },
            { validFrom: { lte: now } },
          ],
        },
        {
          validUntil: { gte: now },
          OR: [
            { validFrom: null },
            { validFrom: { lte: now } },
          ],
        },
      ],
    },
  };
}

/**
 * Include de Prisma para productos con promociones activas
 */
export function getProductWithPromotionsInclude(now: Date = new Date()) {
  return {
    promotions: {
      where: getActivePromotionsWhere(now),
      include: {
        promotion: true,
      },
      take: 1,
    },
  };
}

/**
 * Serializa una promoción de Prisma para pasar al Client Component
 */
export function serializePromotion(promotion: any) {
  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    validFrom: promotion.validFrom?.toISOString() ?? null,
    validUntil: promotion.validUntil?.toISOString() ?? null,
    daysFromActivation: promotion.daysFromActivation,
    isActive: promotion.isActive,
    isManuallyDisabled: promotion.isManuallyDisabled,
    createdAt: promotion.createdAt.toISOString(),
    updatedAt: promotion.updatedAt.toISOString(),
  };
}

/**
 * Serializa un PromotionProduct de Prisma para pasar al Client Component
 */
export function serializePromotionProduct(pp: any) {
  return {
    id: pp.id,
    promotionId: pp.promotionId,
    productId: pp.productId,
    activatedAt: pp.activatedAt.toISOString(),
    promotion: pp.promotion ? serializePromotion(pp.promotion) : undefined,
  };
}

/**
 * Serializa un producto de Prisma (con promociones) para pasar al Client Component
 */
export function serializeProduct(product: any) {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category ? {
      ...product.category,
    } : undefined,
    brand: product.brand ? {
      ...product.brand,
    } : undefined,
    promotions: product.promotions?.map(serializePromotionProduct) ?? [],
  };
}

/**
 * Serializa un array de productos de Prisma (con promociones) para pasar al Client Component
 */
export function serializeProducts(products: any[]) {
  return products.map(serializeProduct);
}
