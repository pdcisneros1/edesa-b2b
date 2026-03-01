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
  if (!auth.authorized) {
    console.error('❌ No autorizado');
    return auth.response;
  }

  const csrfError = requireCsrfToken(request);
  if (csrfError) {
    console.error('❌ Error CSRF en inventory/reorder');
    return csrfError;
  }

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
    console.log('🔢 Generando número de factura...');
    const lastPurchase = await prisma.purchaseOrder.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    console.log('  Última compra:', lastPurchase?.invoiceNumber || 'Ninguna');

    let nextNumber = 1;
    if (lastPurchase?.invoiceNumber) {
      const match = lastPurchase.invoiceNumber.match(/PO-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceNumber = `PO-${nextNumber.toString().padStart(6, '0')}`;
    console.log('  Número generado:', invoiceNumber);

    console.log('💾 Creando orden de compra consolidada...');

    // Calcular items y total
    console.log('💰 Calculando costos de items...');
    const items = productsNeedingReorder.map((product) => {
      const unitCost = product.costPrice || product.price * 0.6;
      const quantity = product.suggestedQuantity;
      const totalCost = unitCost * quantity;

      console.log(`  ${product.sku}: ${quantity}x $${unitCost.toFixed(2)} = $${totalCost.toFixed(2)}`);

      // Validar que los números sean válidos
      if (isNaN(unitCost) || isNaN(totalCost) || !isFinite(unitCost) || !isFinite(totalCost)) {
        throw new Error(`Costo inválido para producto ${product.sku}: unitCost=${unitCost}, totalCost=${totalCost}`);
      }

      return {
        productId: product.id,
        quantity,
        unitCost,
        totalCost,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
    console.log('  Total general:', `$${totalAmount.toFixed(2)}`);

    // Crear UNA SOLA orden de compra con TODOS los items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        invoiceNumber,
        supplierId: supplier.id,
        status: 'PENDING',
        totalAmount,
        items: {
          create: items,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Orden consolidada creada: ${invoiceNumber} con ${items.length} productos`);

    return NextResponse.json({
      success: true,
      message: `Orden de compra ${invoiceNumber} creada con ${productsNeedingReorder.length} productos`,
      ordersCreated: 1,
      totalProducts: productsNeedingReorder.length,
      invoiceNumber: purchaseOrder.invoiceNumber,
      totalAmount: purchaseOrder.totalAmount,
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
