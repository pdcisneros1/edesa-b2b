import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMainCategories, getSubcategories } from '@/data/mock-categories';
import { getProductsByCategory } from '@/data/mock-products';

export const metadata = {
  title: 'Categorías',
  description: 'Explora todas nuestras categorías de productos para construcción',
};

export default function CategoriesPage() {
  const mainCategories = getMainCategories();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Todas las Categorías
        </h1>
        <p className="text-muted-foreground">
          Encuentra productos por categoría
        </p>
      </div>

      <div className="space-y-12">
        {mainCategories.map((category) => {
          const subcategories = getSubcategories(category.id);
          const productCount = getProductsByCategory(category.id).length;

          return (
            <div key={category.id}>
              {/* Main category */}
              <Link href={`/categorias/${category.slug}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary mb-6">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      <div className="relative aspect-square md:aspect-auto overflow-hidden bg-muted">
                        <Image
                          src={category.image || '/images/categories/placeholder.jpg'}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-center">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                              {category.name}
                            </h2>
                            {category.description && (
                              <p className="text-muted-foreground">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">{productCount} productos</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-medium">
                          Ver todos los productos
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ml-4 md:ml-8">
                  {subcategories.map((subcategory) => {
                    const subProductCount = getProductsByCategory(subcategory.id).length;

                    return (
                      <Link key={subcategory.id} href={`/categorias/${subcategory.slug}`}>
                        <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary">
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden bg-muted">
                              <Image
                                src={subcategory.image || '/images/categories/placeholder.jpg'}
                                alt={subcategory.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="font-semibold text-white text-sm mb-1 group-hover:underline">
                                  {subcategory.name}
                                </h3>
                                <p className="text-xs text-white/80">
                                  {subProductCount} productos
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
