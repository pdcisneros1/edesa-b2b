import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import { getProductsNeedingReorder } from '@/lib/inventory-intelligence';
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
 * Crea órdenes de compra automáticamente para todos los productos que lo necesitan
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    const productsNeedingReorder = await getProductsNeedingReorder();

    if (productsNeedingReorder.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay productos que requieran reabastecimiento',
        ordersCreated: 0,
      });
    }

    // Buscar o crear proveedor genérico
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
    });

    let nextNumber = lastPurchase
      ? parseInt(lastPurchase.invoiceNumber.replace('PO-', '')) + 1
      : 1;

    const ordersCreated = [];

    // Crear una orden de compra por cada producto
    for (const product of productsNeedingReorder) {
      const invoiceNumber = `PO-${nextNumber.toString().padStart(6, '0')}`;
      const unitCost = product.costPrice || product.price * 0.6;
      const quantity = product.suggestedQuantity;
      const totalCost = unitCost * quantity;

      const purchaseOrder = await prisma.purchaseOrder.create({
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

      ordersCreated.push({
        invoiceNumber,
        productName: product.name,
        productSku: product.sku,
        quantity,
        totalCost,
        urgency: product.urgency,
      });

      nextNumber++;
    }

    return NextResponse.json({
      success: true,
      message: `${ordersCreated.length} órdenes de compra creadas exitosamente`,
      ordersCreated,
      totalProducts: productsNeedingReorder.length,
    });
  } catch (error) {
    console.error('Error al crear órdenes de compra automáticas:', error);
    return NextResponse.json(
      { error: 'Error al crear órdenes de compra' },
      { status: 500 }
    );
  }
}
