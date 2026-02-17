'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/shared/Price';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { calculateDiscount } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const mainImage = product.images[0]?.url || '/images/products/placeholder.jpg';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount && product.compareAtPrice ? calculateDiscount(product.price, product.compareAtPrice) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success('Producto agregado al carrito', {
      description: product.name,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Badges */}
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Nuevo
              </Badge>
            )}
            {hasDiscount && discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>

          {/* Stock badge */}
          {product.stock <= 0 && (
            <div className="absolute right-2 top-2 z-10">
              <Badge variant="outline" className="bg-background/80 backdrop-blur">
                Agotado
              </Badge>
            </div>
          )}

          {/* Product image */}
          <Image
            src={mainImage}
            alt={product.images[0]?.alt || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver Detalles
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <div className="space-y-2">
            {/* SKU */}
            <p className="text-xs text-muted-foreground">{product.sku}</p>

            {/* Product name */}
            <h3 className="font-semibold line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Short description */}
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
              {product.shortDescription}
            </p>

            {/* Price */}
            <div className="pt-2">
              <Price
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                showDiscount={false}
              />
            </div>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? 'Agotado' : 'Agregar al Carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
}
