import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { PurchasesHeader } from '@/components/admin/purchases/PurchasesHeader';

export default async function PurchaseOrdersPage() {
    const orders = await prisma.purchaseOrder.findMany({
        include: { supplier: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <PurchasesHeader orders={orders as any} />

            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left font-medium text-gray-500">Factura #</th>
                            <th className="h-12 px-4 text-left font-medium text-gray-500">Proveedor</th>
                            <th className="h-12 px-4 text-left font-medium text-gray-500">Fecha</th>
                            <th className="h-12 px-4 text-left font-medium text-gray-500">Estado</th>
                            <th className="h-12 px-4 text-right font-medium text-gray-500">Total</th>
                            <th className="h-12 px-4 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-24 text-center text-gray-500">
                                    No hay órdenes de compra registradas.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium">{order.invoiceNumber}</td>
                                    <td className="p-4">{order.supplier.name}</td>
                                    <td className="p-4">{formatDate(order.date)}</td>
                                    <td className="p-4">
                                        <Badge variant={order.status === 'RECEIVED' ? 'default' : 'secondary'}>
                                            {order.status === 'RECEIVED' ? 'Recibido' : 'Pendiente'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/admin/purchases/${order.id}`}>
                                            <Button variant="ghost" size="sm">
                                                Ver Detalles
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
