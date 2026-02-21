export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPrice(amount: number): string {
  return formatCurrency(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Formatea un porcentaje de descuento para visualización
 */
export function formatDiscountPercentage(percentage: number): string {
  return `-${Math.round(percentage)}%`;
}

/**
 * Calcula el monto de descuento aplicado
 */
export function calculateDiscountAmount(
  originalPrice: number,
  finalPrice: number
): number {
  return Math.max(0, originalPrice - finalPrice);
}
