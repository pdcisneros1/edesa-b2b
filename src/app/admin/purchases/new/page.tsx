import { PurchaseOrderForm } from '@/components/admin/PurchaseOrderForm';
import { getSuppliers } from '@/lib/actions/suppliers';
import prisma from '@/lib/prisma';

export default async function NewPurchaseOrderPage() {
    const suppliers = await getSuppliers();
    const products = await prisma.product.findMany({
        select: { id: true, name: true, sku: true },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Nueva Orden de Compra</h1>
            <PurchaseOrderForm suppliers={suppliers} products={products} />
        </div>
    );
}
