'use client';

import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/admin/ExportButton';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  wholesalePrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}

interface ProductosHeaderProps {
  products: Product[];
}

export function ProductosHeader({ products }: ProductosHeaderProps) {
  const router = useRouter();

  // Preparar datos para exportación
  const exportData = products.map((product) => ({
    sku: product.sku,
    nombre: product.name,
    categoria: product.category?.name || '-',
    marca: product.brand?.name || '-',
    precioRegular: product.price,
    precioMayorista: product.wholesalePrice || '-',
    stock: product.stock,
    activo: product.isActive ? 'Sí' : 'No',
    destacado: product.isFeatured ? 'Sí' : 'No',
    fechaCreacion: new Date(product.createdAt).toLocaleDateString('es-EC'),
  }));

  const exportColumns = [
    { header: 'SKU', dataKey: 'sku' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Marca', dataKey: 'marca' },
    { header: 'Precio Regular', dataKey: 'precioRegular' },
    { header: 'Precio Mayorista', dataKey: 'precioMayorista' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Activo', dataKey: 'activo' },
    { header: 'Destacado', dataKey: 'destacado' },
    { header: 'Fecha Creación', dataKey: 'fechaCreacion' },
  ];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="text-muted-foreground">
          Gestiona el catálogo de productos
        </p>
      </div>
      <div className="flex gap-2">
        {products.length > 0 && (
          <ExportButton
            data={exportData}
            filename="productos"
            columns={exportColumns}
            title="Reporte de Productos"
          />
        )}
        <Button onClick={() => router.push('/admin/productos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
    </div>
  );
}
