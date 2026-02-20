import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Order, OrderItem, OrderStatus } from '@/types/sales';
import { TAX_RATE, SHIPPING_METHODS } from '@/lib/constants';
import { checkRateLimit, getClientIp, CHECKOUT_RATE_LIMIT } from '@/lib/rate-limit';

// Helper: map a Prisma Order (with items) to the local Order type shape
// This keeps the API response backward-compatible with all consumers.
function prismaOrderToLocal(
  dbOrder: {
    id: string;
    orderNumber: string;
    customerId: string | null;
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
    customerId: dbOrder.customerId ?? 'guest',
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

// GET /api/orders — admin only
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const dbOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const orders = dbOrders.map(prismaOrderToLocal);
  return NextResponse.json({ orders });
}

// POST /api/orders — crea un pedido
export async function POST(request: NextRequest) {
  // Rate limiting por IP para prevenir abuso del checkout
  const ip = getClientIp(request);
  const ipCheck = checkRateLimit(`checkout:ip:${ip}`, CHECKOUT_RATE_LIMIT);
  if (ipCheck.limited) {
    const retryAfterSecs = Math.ceil(ipCheck.retryAfterMs / 1000);
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta nuevamente más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSecs) },
      }
    );
  }

  try {
    const body = await request.json();
    console.log('📦 Pedido recibido:', {
      hasCustomerInfo: !!body.customerInfo,
      hasShippingAddress: !!body.shippingAddress,
      hasShippingMethod: !!body.shippingMethod,
      hasPaymentMethod: !!body.paymentMethod,
      itemsCount: body.items?.length,
    });

    const {
      customerInfo,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      notes,
      items,
    } = body as {
      customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        company?: string;
        taxId?: string;
      };
      shippingAddress: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
      };
      shippingMethod: string;
      paymentMethod: string;
      notes?: string;
      items: {
        productId: string;
        productSku?: string;
        productName: string;
        // NOTA: price del cliente se IGNORA completamente — se re-fetcha de DB
        price?: number;
        quantity: number;
      }[];
    };

    // Validar campos requeridos
    if (!customerInfo || !shippingAddress || !shippingMethod || !paymentMethod || !items?.length) {
      console.error('❌ Validación fallida:', {
        customerInfo: !!customerInfo,
        shippingAddress: !!shippingAddress,
        shippingMethod: !!shippingMethod,
        paymentMethod: !!paymentMethod,
        itemsLength: items?.length,
      });
      return NextResponse.json({ error: 'Datos de pedido incompletos' }, { status: 400 });
    }

    // Validar que los items tengan estructura válida
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 9999) {
        return NextResponse.json({ error: 'Cantidad de producto inválida' }, { status: 400 });
      }
    }

    // Validar notas (longitud máxima)
    if (notes && typeof notes === 'string' && notes.length > 500) {
      return NextResponse.json({ error: 'Las notas no pueden exceder 500 caracteres' }, { status: 400 });
    }

    // Obtener sesión del usuario autenticado (opcional — guest checkout permitido)
    const { session } = await requireAuth(request);

    const selectedMethod = SHIPPING_METHODS.find((m) => m.id === shippingMethod);
    const shippingCost = selectedMethod?.price ?? 5;

    const orderNumber = `EDV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`;
    const shippingStreet = shippingAddress.address1 + (shippingAddress.address2 ? `, ${shippingAddress.address2}` : '');

    // Transacción atómica: re-fetch precios desde DB, validar stock, crear pedido, decrementar stock
    const dbOrder = await prisma.$transaction(async (tx) => {
      // Resolver precios REALES desde la base de datos — ignorar precios del cliente
      let subtotal = 0;
      const resolvedItems: {
        productId: string;
        productSku: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const quantity = Number(item.quantity);

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        });

        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        if (!product.isActive) {
          throw new Error(`El producto "${product.name}" ya no está disponible`);
        }

        if (product.stock < quantity) {
          throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
        }

        // PRECIO AUTORITATIVO: siempre desde la DB, nunca del cliente
        const unitPrice = product.price;
        const itemSubtotal = Math.round(unitPrice * quantity * 100) / 100;
        subtotal += itemSubtotal;

        resolvedItems.push({
          productId: product.id,
          productSku: product.sku,
          productName: product.name,
          quantity,
          unitPrice,
          subtotal: itemSubtotal,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

      // Crear pedido con todos los items
      // NOTA: customerId se deja como null porque session.userId es de la tabla User,
      // no de Customer. Los datos del cliente se guardan en los campos snapshot.
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: null,
          customerName,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone ?? null,
          customerCompany: customerInfo.company ?? null,
          customerTaxId: customerInfo.taxId ?? null,
          subtotal,
          tax,
          shipping: shippingCost,
          total,
          status: 'pendiente_pago',
          paymentMethod,
          notes: notes ? notes.trim() : null,
          shippingStreet,
          shippingCity: shippingAddress.city,
          shippingProvince: shippingAddress.state,
          shippingZipCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country ?? 'Ecuador',
          shippingMethod,
          items: {
            create: resolvedItems,
          },
        },
        include: { items: true },
      });

      // Decrementar stock para cada item
      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    const order = prismaOrderToLocal(dbOrder);
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar el pedido';
    // Errores de stock/producto son user-facing (422); otros son errores del servidor (500)
    const isUserError =
      message.includes('Stock insuficiente') ||
      message.includes('Producto no encontrado') ||
      message.includes('ya no está disponible');

    console.error('❌ ERROR AL CREAR PEDIDO:', {
      message,
      stack: err instanceof Error ? err.stack : undefined,
      isUserError,
    });

    return NextResponse.json(
      { error: isUserError ? message : 'Error al procesar el pedido. Intenta nuevamente.' },
      { status: isUserError ? 422 : 500 }
    );
  }
}
