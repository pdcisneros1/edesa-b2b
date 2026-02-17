import { getBrands } from '@/lib/data-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import Image from 'next/image';

export default function AdminMarcasPage() {
  const brands = getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marcas</h1>
        <p className="mt-1 text-gray-500">
          Gestiona las marcas de productos ({brands.length} total)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {brands.map((brand) => (
          <Card key={brand.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{brand.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {brand.description || 'Sin descripción'}
              </p>
              {brand.logo && (
                <div className="mt-4 relative h-20 w-32 bg-gray-100 rounded-md">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
