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
    <>
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Proceso de compra
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
            Checkout
          </h1>
          <CheckoutSteps currentStep={2} />
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Dirección de Envío</h2>
              <p className="text-sm text-gray-500 mt-1">
                ¿A dónde enviamos tu pedido?
              </p>
            </div>
            <ShippingAddressForm
              defaultValues={shippingAddress || undefined}
              onSubmit={handleAddressSubmit}
              onBack={handleBack}
            />
          </div>

          {/* Shipping Method */}
          {addressCompleted && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Método de Envío</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona cómo deseas recibir tu pedido
                </p>
              </div>
              <ShippingMethodSelector
                value={currentShippingMethod}
                onChange={setCurrentShippingMethod}
              />
            </div>
          )}

          {/* Order Notes */}
          {addressCompleted && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Notas del Pedido</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Instrucciones especiales para la entrega (opcional)
                </p>
              </div>
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
                <p className="text-xs text-gray-400">
                  {currentNotes.length}/500 caracteres
                </p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          {addressCompleted && (
            <div className="flex justify-end animate-fade-in">
              <Button size="lg" onClick={handleContinue} className="gap-2">
                Revisar Pedido
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
