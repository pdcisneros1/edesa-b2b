'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { CustomerInfoForm } from '@/components/checkout/CustomerInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerInfoFormData } from '@/lib/validators';
import { useEffect } from 'react';

export default function CheckoutInformationPage() {
  const router = useRouter();
  const { cart } = useCart();
  const { customerInfo, setCustomerInfo } = useCheckout();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/carrito');
    }
  }, [cart.items.length, router]);

  const handleSubmit = (data: CustomerInfoFormData) => {
    setCustomerInfo(data);
    router.push('/checkout/envio');
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Checkout</h1>
        <CheckoutSteps currentStep={1} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
          <CardDescription>
            Ingresa tus datos para procesar tu pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerInfoForm
            defaultValues={customerInfo || undefined}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
