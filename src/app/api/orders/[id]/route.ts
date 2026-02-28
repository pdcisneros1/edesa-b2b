import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import prisma from '@/lib/prisma';
import { REAL_ORDER_STATUSES } from '@/types/sales';
import type { Order, OrderItem, OrderStatus } from '@/types/sales';
// Prisma-generated enum type for Order.status
import type { OrderStatus as PrismaOrderStatus } from '@prisma/client';

// Helper: map a Prisma Order (with items) to the local Order type shape
function prismaOrderToLocal(
  dbOrder: {
    id: string;
    orderNumber: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerCompany: string | null;
    customerTaxId: string | null;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    status: string;
    paymentMethod: string | null;
    notes: string | null;
    shippingStreet: string;
    shippingCity: string;
    shippingProvince: string;
    shippingZipCode: string;
    shippingCountry: string;
    shippingMethod: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      orderId: string;
      productId: string;
      productSku: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
  }
): Order {
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
    customerId: dbOrder.userId, // B2B: userId IS customerId
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
}

// GET /api/orders/[id] — admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  const dbOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!dbOrder) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ order: prismaOrderToLocal(dbOrder) });
}

// PUT /api/orders/[id] — update status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  // 🔒 CSRF Protection
  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: OrderStatus };

  const validStatuses = REAL_ORDER_STATUSES.map((s) => s.value);
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const dbOrder = await prisma.order.update({
    where: { id },
    // Cast from local string union to Prisma enum — values are identical
    data: { status: status as PrismaOrderStatus },
    include: { items: true },
  });

  const order = prismaOrderToLocal(dbOrder);

  // 📧 Enviar email de cambio de estado (no bloquear la respuesta)
  try {
    const { sendOrderStatusEmail } = await import('@/lib/email');
    const statusMessages: Record<string, string> = {
      pendiente_pago: 'Tu pedido está pendiente de confirmación de pago.',
      confirmado: '¡Tu pedido ha sido confirmado! Comenzaremos a prepararlo pronto.',
      en_preparacion: 'Estamos preparando tu pedido con cuidado.',
      enviado: '¡Tu pedido está en camino! Recibirás el tracking pronto.',
      entregado: '¡Tu pedido ha sido entregado! Gracias por tu compra.',
      cancelado: 'Tu pedido ha sido cancelado. Contáctanos si tienes dudas.',
    };

    await sendOrderStatusEmail(order.customerEmail, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      statusMessage: statusMessages[status] || 'El estado de tu pedido ha cambiado.',
    });
  } catch (emailError) {
    console.error('❌ Error al enviar email de cambio de estado:', emailError);
    // No fallar la actualización si el email falla
  }

  return NextResponse.json({ order });
}
