import { ProductForm } from '@/components/admin/ProductForm';
import prisma from '@/lib/prisma';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Producto</h1>
        <p className="mt-1 text-gray-500">
          Agrega un nuevo producto al catálogo
        </p>
      </div>

      <ProductForm categories={categories as any} brands={brands as any} />
    </div>
  );
}
