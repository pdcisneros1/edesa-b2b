import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/sales';
import { UserActions } from '@/components/admin/UserActions';
import { ArrowLeft, Mail, Phone, Building2, IdCard, Package } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, name: true, role: true,
      company: true, ruc: true, phone: true,
      isApproved: true, isBlocked: true, createdAt: true,
    },
  });

  if (!user) notFound();

  // Get orders for this user by email (case-insensitive)
  const userOrders = await prisma.order.findMany({
    where: {
      customerEmail: {
        equals: user.email,
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Usuarios
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{user.name ?? user.email}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registrado el {formatDate(user.createdAt)}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* User info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Información del Cliente</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.company && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{user.company}</span>
                </div>
              )}
              {user.ruc && (
                <div className="flex items-center gap-2 text-gray-600">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <span>RUC: {user.ruc}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order history */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">
                Historial de Pedidos ({userOrders.length})
              </h2>
            </div>
            {userOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                Sin pedidos registrados
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {userOrders.map((order) => (
                  <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                      }`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions panel */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Acciones</h2>
            </div>
            <div className="px-5 py-4">
              <UserActions
                userId={user.id}
                isApproved={user.isApproved ?? true}
                isBlocked={user.isBlocked ?? false}
                role={user.role}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
