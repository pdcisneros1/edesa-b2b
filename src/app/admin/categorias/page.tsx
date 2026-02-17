import { getCategories } from '@/lib/data-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree } from 'lucide-react';

export default function AdminCategoriasPage() {
  const categories = getCategories();
  const mainCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="mt-1 text-gray-500">
          Gestiona las categorías de productos ({categories.length} total)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mainCategories.map((category) => {
          const subs = subCategories.filter(s => s.parentId === category.id);

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description || 'Sin descripción'}
                </p>
                {subs.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Subcategorías:</p>
                    <div className="flex flex-wrap gap-1">
                      {subs.map(sub => (
                        <Badge key={sub.id} variant="outline" className="text-xs">
                          {sub.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
