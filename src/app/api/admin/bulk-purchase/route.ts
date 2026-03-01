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
  if (!auth.authorized) {
    console.error('❌ No autorizado');
    return auth.response;
  }

  const csrfError = requireCsrfToken(request);
  if (csrfError) {
    console.error('❌ Error CSRF');
    return csrfError;
  }

  try {
    const body = await request.json();
    console.log('📥 Body recibido:', JSON.stringify(body, null, 2));

    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      console.error('❌ Items inválidos:', items);
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar al menos un producto' },
        { status: 400 }
      );
    }

    console.log(`📦 Creando orden consolidada con ${items.length} productos...`);

    // Validar que todos los items tengan productId y quantity
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        console.error('❌ Item inválido:', item);
        return NextResponse.json(
          { success: false, error: `Datos de productos inválidos: ${JSON.stringify(item)}` },
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
      console.error(`❌ Solo se encontraron ${products.length} de ${items.length} productos`);
      return NextResponse.json(
        { success: false, error: `Solo se encontraron ${products.length} de ${items.length} productos` },
        { status: 404 }
      );
    }

    // Buscar o crear proveedor genérico
    console.log('🔍 Buscando proveedor...');
    let supplier = await prisma.supplier.findFirst({
      where: { name: 'Proveedor Genérico' },
    });

    if (!supplier) {
      console.log('➕ Creando proveedor genérico...');
      try {
        supplier = await prisma.supplier.create({
          data: {
            name: 'Proveedor Genérico',
            contact: 'N/A',
            email: 'compras@edesaventas.ec',
            phone: 'N/A',
          },
        });
        console.log('✅ Proveedor creado:', supplier.id);
      } catch (supplierError) {
        console.error('❌ Error al crear proveedor:', supplierError);
        throw supplierError;
      }
    } else {
      console.log('✅ Proveedor encontrado:', supplier.id);
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

    // Preparar items con costos
    console.log('💰 Calculando costos de items...');
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitCost = product.costPrice || product.price * 0.6;
      const totalCost = unitCost * item.quantity;

      console.log(`  ${product.sku}: ${item.quantity}x $${unitCost.toFixed(2)} = $${totalCost.toFixed(2)}`);

      // Validar que los números sean válidos
      if (isNaN(unitCost) || isNaN(totalCost) || !isFinite(unitCost) || !isFinite(totalCost)) {
        throw new Error(`Costo inválido para producto ${product.sku}: unitCost=${unitCost}, totalCost=${totalCost}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitCost,
        totalCost,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalCost, 0);
    console.log('  Total general:', `$${totalAmount.toFixed(2)}`);

    console.log('📝 Creando orden de compra...');
    console.log('  Invoice:', invoiceNumber);
    console.log('  Supplier ID:', supplier.id);
    console.log('  Total amount:', totalAmount);
    console.log('  Items count:', orderItems.length);

    // Crear orden de compra consolidada
    let purchaseOrder;
    try {
      purchaseOrder = await prisma.purchaseOrder.create({
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
      console.log(`✅ Orden ${invoiceNumber} creada exitosamente`);
    } catch (orderError) {
      console.error('❌ Error al crear orden de compra:',orderError);
      console.error('Detalles del error:', JSON.stringify(orderError, null, 2));
      throw orderError;
    }

    console.log(`✅ Orden ${invoiceNumber} completada con ${orderItems.length} productos`);

    return NextResponse.json({
      success: true,
      message: `Orden de compra ${invoiceNumber} creada exitosamente`,
      invoiceNumber: purchaseOrder.invoiceNumber,
      totalAmount: purchaseOrder.totalAmount,
      itemCount: orderItems.length,
    });
  } catch (error) {
    console.error('❌ Error al crear orden de compra consolidada:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear orden de compra',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
