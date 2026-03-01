import prisma from '@/lib/prisma';
import { CartItem } from '@/types/cart';

/**
 * ============================================================================
 * TRACKING DE ABANDONO DE CARRITO
 * ============================================================================
 */

/**
 * Guarda/actualiza el carrito del usuario para tracking
 * Llamar cada vez que se modifica el carrito
 */
export async function trackCart(params: {
  userId?: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
}): Promise<void> {
  try {
    console.log('🔍 trackCart llamado con:', { userId: params.userId, email: params.customerEmail, itemsCount: params.items.length });

    if (!params.userId && !params.customerEmail) {
      console.log('⚠️ No hay userId ni email - saliendo');
      return;
    }

    // Buscar carrito existente
    console.log('🔍 Buscando carrito existente...');
    const existingCart = params.userId
      ? await prisma.abandonedCart.findFirst({
          where: {
            userId: params.userId,
            status: { in: ['ACTIVE', 'ABANDONED'] },
          },
        })
      : null;

    console.log('🔍 Carrito existente:', existingCart ? existingCart.id : 'No existe');

    const cartData = {
      userId: params.userId,
      items: params.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.product.name,
        sku: item.product.sku,
      })),
      subtotal: params.subtotal,
      total: params.total,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      status: 'ACTIVE' as const,
      updatedAt: new Date(),
    };

    if (existingCart) {
      console.log('🔄 Actualizando carrito existente...');
      await prisma.abandonedCart.update({
        where: { id: existingCart.id },
        data: cartData,
      });
      console.log('✅ Carrito actualizado');
    } else {
      console.log('🔄 Creando nuevo carrito...');
      const created = await prisma.abandonedCart.create({
        data: cartData,
      });
      console.log('✅ Carrito creado:', created.id);
    }
  } catch (error) {
    console.error('❌ Error tracking cart:', error);
    throw error; // Lanzar el error para verlo en el endpoint
  }
}

/**
 * Marca un carrito como convertido cuando se completa una orden
 */
export async function markCartAsConverted(
  userId: string,
  orderId: string
): Promise<void> {
  try {
    await prisma.abandonedCart.updateMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'ABANDONED'] },
      },
      data: {
        status: 'RECOVERED',
        convertedToOrderId: orderId,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error marking cart as converted:', error);
  }
}

/**
 * Identifica carritos abandonados (> 1 hora sin actividad)
 * Llamar en un cron job cada hora
 */
export async function identifyAbandonedCarts(): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Marcar carritos como abandonados (> 1 hora, < 7 días)
    await prisma.abandonedCart.updateMany({
      where: {
        status: 'ACTIVE',
        updatedAt: {
          lt: oneHourAgo,
          gte: sevenDaysAgo,
        },
      },
      data: {
        status: 'ABANDONED',
      },
    });

    // Marcar carritos como expirados (> 7 días)
    await prisma.abandonedCart.updateMany({
      where: {
        status: { in: ['ACTIVE', 'ABANDONED'] },
        updatedAt: {
          lt: sevenDaysAgo,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    console.log('✅ Carritos abandonados actualizados');
  } catch (error) {
    console.error('❌ Error identifying abandoned carts:', error);
  }
}

/**
 * Calcula tasa de abandono de carrito
 */
export async function calculateAbandonmentRate(
  startDate: Date,
  endDate: Date
): Promise<{
  abandonmentRate: number;
  totalCarts: number;
  abandonedCarts: number;
  recoveredCarts: number;
  activeRevenue: number; // Revenue potencial en carritos abandonados
}> {
  try {
    // Total de carritos creados en el período
    const totalCarts = await prisma.abandonedCart.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Carritos abandonados (no convertidos)
    const abandonedCarts = await prisma.abandonedCart.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['ABANDONED', 'EXPIRED'] },
      },
    });

    // Carritos recuperados (convertidos)
    const recoveredCarts = await prisma.abandonedCart.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'RECOVERED',
      },
    });

    // Revenue potencial en carritos abandonados
    const abandonedCartsWithRevenue = await prisma.abandonedCart.findMany({
      where: {
        status: { in: ['ABANDONED', 'EXPIRED'] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
      },
    });

    const activeRevenue = abandonedCartsWithRevenue.reduce(
      (sum, cart) => sum + cart.total,
      0
    );

    // Calcular tasa de abandono
    const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;

    return {
      abandonmentRate,
      totalCarts,
      abandonedCarts,
      recoveredCarts,
      activeRevenue,
    };
  } catch (error) {
    console.error('Error calculating abandonment rate:', error);
    return {
      abandonmentRate: 0,
      totalCarts: 0,
      abandonedCarts: 0,
      recoveredCarts: 0,
      activeRevenue: 0,
    };
  }
}

/**
 * Obtiene carritos abandonados listos para email de recuperación
 * (abandonados hace 2-6 horas y sin email enviado)
 */
export async function getCartsForRecovery(): Promise<
  Array<{
    id: string;
    customerEmail: string;
    customerName: string;
    items: any;
    total: number;
    createdAt: Date;
  }>
> {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const carts = await prisma.abandonedCart.findMany({
      where: {
        status: 'ABANDONED',
        recoveryEmailSent: false,
        customerEmail: { not: null },
        updatedAt: {
          gte: sixHoursAgo,
          lte: twoHoursAgo,
        },
      },
      select: {
        id: true,
        customerEmail: true,
        customerName: true,
        items: true,
        total: true,
        createdAt: true,
      },
    });

    return carts.filter((c) => c.customerEmail !== null).map((c) => ({
      ...c,
      customerEmail: c.customerEmail!,
      customerName: c.customerName || 'Cliente',
    }));
  } catch (error) {
    console.error('Error getting carts for recovery:', error);
    return [];
  }
}

/**
 * Marca que se envió email de recuperación
 */
export async function markRecoveryEmailSent(cartId: string): Promise<void> {
  try {
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: {
        recoveryEmailSent: true,
        recoveryEmailSentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error marking recovery email sent:', error);
  }
}
