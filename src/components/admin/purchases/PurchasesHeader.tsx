'use client';

import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/admin/ExportButton';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PurchaseOrder {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  date: Date;
  supplier: {
    name: string;
    contact?: string | null;
    email?: string | null;
  };
}

interface PurchasesHeaderProps {
  orders: PurchaseOrder[];
}

export function PurchasesHeader({ orders }: PurchasesHeaderProps) {
  // Preparar datos para exportación
  const exportData = orders.map((order) => ({
    factura: order.invoiceNumber,
    proveedor: order.supplier.name,
    contacto: order.supplier.contact || '-',
    email: order.supplier.email || '-',
    fecha: new Date(order.date).toLocaleDateString('es-EC'),
    estado: order.status === 'RECEIVED' ? 'Recibido' : order.status === 'PENDING' ? 'Pendiente' : 'Cancelado',
    total: order.totalAmount,
  }));

  const exportColumns = [
    { header: 'Factura #', dataKey: 'factura' },
    { header: 'Proveedor', dataKey: 'proveedor' },
    { header: 'Contacto', dataKey: 'contacto' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Total', dataKey: 'total' },
  ];

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Compras a Fábrica</h1>
      <div className="flex gap-2">
        {orders.length > 0 && (
          <ExportButton
            data={exportData}
            filename="compras"
            columns={exportColumns}
            title="Reporte de Compras"
          />
        )}
        <Link href="/admin/purchases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compra
          </Button>
        </Link>
      </div>
    </div>
  );
}
