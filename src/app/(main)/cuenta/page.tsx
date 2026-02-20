import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/format';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types/sales';
import { BANK_INFO, SITE_NAME } from '@/lib/constants';
import type { Metadata } from 'next';
import { Package, Landmark, ChevronRight, User, Building2, ArrowRight } from 'lucide-react';
import { LogoutButton } from '@/components/shared/LogoutButton';

export const metadata: Metadata = {
  title: `Mi Cuenta | ${SITE_NAME}`,
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
    }`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function TransferInstructions({
  order,
}: {
  order: { paymentMethod: string | null; status: string; orderNumber: string };
}) {
  if (order.paymentMethod !== 'transferencia' || order.status !== 'pendiente_pago') return null;
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
        <Landmark className="h-3.5 w-3.5" />
        Instrucciones de pago — transferencia pendiente
      </p>
      <div className="space-y-1 text-amber-700 text-xs">
        <p><strong>Banco:</strong> {BANK_INFO.bankName}</p>
        <p><strong>Cuenta:</strong> {BANK_INFO.accountType} {BANK_INFO.accountNumber}</p>
        <p><strong>Beneficiario:</strong> {BANK_INFO.companyName} — RUC {BANK_INFO.companyRuc}</p>
        <p><strong>Referencia:</strong> <span className="font-bold font-mono">{order.orderNumber}</span></p>
      </div>
    </div>
  );
}

export default async function CuentaPage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/cuenta');

  const myOrders = await prisma.order.findMany({
    where: {
      customerEmail: {
        equals: session.email,
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-7 max-w-3xl">
          <h1 className="text-xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-sm text-gray-500 mt-0.5">Portal de cliente — {SITE_NAME}</p>
        </div>
      </div>

      <div className="container py-7 max-w-3xl">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{session.name ?? session.email}</p>
              <p className="text-xs text-gray-500">{session.email}</p>
              {(session as any).company && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Building2 className="h-3 w-3" />
                  <span>{(session as any).company}</span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5">
                Activo
              </span>
            </div>
          </div>
        </div>

        {/* Orders section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              Mis Pedidos
              <span className="text-gray-400 font-normal">({myOrders.length})</span>
            </h2>
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-14 text-center">
              <div className="flex justify-center mb-3">
                <div className="rounded-full bg-gray-100 p-4">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm mb-1">Sin pedidos aún</h3>
              <p className="text-xs text-gray-400 mb-4">
                Cuando realices un pedido aparecerá aquí.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                Ver catálogo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-mono font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between gap-2">
                        <span className="truncate text-xs text-gray-600">
                          {item.quantity}× {item.productName}
                        </span>
                        <span className="flex-shrink-0 text-xs font-medium text-gray-900">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 3} productos más</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">
                      {order.paymentMethod === 'transferencia' ? 'Transferencia bancaria' : order.paymentMethod}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</span>
                  </div>

                  <TransferInstructions order={order} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <Package className="h-4 w-4" />
            Ver catálogo
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href="/pagos"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <Landmark className="h-4 w-4" />
            Métodos de pago
          </Link>
          <span className="text-gray-200">|</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
