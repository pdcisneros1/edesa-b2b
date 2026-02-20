import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET single product
export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const { id } = await context.params;

  // Validar formato de ID
  if (!id || typeof id !== 'string' || id.length > 100) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

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
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const { id } = await context.params;

  // Validar formato de ID
  if (!id || typeof id !== 'string' || id.length > 100) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { images, specifications, category, brand, id: _id, createdAt, updatedAt, ...rest } = data;

    // Validar precio si se proporciona
    if (rest.price !== undefined) {
      const price = Number(rest.price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: 'El precio debe ser un número válido mayor o igual a 0' }, { status: 400 });
      }
    }

    // Sanitizar slug si se proporciona
    let sanitizedSlug = rest.slug;
    if (sanitizedSlug) {
      sanitizedSlug = String(sanitizedSlug)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 200);
    }

    const product = await prisma.$transaction(async (tx) => {
      // Actualizar campos base del producto
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(rest.sku !== undefined && { sku: String(rest.sku).trim().substring(0, 50) }),
          ...(rest.name !== undefined && { name: String(rest.name).trim().substring(0, 200) }),
          ...(sanitizedSlug !== undefined && { slug: sanitizedSlug }),
          ...(rest.description !== undefined && { description: rest.description ? String(rest.description).trim().substring(0, 5000) : undefined }),
          ...(rest.shortDescription !== undefined && { shortDescription: rest.shortDescription ? String(rest.shortDescription).trim().substring(0, 500) : null }),
          ...(rest.price !== undefined && { price: Math.max(0, Number(rest.price) || 0) }),
          ...(rest.wholesalePrice !== undefined && { wholesalePrice: rest.wholesalePrice != null && rest.wholesalePrice !== '' ? Math.max(0, Number(rest.wholesalePrice)) : null }),
          ...(rest.compareAtPrice !== undefined && { compareAtPrice: rest.compareAtPrice != null && rest.compareAtPrice !== '' ? Math.max(0, Number(rest.compareAtPrice)) : null }),
          ...(rest.costPrice !== undefined && { costPrice: rest.costPrice != null && rest.costPrice !== '' ? Math.max(0, Number(rest.costPrice)) : null }),
          ...(rest.stock !== undefined && { stock: Math.max(0, Math.round(Number(rest.stock)) || 0) }),
          ...(rest.categoryId !== undefined && { categoryId: rest.categoryId }),
          ...(rest.brandId !== undefined && { brandId: rest.brandId || null }),
          ...(rest.technicalSheet !== undefined && { technicalSheet: rest.technicalSheet || null }),
          ...(rest.isActive !== undefined && { isActive: Boolean(rest.isActive) }),
          ...(rest.isFeatured !== undefined && { isFeatured: Boolean(rest.isFeatured) }),
          ...(rest.isNew !== undefined && { isNew: Boolean(rest.isNew) }),
        },
      });

      // Reemplazar imágenes si se proporcionan
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: { url: string; alt?: string }, index: number) => ({
              productId: id,
              url: String(img.url).substring(0, 500),
              alt: img.alt ? String(img.alt).substring(0, 200) : (updated.name || '').substring(0, 200),
              order: index,
            })),
          });
        }
      }

      // Reemplazar especificaciones si se proporcionan
      if (specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications.map((spec: { key: string; value: string }, index: number) => ({
              productId: id,
              key: String(spec.key).trim().substring(0, 100),
              value: String(spec.value).trim().substring(0, 500),
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
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const { id } = await context.params;

  // Validar formato de ID
  if (!id || typeof id !== 'string' || id.length > 100) {
    return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
