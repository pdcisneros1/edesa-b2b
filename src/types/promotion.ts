import { Product } from './product';

export type DiscountType = 'percentage' | 'fixed';

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom?: Date;
  validUntil?: Date;
  daysFromActivation?: number;
  isActive: boolean;
  isManuallyDisabled: boolean;
  products?: PromotionProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionProduct {
  id: string;
  promotionId: string;
  productId: string;
  activatedAt: Date;
  promotion?: Promotion;
  product?: Product;
}

/**
 * Calcula el precio final después de aplicar la promoción
 */
export function calculatePromotionPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountType === 'percentage') {
    const discount = (originalPrice * discountValue) / 100;
    return Math.max(0, originalPrice - discount);
  } else {
    // fixed
    return Math.max(0, originalPrice - discountValue);
  }
}

/**
 * Verifica si una promoción está vigente basándose en fechas y días desde activación
 */
export function isPromotionValid(promotion: Promotion, activatedAt?: Date): boolean {
  // Si está manualmente desactivada, no es válida
  if (promotion.isManuallyDisabled || !promotion.isActive) {
    return false;
  }

  const now = new Date();

  // Verificar validez por fechas
  if (promotion.validFrom && now < new Date(promotion.validFrom)) {
    return false;
  }

  if (promotion.validUntil && now > new Date(promotion.validUntil)) {
    return false;
  }

  // Verificar validez por días desde activación
  if (promotion.daysFromActivation && activatedAt) {
    const activationDate = new Date(activatedAt);
    const expirationDate = new Date(activationDate);
    expirationDate.setDate(expirationDate.getDate() + promotion.daysFromActivation);

    if (now > expirationDate) {
      return false;
    }
  }

  return true;
}

/**
 * Obtiene la promoción activa de un producto (si existe)
 */
export function getActivePromotionForProduct(
  product: Product & { promotions?: PromotionProduct[] }
): PromotionProduct | null {
  if (!product.promotions || product.promotions.length === 0) {
    return null;
  }

  // Buscar la primera promoción válida
  const activePromotion = product.promotions.find((pp) => {
    if (!pp.promotion) return false;
    return isPromotionValid(pp.promotion, pp.activatedAt);
  });

  return activePromotion || null;
}

/**
 * Calcula el precio final de un producto considerando promociones
 */
export function calculateFinalPrice(
  product: Product & { promotions?: PromotionProduct[] },
  wholesalePrice?: number | null
): number {
  const basePrice = wholesalePrice || product.price;
  const activePromotion = getActivePromotionForProduct(product);

  if (!activePromotion || !activePromotion.promotion) {
    return basePrice;
  }

  return calculatePromotionPrice(
    basePrice,
    activePromotion.promotion.discountType,
    activePromotion.promotion.discountValue
  );
}

/**
 * Calcula el porcentaje de descuento aplicado
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return discountValue;
  } else {
    // fixed - calcular el porcentaje equivalente
    return (discountValue / originalPrice) * 100;
  }
}
