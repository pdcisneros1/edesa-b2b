import prisma from '@/lib/prisma';

/**
 * ============================================================================
 * TRACKING DE CONVERSIÓN (SESIONES → ÓRDENES)
 * ============================================================================
 */

/**
 * Registra un login/sesión de usuario para tracking de conversión
 * Llamar al hacer login exitoso
 */
export async function trackUserSession(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        sessionCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('Error tracking session:', error);
    // No lanzar error para no romper el login
  }
}

/**
 * Calcula la tasa de conversión (sesiones → órdenes completadas)
 *
 * @param startDate Fecha inicio del período
 * @param endDate Fecha fin del período
 * @returns Tasa de conversión como porcentaje
 */
export async function calculateConversionRate(
  startDate: Date,
  endDate: Date
): Promise<{
  conversionRate: number;
  totalSessions: number;
  totalOrders: number;
  uniqueCustomers: number;
}> {
  try {
    // Contar sesiones únicas (usuarios que se loguearon en el período)
    const uniqueCustomers = await prisma.user.count({
      where: {
        role: 'cliente',
        lastLoginAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Total de sesiones en el período
    const usersWithSessions = await prisma.user.findMany({
      where: {
        role: 'cliente',
        lastLoginAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        sessionCount: true,
      },
    });

    const totalSessions = usersWithSessions.reduce(
      (sum, user) => sum + user.sessionCount,
      0
    );

    // Contar órdenes completadas en el período
    const totalOrders = await prisma.order.count({
      where: {
        status: {
          in: ['pagado', 'en_proceso', 'enviado', 'entregado'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calcular tasa de conversión
    const conversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;

    return {
      conversionRate,
      totalSessions,
      totalOrders,
      uniqueCustomers,
    };
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    return {
      conversionRate: 0,
      totalSessions: 0,
      totalOrders: 0,
      uniqueCustomers: 0,
    };
  }
}

/**
 * Obtiene métricas de conversión mes a mes
 * Útil para gráficos de tendencias
 */
export async function getConversionTrend(months = 6): Promise<
  Array<{
    month: string;
    conversionRate: number;
    sessions: number;
    orders: number;
  }>
> {
  const results: Array<{
    month: string;
    conversionRate: number;
    sessions: number;
    orders: number;
  }> = [];

  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const metrics = await calculateConversionRate(startOfMonth, endOfMonth);

    results.push({
      month: startOfMonth.toLocaleDateString('es-EC', {
        month: 'short',
        year: 'numeric',
      }),
      conversionRate: metrics.conversionRate,
      sessions: metrics.totalSessions,
      orders: metrics.totalOrders,
    });
  }

  return results;
}
