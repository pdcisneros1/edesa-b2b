'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm';
import { ShippingMethodSelector } from '@/components/checkout/ShippingMethodSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShippingAddressFormData } from '@/lib/validators';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { cart } = useCart();
  const {
    customerInfo,
    shippingAddress,
    shippingMethod,
    notes,
    setShippingAddress,
    setShippingMethod,
    setNotes,
  } = useCheckout();

  const [currentShippingMethod, setCurrentShippingMethod] = useState(
    shippingMethod || 'standard'
  );
  const [currentNotes, setCurrentNotes] = useState(notes || '');
  const [addressCompleted, setAddressCompleted] = useState(!!shippingAddress);

  // Redirect if cart is empty or no customer info
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/carrito');
    } else if (!customerInfo) {
      router.push('/checkout/informacion');
    }
  }, [cart.items.length, customerInfo, router]);

  const handleAddressSubmit = (data: ShippingAddressFormData) => {
    setShippingAddress(data);
    setAddressCompleted(true);
    toast.success('Dirección guardada');
  };

  const handleBack = () => {
    router.push('/checkout/informacion');
  };

  const handleContinue = () => {
    if (!addressCompleted) {
      toast.error('Por favor completa la dirección de envío');
      return;
    }

    if (!currentShippingMethod) {
      toast.error('Por favor selecciona un método de envío');
      return;
    }

    setShippingMethod(currentShippingMethod);
    setNotes(currentNotes);
    router.push('/checkout/confirmacion');
  };

  if (cart.items.length === 0 || !customerInfo) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Checkout</h1>
        <CheckoutSteps currentStep={2} />
      </div>

      <div className="space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección de Envío</CardTitle>
            <CardDescription>
              ¿A dónde enviamos tu pedido?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShippingAddressForm
              defaultValues={shippingAddress || undefined}
              onSubmit={handleAddressSubmit}
              onBack={handleBack}
            />
          </CardContent>
        </Card>

        {/* Shipping Method */}
        {addressCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Método de Envío</CardTitle>
              <CardDescription>
                Selecciona cómo deseas recibir tu pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingMethodSelector
                value={currentShippingMethod}
                onChange={setCurrentShippingMethod}
              />
            </CardContent>
          </Card>
        )}

        {/* Order Notes */}
        {addressCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Notas del Pedido (Opcional)</CardTitle>
              <CardDescription>
                Instrucciones especiales para la entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Tocar el timbre, dejar en recepción, etc."
                  rows={4}
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {currentNotes.length}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        {addressCompleted && (
          <div className="flex justify-end">
            <Button size="lg" onClick={handleContinue} className="gap-2">
              Revisar Pedido
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
