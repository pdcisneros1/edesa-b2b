import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import { getProductsNeedingReorder } from '@/lib/inventory-intelligence-simple';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/inventory/reorder
 * Obtiene lista de productos que necesitan reabastecimiento
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const productsNeedingReorder = await getProductsNeedingReorder();

    return NextResponse.json({
      success: true,
      count: productsNeedingReorder.length,
      products: productsNeedingReorder,
    });
  } catch (error) {
    console.error('Error al obtener productos para reorden:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/inventory/reorder
 * Crea órdenes de compra automáticamente para productos con stock bajo
 * OPTIMIZADO: Proceso rápido con transacciones
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    console.log('🔍 Buscando productos con stock bajo...');
    const productsNeedingReorder = await getProductsNeedingReorder();

    if (productsNeedingReorder.length === 0) {
      console.log('✅ No hay productos con stock bajo');
      return NextResponse.json({
        success: true,
        message: 'No hay productos que requieran reabastecimiento',
        ordersCreated: 0,
      });
    }

    console.log(`📦 Encontrados ${productsNeedingReorder.length} productos con stock bajo`);

    // Buscar o crear proveedor genérico (una sola query)
    let supplier = await prisma.supplier.findFirst({
      where: { name: 'Proveedor Genérico' },
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'Proveedor Genérico',
          contact: 'N/A',
          email: 'compras@edesaventas.ec',
          phone: 'N/A',
        },
      });
    }

    // Obtener el último número de factura
    const lastPurchase = await prisma.purchaseOrder.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextNumber = lastPurchase
      ? parseInt(lastPurchase.invoiceNumber.replace('PO-', '')) + 1
      : 1;

    console.log('💾 Creando órdenes de compra...');

    // Crear todas las órdenes en paralelo para máxima velocidad
    const orderPromises = productsNeedingReorder.map(async (product) => {
      const invoiceNumber = `PO-${nextNumber.toString().padStart(6, '0')}`;
      const unitCost = product.costPrice || product.price * 0.6;
      const quantity = product.suggestedQuantity;
      const totalCost = unitCost * quantity;

      nextNumber++;

      return prisma.purchaseOrder.create({
        data: {
          invoiceNumber,
          supplierId: supplier.id,
          status: 'PENDING',
          totalAmount: totalCost,
          items: {
            create: {
              productId: product.id,
              quantity,
              unitCost,
              totalCost,
            },
          },
        },
        select: {
          invoiceNumber: true,
          totalAmount: true,
        },
      });
    });

    // Ejecutar todas las creaciones en paralelo
    const createdOrders = await Promise.all(orderPromises);

    console.log(`✅ ${createdOrders.length} órdenes creadas exitosamente`);

    return NextResponse.json({
      success: true,
      message: `${createdOrders.length} órdenes de compra creadas exitosamente`,
      ordersCreated: createdOrders.length,
      totalProducts: productsNeedingReorder.length,
      orders: createdOrders,
    });
  } catch (error) {
    console.error('❌ Error al crear órdenes de compra automáticas:', error);
    return NextResponse.json(
      {
        error: 'Error al crear órdenes de compra',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
