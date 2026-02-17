import { PurchaseOrderDetail } from '@/components/admin/PurchaseOrderDetail';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function PurchaseOrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            supplier: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order) {
        notFound();
    }

    return <PurchaseOrderDetail order={order} />;
}
