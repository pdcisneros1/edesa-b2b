import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/bulk-purchase
 * Crea UNA orden de compra consolidada con múltiples productos seleccionados
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un producto' },
        { status: 400 }
      );
    }

    console.log(`📦 Creando orden consolidada con ${items.length} productos...`);

    // Validar que todos los items tengan productId y quantity
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Datos de productos inválidos' },
          { status: 400 }
        );
      }
    }

    // Obtener información de todos los productos
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        costPrice: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Algunos productos no fueron encontrados' },
        { status: 404 }
      );
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
      select: { invoiceNumber: true },
    });

    const nextNumber = lastPurchase
      ? parseInt(lastPurchase.invoiceNumber.replace('PO-', '')) + 1
      : 1;

    const invoiceNumber = `PO-${nextNumber.toString().padStart(6, '0')}`;

    // Preparar items con costos
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitCost = product.costPrice || product.price * 0.6;
      const totalCost = unitCost * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitCost,
        totalCost,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalCost, 0);

    // Crear orden de compra consolidada
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        invoiceNumber,
        supplierId: supplier.id,
        status: 'PENDING',
        totalAmount,
        items: {
          create: orderItems,
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

    console.log(`✅ Orden ${invoiceNumber} creada con ${orderItems.length} productos`);

    return NextResponse.json({
      success: true,
      message: `Orden de compra ${invoiceNumber} creada exitosamente`,
      invoiceNumber: purchaseOrder.invoiceNumber,
      totalAmount: purchaseOrder.totalAmount,
      itemCount: orderItems.length,
    });
  } catch (error) {
    console.error('❌ Error al crear orden de compra consolidada:', error);
    return NextResponse.json(
      {
        error: 'Error al crear orden de compra',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
