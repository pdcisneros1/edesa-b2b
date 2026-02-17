'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderReview } from '@/components/checkout/OrderReview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { customerInfo, shippingAddress, shippingMethod, notes, clearCheckout } = useCheckout();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Redirect if cart is empty or missing data
  useEffect(() => {
    if (cart.items.length === 0 && !orderCompleted) {
      router.push('/carrito');
    } else if (!customerInfo || !shippingAddress || !shippingMethod) {
      if (!orderCompleted) {
        router.push('/checkout/informacion');
      }
    }
  }, [cart.items.length, customerInfo, shippingAddress, shippingMethod, orderCompleted, router]);

  const handleBack = () => {
    router.push('/checkout/envio');
  };

  const handleConfirmOrder = async () => {
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate order number
    const newOrderNumber = `EDV-${Date.now().toString().slice(-8)}`;
    setOrderNumber(newOrderNumber);

    // Clear cart and checkout data
    clearCart();
    clearCheckout();

    setIsProcessing(false);
    setOrderCompleted(true);

    toast.success('¡Pedido confirmado!', {
      description: `Tu número de orden es ${newOrderNumber}`,
    });
  };

  if (cart.items.length === 0 && !orderCompleted) {
    return null;
  }

  if (!customerInfo || !shippingAddress || !shippingMethod) {
    if (!orderCompleted) {
      return null;
    }
  }

  // Order completed view
  if (orderCompleted) {
    return (
      <div className="container py-8 max-w-4xl">
        <Card className="text-center p-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-secondary/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-secondary" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
              <p className="text-lg text-muted-foreground">
                Gracias por tu compra
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">
                Número de Orden
              </p>
              <p className="text-2xl font-bold">{orderNumber}</p>
            </div>

            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              <p>
                Hemos enviado un correo de confirmación a{' '}
                <span className="font-medium text-foreground">
                  {customerInfo?.email}
                </span>
              </p>
              <p className="mt-2">
                Recibirás actualizaciones sobre el estado de tu pedido por correo electrónico.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/productos">
                  <ShoppingBag className="h-5 w-5" />
                  Seguir Comprando
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Ir al Inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review order view
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Checkout</h1>
        <CheckoutSteps currentStep={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Review */}
        <div className="lg:col-span-2">
          <OrderReview />
        </div>

        {/* Confirm Order */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Confirmar Pedido</h2>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3 mb-6">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    Acepto los{' '}
                    <a href="#" className="text-primary hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-primary hover:underline">
                      política de privacidad
                    </a>
                  </Label>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleConfirmOrder}
                    disabled={!acceptedTerms || isProcessing}
                  >
                    {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleBack}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Regresar
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Al confirmar tu pedido, recibirás un correo de confirmación con los detalles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
