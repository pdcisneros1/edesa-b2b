import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import prisma from '@/lib/prisma';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      specifications: true,
      category: true,
      brand: true
    }
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
        <p className="mt-1 text-gray-500">
          Edita la información del producto
        </p>
      </div>

      <ProductForm
        product={product as any}
        categories={categories as any}
        brands={brands as any}
      />
    </div>
  );
}
