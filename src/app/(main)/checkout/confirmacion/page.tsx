'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderReview } from '@/components/checkout/OrderReview';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, CheckCircle2, ShoppingBag, Landmark, Phone, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { BANK_INFO } from '@/lib/constants';
import type { Order } from '@/types/sales';

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const {
    customerInfo, shippingAddress, shippingMethod, paymentMethod,
    setPaymentMethod, notes, clearCheckout,
  } = useCheckout();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  // Store customer email before clearing checkout
  const [customerEmail, setCustomerEmail] = useState('');
  const orderCompleted = completedOrder !== null;

  useEffect(() => {
    if (cart.items.length === 0 && !orderCompleted) {
      router.push('/carrito');
    } else if (!customerInfo || !shippingAddress || !shippingMethod) {
      if (!orderCompleted) router.push('/checkout/informacion');
    }
  }, [cart.items.length, customerInfo, shippingAddress, shippingMethod, orderCompleted, router]);

  const handleBack = () => router.push('/checkout/envio');

  const handleConfirmOrder = async () => {
    if (!paymentMethod) {
      toast.error('Selecciona un método de pago para continuar');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }
    if (!customerInfo || !shippingAddress || !shippingMethod) return;

    setIsProcessing(true);
    const savedEmail = customerInfo.email;

    try {
      const payload = {
        customerInfo,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        notes,
        items: cart.items.map((item) => ({
          productId: item.productId,
          productSku: item.product.sku,
          productName: item.product.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error al procesar el pedido');
      }

      const { order } = await res.json();
      setCustomerEmail(savedEmail);
      clearCart();
      clearCheckout();
      setCompletedOrder(order);
      toast.success('¡Pedido registrado!', { description: `Número: ${order.orderNumber}` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0 && !orderCompleted) return null;
  if ((!customerInfo || !shippingAddress || !shippingMethod) && !orderCompleted) return null;

  // ─── Order Completed View ───────────────────────────────────────────────
  if (orderCompleted && completedOrder) {
    const isTransfer = completedOrder.paymentMethod === 'transferencia';
    return (
      <div className="container py-8 max-w-3xl">
        <div className="space-y-5">
          {/* Success header */}
          <Card>
            <CardContent className="pt-8 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-5">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                ¡Pedido Registrado!
              </h1>
              <p className="text-gray-500 text-sm">
                Gracias por tu pedido, {completedOrder.customerName.split(' ')[0]}.
              </p>
              <div className="mt-4 inline-block bg-gray-50 border border-gray-200 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Número de pedido</p>
                <p className="text-xl font-bold text-gray-900 tracking-wide">
                  {completedOrder.orderNumber}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment instructions for transfer */}
          {isTransfer && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
                  <Landmark className="h-5 w-5" />
                  Instrucciones de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-amber-700">
                  Realiza la transferencia a la siguiente cuenta dentro de las{' '}
                  <strong>24 horas</strong> con tu número de pedido como referencia:
                </p>
                <div className="bg-white rounded-lg border border-amber-200 p-4 space-y-2 text-sm">
                  <TransferRow label="Banco" value={BANK_INFO.bankName} />
                  <TransferRow label="Cuenta" value={`${BANK_INFO.accountType} ${BANK_INFO.accountNumber}`} />
                  <TransferRow label="Beneficiario" value={BANK_INFO.companyName} />
                  <TransferRow label="RUC" value={BANK_INFO.companyRuc} />
                  <Separator />
                  <TransferRow label="Referencia" value={completedOrder.orderNumber} highlight />
                </div>
                <p className="text-xs text-amber-600 flex items-start gap-1.5">
                  <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  Tu pedido se procesará una vez que confirmemos la recepción del pago.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Next steps */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Próximos pasos</p>
              <div className="space-y-2 text-sm text-gray-600">
                {isTransfer && (
                  <Step n={1} text="Realiza la transferencia con los datos indicados." />
                )}
                <Step n={isTransfer ? 2 : 1} text={`Recibirás confirmación en ${customerEmail || completedOrder.customerEmail}.`} />
                <Step n={isTransfer ? 3 : 2} text="Nuestro equipo comercial coordinará la entrega contigo." />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 border-t pt-3">
                <Phone className="h-3.5 w-3.5" />
                <span>¿Consultas? WhatsApp o llámanos a <strong>+593 2 234-5678</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2 flex-1">
              <Link href="/productos">
                <ShoppingBag className="h-5 w-5" />
                Seguir Comprando
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/">Ir al Inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checkout Review + Payment ──────────────────────────────────────────
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
          <CheckoutSteps currentStep={3} />
        </div>
      </div>

      <div className="container py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: order review */}
          <div className="lg:col-span-2 space-y-5">
            <OrderReview />

            {/* Payment method selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h2>
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
          </div>

          {/* Right: confirm panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 sticky top-24">
              <h2 className="text-lg font-bold">Confirmar Pedido</h2>

              {!paymentMethod && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  Selecciona un método de pago para continuar.
                </p>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3">
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
                  disabled={!acceptedTerms || !paymentMethod || isProcessing}
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
                  <ArrowLeft className="h-4 w-4" />
                  Regresar
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Al confirmar, nuestro equipo procesará tu pedido y te contactará para coordinar la entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TransferRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}:</span>
      <span className={highlight ? 'font-bold text-primary' : 'font-medium text-gray-900 text-right'}>
        {value}
      </span>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span>{text}</span>
    </div>
  );
}
