'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for validation
const PurchaseOrderSchema = z.object({
    invoiceNumber: z.string().min(1, 'Número de factura requerido'),
    supplierId: z.string().min(1, 'Proveedor requerido'),
    date: z.string().optional(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        unitCost: z.number().min(0),
    })).min(1, 'Debe agregar al menos un producto'),
});

export async function createPurchaseOrder(data: z.infer<typeof PurchaseOrderSchema>) {
    try {
        console.log('Creating Purchase Order with data:', JSON.stringify(data, null, 2));
        const validated = PurchaseOrderSchema.parse(data);

        // Calculate total
        const totalAmount = validated.items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                invoiceNumber: validated.invoiceNumber,
                supplierId: validated.supplierId,
                date: validated.date ? new Date(validated.date) : new Date(),
                status: 'PENDING',
                totalAmount,
                items: {
                    create: validated.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        totalCost: item.quantity * item.unitCost,
                    })),
                },
            },
        });

        console.log('Purchase Order created:', purchaseOrder.id);
        revalidatePath('/admin/purchases');
        return { success: true, order: purchaseOrder };
    } catch (error) {
        console.error('Error creating purchase order:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Datos inválidos: ' + error.issues.map((e) => e.message).join(', ') };
        }
        return { success: false, error: 'Error al crear la orden de compra. Revise la consola del servidor.' };
    }
}

export async function confirmPurchaseOrder(orderId: string) {
    try {
        await prisma.$transaction(async (tx: any) => {
            // 1. Get the order with items
            const order = await tx.purchaseOrder.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order) throw new Error('Orden no encontrada');
            if (order.status !== 'PENDING') throw new Error('La orden no está en estado pendiente');

            // 2. Update stock for each product
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            // 3. Update order status
            await tx.purchaseOrder.update({
                where: { id: orderId },
                data: { status: 'RECEIVED' },
            });
        });

        revalidatePath('/admin/purchases');
        return { success: true };
    } catch (error) {
        console.error('Error confirming purchase order:', error);
        return { success: false, error: 'Error al confirmar la recepción' };
    }
}
