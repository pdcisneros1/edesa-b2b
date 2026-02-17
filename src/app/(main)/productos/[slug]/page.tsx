import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Download, FileText, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Price } from '@/components/shared/Price';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { Button } from '@/components/ui/button';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: product.name,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      specifications: { orderBy: { order: 'asc' } },
      category: true,
      brand: true,
    },
  });

  if (!product) notFound();

  const category = product.category;
  const brand = product.brand;

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: { images: true, category: true, brand: true },
  });

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/productos">Productos</BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categorias/${category.slug}`}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product details - Two column layout */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 mb-12">
        {/* Left column: Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-white">
            <Image
              src={product.images[0]?.url || '/images/products/placeholder.jpg'}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Thumbnail gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((image) => (
                <button
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-white hover:border-primary transition-colors"
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Product info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {product.name}
            </h1>
            {brand && (
              <Link
                href={`/marcas/${brand.slug}`}
                className="text-sm text-primary hover:underline inline-block mb-3"
              >
                Marca: {brand.name}
              </Link>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isNew && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                Nuevo
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-red-600 hover:bg-red-700">
                Destacado
              </Badge>
            )}
            <Badge variant="outline">
              SKU: {product.sku}
            </Badge>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-2">
            <Price
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              className="text-3xl font-bold"
            />
            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-medium">
                En Stock ({product.stock} disponibles)
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">Agotado</p>
            )}
          </div>

          <Separator />

          {/* Short description */}
          {product.shortDescription && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>
          )}

          {/* Technical documentation */}
          {product.technicalSheet && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Documentación técnica:</h3>
              <div className="flex gap-3">
                <a
                  href={product.technicalSheet}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Ficha técnica
                </a>
                <a
                  href={product.technicalSheet}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Manual de instalación
                </a>
              </div>
            </div>
          )}

          <Separator />

          {/* Add to cart */}
          <AddToCartButton product={product as any} />

          {/* Social sharing */}
          <div className="flex items-center gap-3 pt-4">
            <span className="text-sm text-gray-600">Compartir:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Specifications */}
      <Card className="mb-12 overflow-hidden">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
            >
              Descripción
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
            >
              Información adicional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="p-6">
            {product.specifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {product.specifications.map((spec) => (
                      <tr key={spec.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-sm text-gray-900 bg-gray-50">
                          {spec.key}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay especificaciones disponibles.</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Productos Relacionados
          </h2>
          <ProductGrid products={relatedProducts as any} />
        </div>
      )}
    </div>
  );
}
