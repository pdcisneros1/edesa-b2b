import { InventarioDashboard } from '@/components/admin/inventario/InventarioDashboard';
import prisma from '@/lib/prisma';
import { getProductsNeedingReorder } from '@/lib/inventory-intelligence';

// Forzar renderizado dinámico (no estático)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inventario Inteligente | Admin',
  description: 'Gestión inteligente de inventario con predicción de demanda',
};

export default async function InventarioPage() {
  // Obtener productos que necesitan reorden
  const productsNeedingReorder = await getProductsNeedingReorder();

  // Estadísticas generales
  const totalProducts = await prisma.product.count({
    where: { isActive: true },
  });

  const productsWithSafetyStock = await prisma.product.count({
    where: {
      isActive: true,
      safetyStock: { not: null },
    },
  });

  const lowStockProducts = await prisma.product.count({
    where: {
      isActive: true,
      stock: { lt: 10 },
    },
  });

  const stats = {
    totalProducts,
    productsWithSafetyStock,
    productsNeedingReorder: productsNeedingReorder.length,
    lowStockProducts,
    criticalProducts: productsNeedingReorder.filter((p) => p.urgency === 'critical').length,
    highUrgencyProducts: productsNeedingReorder.filter((p) => p.urgency === 'high').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventario Inteligente</h1>
        <p className="text-muted-foreground mt-1">
          Predicción de demanda y gestión automática de reabastecimiento
        </p>
      </div>

      <InventarioDashboard
        stats={stats}
        productsNeedingReorder={productsNeedingReorder as any}
      />
    </div>
  );
}
