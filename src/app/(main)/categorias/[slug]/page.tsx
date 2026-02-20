import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { ProductGrid } from '@/components/products/ProductGrid';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SITE_NAME } from '@/lib/constants';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: 'Categoría no encontrada' };

  return {
    title: `${category.name} | ${SITE_NAME}`,
    description:
      category.description ||
      `Catálogo de productos ${category.name.toLowerCase()} — sanitarios, griferías y acabados de construcción en Ecuador.`,
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description:
        category.description ||
        `Productos de ${category.name} para ferreterías y distribuidores en Ecuador.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category, products] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    prisma.product.findMany({
      where: {
        category: { slug },
        isActive: true,
      },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!category) notFound();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-7">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-500 hover:text-gray-900 text-xs">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/categorias" className="text-gray-500 hover:text-gray-900 text-xs">
                  Categorías
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 font-medium text-xs">{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-gray-500 max-w-xl">{category.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
      </div>

      <div className="container py-7">
        <ProductGrid products={products as any} />
      </div>
    </div>
  );
}
