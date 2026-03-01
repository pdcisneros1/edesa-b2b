import prisma from '@/lib/prisma';
import { ReportesClient } from '@/components/admin/reportes/ReportesClient';
import type { Order, OrderItem, OrderStatus } from '@/types/sales';

export const dynamic = 'force-dynamic';

export default async function ReportesPage() {
  const [products, categories, dbOrders, purchaseOrders, users] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: true,
        brand: true,
      },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    }),
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { not: 'admin' } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Map Prisma orders to local Order type
  const orders: Order[] = dbOrders.map((dbOrder) => {
    const orderItems: OrderItem[] = dbOrder.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productSku: item.productSku,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    return {
      id: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
      customerId: dbOrder.userId,
      customerName: dbOrder.customerName,
      customerEmail: dbOrder.customerEmail,
      customerPhone: dbOrder.customerPhone ?? undefined,
      customerCompany: dbOrder.customerCompany ?? undefined,
      customerTaxId: dbOrder.customerTaxId ?? undefined,
      items: orderItems,
      subtotal: dbOrder.subtotal,
      tax: dbOrder.tax,
      shipping: dbOrder.shipping,
      total: dbOrder.total,
      status: dbOrder.status as OrderStatus,
      paymentMethod: dbOrder.paymentMethod ?? undefined,
      notes: dbOrder.notes ?? undefined,
      shippingAddress: {
        street: dbOrder.shippingStreet,
        city: dbOrder.shippingCity,
        province: dbOrder.shippingProvince,
        zipCode: dbOrder.shippingZipCode,
        country: dbOrder.shippingCountry,
      },
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
    };
  });

  return (
    <ReportesClient
      products={products as any}
      categories={categories as any}
      orders={orders}
      purchaseOrders={purchaseOrders as any}
      users={users as any}
    />
  );
}
