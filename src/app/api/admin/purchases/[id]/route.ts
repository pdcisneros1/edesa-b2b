import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/admin/purchases/[id]
 * Elimina una orden de compra y sus items relacionados
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id } = await params;

    // Verificar que la orden exista
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, invoiceNumber: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // No permitir eliminar órdenes ya recibidas
    if (order.status === 'RECEIVED') {
      return NextResponse.json(
        {
          success: false,
          error: 'No se puede eliminar una orden ya recibida. El stock ya fue actualizado.'
        },
        { status: 400 }
      );
    }

    // Eliminar orden (los items se eliminan automáticamente por onDelete: Cascade)
    await prisma.purchaseOrder.delete({
      where: { id },
    });

    console.log(`✅ Orden ${order.invoiceNumber} eliminada exitosamente`);

    return NextResponse.json({
      success: true,
      message: `Orden ${order.invoiceNumber} eliminada exitosamente`,
    });
  } catch (error) {
    console.error('❌ Error al eliminar orden de compra:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar orden de compra',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
