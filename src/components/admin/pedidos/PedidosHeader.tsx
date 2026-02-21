'use client';

import { ExportButton } from '@/components/admin/ExportButton';

interface Order {
  orderNumber: string;
  customerName: string;
  customerCompany?: string | null;
  customerEmail: string;
  paymentMethod?: string | null;
  total: number;
  status: string;
  createdAt: Date;
}

interface PedidosHeaderProps {
  orders: Order[];
}

export function PedidosHeader({ orders }: PedidosHeaderProps) {
  // Preparar datos para exportación
  const exportData = orders.map((order) => ({
    numeroPedido: order.orderNumber,
    cliente: order.customerName,
    empresa: order.customerCompany || '-',
    email: order.customerEmail,
    metodoPago: order.paymentMethod || '-',
    total: order.total,
    estado: order.status,
    fecha: new Date(order.createdAt).toLocaleDateString('es-EC'),
  }));

  const exportColumns = [
    { header: 'Número Pedido', dataKey: 'numeroPedido' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Empresa', dataKey: 'empresa' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Método Pago', dataKey: 'metodoPago' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Fecha', dataKey: 'fecha' },
  ];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
        </p>
      </div>
      {orders.length > 0 && (
        <ExportButton
          data={exportData}
          filename="pedidos"
          columns={exportColumns}
          title="Reporte de Pedidos"
        />
      )}
    </div>
  );
}
