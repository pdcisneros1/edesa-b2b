'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { formatPrice } from '@/lib/format';
import { SHIPPING_METHODS } from '@/lib/constants';

export function OrderReview() {
  const { cart } = useCart();
  const { customerInfo, shippingAddress, shippingMethod } = useCheckout();

  const selectedShippingMethod = SHIPPING_METHODS.find(
    (method) => method.id === shippingMethod
  );

  const shippingCost = selectedShippingMethod?.price || 0;
  const subtotal = cart.subtotal;
  const total = subtotal + shippingCost;

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      {customerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </p>
              {customerInfo.company && (
                <p className="text-sm text-muted-foreground">{customerInfo.company}</p>
              )}
            </div>
            <div className="text-sm">
              <p>{customerInfo.email}</p>
              <p>{customerInfo.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dirección de Envío</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state}
            </p>
            <p>
              C.P. {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shipping Method */}
      {selectedShippingMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Método de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{selectedShippingMethod.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedShippingMethod.description}
                </p>
              </div>
              <p className="font-semibold">
                {shippingCost === 0 ? (
                  <span className="text-secondary">Gratis</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Productos ({cart.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
                  <Image
                    src={item.product.images[0]?.url || '/images/products/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium">
                {shippingCost === 0 ? (
                  <span className="text-secondary">Gratis</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl">{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
