import { ProductsTable } from '@/components/admin/ProductsTable';
import { ProductosHeader } from '@/components/admin/productos/ProductosHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, brand: true, images: true }
  });

  return (
    <div className="space-y-6">
      <ProductosHeader products={products as any} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12">
          <Package className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No hay productos
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza agregando tu primer producto
          </p>
          <Link href="/admin/productos/nuevo">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </Link>
        </div>
      ) : (
        <ProductsTable products={products as any} />
      )}
    </div>
  );
}
