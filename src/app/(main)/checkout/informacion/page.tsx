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
          <CheckoutSteps currentStep={1} />
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Información de Contacto</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa tus datos para procesar tu pedido
            </p>
          </div>
          <CustomerInfoForm
            defaultValues={customerInfo || undefined}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
}
