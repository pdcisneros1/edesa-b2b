'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { confirmPurchaseOrder } from '@/lib/actions/purchase-orders';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/utils';
import { CheckCircle, Trash2 } from 'lucide-react';

interface OrderDetailProps {
    order: any; // Using any for simplicity in this generated component, better to use Prisma generated types
}

export function PurchaseOrderDetail({ order }: OrderDetailProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!confirm('¿Estás seguro de recibir esta mercadería? El stock se actualizará automáticamente.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await confirmPurchaseOrder(order.id);
            if (result.success) {
                toast.success('Mercadería recibida y stock actualizado');
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al confirmar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (order.status === 'RECEIVED') {
            toast.error('No se puede eliminar una orden ya recibida');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar la orden ${order.invoiceNumber}? Esta acción no se puede deshacer.`)) {
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/purchases/${order.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Orden eliminada exitosamente');
                router.push('/admin/purchases');
            } else {
                toast.error(data.error || 'Error al eliminar orden');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar orden');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Orden #{order.invoiceNumber}</h1>
                    <p className="text-gray-500">Proveedor: {order.supplier.name}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Badge className="text-lg px-4 py-1" variant={order.status === 'RECEIVED' ? 'default' : 'secondary'}>
                        {order.status === 'RECEIVED' ? 'RECIBIDO' : 'PENDIENTE'}
                    </Badge>

                    {order.status === 'PENDING' && (
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleConfirm}
                                disabled={loading || deleting}
                                className="bg-green-600 hover:bg-green-700 w-full"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {loading ? 'Procesando...' : 'Confirmar Recepción'}
                            </Button>

                            <Button
                                onClick={handleDelete}
                                disabled={loading || deleting}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deleting ? 'Eliminando...' : 'Eliminar Orden'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Fecha</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDate(order.date)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Total Factura</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(order.totalAmount)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{order.items.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3">Producto</th>
                                <th className="text-right py-3">Cantidad</th>
                                <th className="text-right py-3">Costo Unit.</th>
                                <th className="text-right py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="py-3">
                                        <div className="font-medium">{item.product.name}</div>
                                        <div className="text-xs text-gray-500">{item.product.sku}</div>
                                    </td>
                                    <td className="text-right py-3">{item.quantity}</td>
                                    <td className="text-right py-3">{formatCurrency(item.unitCost)}</td>
                                    <td className="text-right py-3 font-medium">{formatCurrency(item.totalCost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
