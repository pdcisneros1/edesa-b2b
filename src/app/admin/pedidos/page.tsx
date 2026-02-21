import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { PedidosHeader } from '@/components/admin/pedidos/PedidosHeader';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function PaymentBadge({ method }: { method?: string | null }) {
  const labels: Record<string, string> = {
    transferencia: 'Transferencia',
    tarjeta: 'Tarjeta',
    efectivo: 'Efectivo',
  };
  return (
    <span className="text-xs text-gray-500">
      {method ? labels[method] ?? method : '—'}
    </span>
  );
}

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerCompany: true,
      customerEmail: true,
      paymentMethod: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <PedidosHeader orders={orders} />

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-gray-100 p-5 mb-4">
            <ShoppingBag className="h-7 w-7 text-gray-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Sin pedidos aún</h2>
          <p className="text-xs text-gray-400">
            Los pedidos de clientes aparecerán aquí automáticamente.
          </p>
        </div>
      )}

      {/* Orders table */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pedido
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pago
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="px-5 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-semibold text-gray-900">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      {order.customerCompany && (
                        <p className="text-xs text-gray-400">{order.customerCompany}</p>
                      )}
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge method={order.paymentMethod} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                      }`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Ver <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
