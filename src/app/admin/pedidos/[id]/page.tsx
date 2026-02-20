import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { OrderStatusChanger } from '@/components/admin/OrderStatusChanger';
import { ArrowLeft, Building2, MapPin, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { OrderStatus } from '@/types/sales';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString('es-EC', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: 'Transferencia Bancaria',
  tarjeta: 'Pago con Tarjeta',
  efectivo: 'Efectivo',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) notFound();

  const status = order.status as OrderStatus;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Pedidos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
        }`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">
                Productos ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.productSku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA (15%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">Cliente</h2>
            </div>
            <div className="px-5 py-4 space-y-1.5 text-sm">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              {order.customerCompany && (
                <p className="text-gray-500">{order.customerCompany}</p>
              )}
              {order.customerTaxId && (
                <p className="text-gray-500">RUC: {order.customerTaxId}</p>
              )}
              <p className="text-gray-500">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-gray-500">{order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">Dirección de Envío</h2>
            </div>
            <div className="px-5 py-4 text-sm text-gray-600 space-y-1">
              <p>{order.shippingStreet}</p>
              <p>{order.shippingCity}, {order.shippingProvince}</p>
              <p>C.P. {order.shippingZipCode}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-800">Notas del Pedido</h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">{order.notes}</div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Status changer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Gestionar Estado</h2>
            </div>
            <div className="px-5 py-4">
              <OrderStatusChanger orderId={order.id} currentStatus={status} />
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">Pago</h2>
            </div>
            <div className="px-5 py-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod
                    ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
