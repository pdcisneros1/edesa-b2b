import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Download, FileText, Facebook, Twitter, Linkedin, Package, Tag, Layers } from 'lucide-react';
import prisma from '@/lib/prisma';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { PriceGate } from '@/components/products/PriceGate';
import { Button } from '@/components/ui/button';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-500 hover:text-gray-900 text-xs">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/productos" className="text-gray-500 hover:text-gray-900 text-xs">
                  Productos
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/categorias/${category.slug}`}
                      className="text-gray-500 hover:text-gray-900 text-xs"
                    >
                      {category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 font-medium text-xs truncate max-w-[200px]">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container py-8">
        {/* Product details */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 mb-10">
          {/* Left: Images */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
              <Image
                src={product.images[0]?.url || '/images/products/placeholder.jpg'}
                alt={product.images[0]?.alt || product.name}
                fill
                className="object-contain p-8"
                priority
              />
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <span className="inline-flex items-center rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                    Nuevo
                  </span>
                )}
                {product.isFeatured && (
                  <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white">
                    Destacado
                  </span>
                )}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image) => (
                  <button
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-white hover:border-primary/50 transition-colors"
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

          {/* Right: Product info */}
          <div className="space-y-5">
            {/* Brand + SKU */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {brand && (
                <Link
                  href={`/marcas/${brand.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider hover:underline"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {brand.name}
                </Link>
              )}
              <span className="text-xs text-gray-400 font-mono bg-gray-100 rounded px-2 py-0.5">
                {product.sku}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl leading-tight">
              {product.name}
            </h1>

            {category && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Layers className="h-3.5 w-3.5" />
                <Link
                  href={`/categorias/${category.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              </div>
            )}

            <Separator className="bg-gray-100" />

            {/* Price block */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <PriceGate
                price={product.price}
                wholesalePrice={(product as any).wholesalePrice}
                compareAtPrice={product.compareAtPrice}
                redirectAfterLogin={`/productos/${product.slug}`}
              />

              <div className="flex items-center gap-2 pt-1">
                {product.stock > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">En Stock</span>
                    <span className="text-xs text-gray-400">({product.stock} disponibles)</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-sm font-semibold text-red-600">Agotado</span>
                  </>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Technical docs */}
            {product.technicalSheet && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2.5">
                  Documentación Técnica
                </h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={product.technicalSheet}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    Ficha técnica
                  </a>
                  <a
                    href={product.technicalSheet}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Manual instalación
                  </a>
                </div>
              </div>
            )}

            <div>
              <AddToCartButton
                product={product as any}
                redirectAfterLogin={`/productos/${product.slug}`}
              />
            </div>

            {/* Social sharing */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-400 font-medium">Compartir:</span>
              <div className="flex gap-1.5">
                {[
                  {
                    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
                    Icon: Facebook,
                    label: 'Facebook',
                  },
                  {
                    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`,
                    Icon: Twitter,
                    label: 'Twitter',
                  },
                  {
                    href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
                    Icon: Linkedin,
                    label: 'LinkedIn',
                  },
                ].map(({ href, Icon, label }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30"
                    asChild
                  >
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Compartir en ${label}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-10">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-gray-100 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3.5 text-sm font-medium text-gray-500"
              >
                Descripción
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3.5 text-sm font-medium text-gray-500"
              >
                Especificaciones
                {product.specifications.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                    {product.specifications.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6 md:p-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {product.description}
              </p>
            </TabsContent>

            <TabsContent value="specifications" className="p-0">
              {product.specifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr
                          key={spec.id}
                          className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                        >
                          <td className="py-3 px-6 font-medium text-gray-700 w-2/5 border-b border-gray-100 text-sm">
                            {spec.key}
                          </td>
                          <td className="py-3 px-6 text-gray-600 border-b border-gray-100 text-sm">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay especificaciones disponibles.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                También te puede interesar
              </p>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                Productos Relacionados
              </h2>
            </div>
            <ProductGrid products={relatedProducts as any} />
          </div>
        )}
      </div>
    </div>
  );
}
