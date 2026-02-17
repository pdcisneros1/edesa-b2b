import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { mockBrands } from '@/data/mock-brands';

export function BrandShowcase() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Marcas de Confianza
          </h2>
          <p className="text-muted-foreground mt-2">
            Trabajamos con las mejores marcas del mercado
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          {mockBrands.map((brand) => (
            <Card
              key={brand.id}
              className="group transition-all hover:shadow-md hover:border-primary"
            >
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <div className="relative h-16 w-full grayscale transition-all group-hover:grayscale-0">
                  <div className="flex items-center justify-center h-full">
                    <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
