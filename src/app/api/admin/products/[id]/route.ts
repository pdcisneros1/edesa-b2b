import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET single product
export async function GET(request: NextRequest, context: RouteContext) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
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
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest, context: RouteContext) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const data = await request.json();
    const { images, specifications, category, brand, id: _id, createdAt, updatedAt, ...rest } = data;

    const product = await prisma.$transaction(async (tx) => {
      // Update base product fields
      const updated = await tx.product.update({
        where: { id },
        data: {
          sku: rest.sku,
          name: rest.name,
          slug: rest.slug,
          description: rest.description,
          shortDescription: rest.shortDescription || null,
          price: Number(rest.price) || 0,
          compareAtPrice: rest.compareAtPrice ? Number(rest.compareAtPrice) : null,
          costPrice: rest.costPrice ? Number(rest.costPrice) : null,
          stock: Math.round(Number(rest.stock)) || 0,
          categoryId: rest.categoryId,
          brandId: rest.brandId || null,
          technicalSheet: rest.technicalSheet || null,
          isActive: rest.isActive ?? true,
          isFeatured: rest.isFeatured ?? false,
          isNew: rest.isNew ?? false,
        },
      });

      // Replace images if provided
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any, index: number) => ({
              productId: id,
              url: img.url,
              alt: img.alt || rest.name,
              order: index,
            })),
          });
        }
      }

      // Replace specifications if provided
      if (specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications.map((spec: any, index: number) => ({
              productId: id,
              key: spec.key,
              value: spec.value,
              order: index,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: true, specifications: true, category: true, brand: true },
      });
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
