import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/stock-alerts
 *
 * Verifica productos con stock bajo y envía email al admin.
 *
 * Stock bajo = stock < 10 (minStock predeterminado)
 *
 * Puede ejecutarse:
 * - Manualmente desde el admin panel
 * - Automáticamente via Vercel Cron (diario)
 */
export async function GET(request: NextRequest) {
  // 🔒 AUTENTICACIÓN: Solo admin puede ejecutar manualmente
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    // Buscar productos con stock bajo (< 10 unidades)
    const MIN_STOCK = 10;

    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lt: MIN_STOCK,
        },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        stock: true,
      },
      orderBy: {
        stock: 'asc', // Los más críticos primero
      },
    });

    // Si no hay productos con stock bajo, retornar éxito
    if (lowStockProducts.length === 0) {
      console.log('✅ No hay productos con stock bajo');
      return NextResponse.json({
        success: true,
        message: 'No hay productos con stock bajo',
        productsCount: 0,
      });
    }

    console.log(`⚠️ ${lowStockProducts.length} productos con stock bajo detectados`);

    // 📧 Enviar email al admin
    try {
      const { sendLowStockAlert } = await import('@/lib/email');

      // Obtener email del admin principal
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@edesaventas.ec';

      const productsForEmail = lowStockProducts.map(product => ({
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        minStock: MIN_STOCK,
      }));

      await sendLowStockAlert(productsForEmail);

      console.log(`✅ Email de alerta de stock enviado a: ${adminEmail}`);
      console.log(`   Productos en alerta: ${lowStockProducts.map(p => p.sku).join(', ')}`);

      return NextResponse.json({
        success: true,
        message: `Alerta enviada: ${lowStockProducts.length} productos con stock bajo`,
        productsCount: lowStockProducts.length,
        products: lowStockProducts.map(p => ({
          sku: p.sku,
          name: p.name,
          stock: p.stock,
        })),
      });
    } catch (emailError) {
      console.error('❌ Error al enviar email de alerta de stock:', emailError);
      throw new Error(`Error al enviar email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error en stock-alerts:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar las alertas de stock',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
