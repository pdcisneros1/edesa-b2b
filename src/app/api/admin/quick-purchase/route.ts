import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/quick-purchase
 * Crea una orden de compra rápida desde el listado de productos con stock bajo
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  // 🔒 CSRF Protection
  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Product ID y cantidad son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
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

    // Generar número de factura único
    const lastPurchase = await prisma.purchaseOrder.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const nextNumber = lastPurchase
      ? parseInt(lastPurchase.invoiceNumber.replace('PO-', '')) + 1
      : 1;

    const invoiceNumber = `PO-${nextNumber.toString().padStart(6, '0')}`;

    // Calcular costos (usar costPrice o price * 0.6 como estimación)
    const unitCost = product.costPrice || product.price * 0.6;
    const totalCost = unitCost * quantity;

    // Crear orden de compra
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
            product: true,
          },
        },
        supplier: true,
      },
    });

    return NextResponse.json({
      success: true,
      purchaseOrder,
      message: `Orden de compra ${invoiceNumber} creada exitosamente`,
    });
  } catch (error) {
    console.error('Error al crear orden de compra rápida:', error);
    return NextResponse.json(
      { error: 'Error al crear orden de compra' },
      { status: 500 }
    );
  }
}
