'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { toggleProductFeatured } from '@/lib/actions/products';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductsTableProps {
  products: Product[];
  showLowStockFilter?: boolean;
}

export function ProductsTable({ products: initialProducts, showLowStockFilter }: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? products.filter((p) => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      })
    : products;

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteId));
        toast.success('Producto eliminado exitosamente');
        router.refresh();
      } else {
        toast.error('Error al eliminar producto');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Buscar por descripción o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {search && (
        <p className="text-xs text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} para &quot;{search}&quot;
        </p>
      )}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                  No se encontraron productos para &quot;{search}&quot;
                </TableCell>
              </TableRow>
            )}
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                    <Image
                      src={product.images[0]?.url || '/placeholder-product.svg'}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.shortDescription?.substring(0, 50)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {product.sku}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatPrice(product.price)}</div>
                  {product.compareAtPrice && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.stock === 0
                        ? 'bg-red-100 text-red-700 hover:bg-red-100'
                        : product.stock < 10
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        : 'bg-green-100 text-green-700 hover:bg-green-100'
                    }
                  >
                    {product.stock} unid.
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    {product.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 cursor-default">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 cursor-default">
                        Inactivo
                      </Badge>
                    )}
                    <button
                      onClick={async () => {
                        const newStatus = !product.isFeatured;
                        // Optimistic update could go here, but for simplicity we wait
                        try {
                          const res = await toggleProductFeatured(product.id, newStatus);
                          if (res.success) {
                            toast.success(newStatus ? 'Marcado como destacado' : 'Desmarcado de destacados');
                            router.refresh();
                          } else {
                            toast.error('Error al actualizar');
                          }
                        } catch (e) {
                          toast.error('Error de conexión');
                        }
                      }}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${product.isFeatured
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      title="Clic para cambiar estado destacado"
                    >
                      {product.isFeatured ? '★ Destacado' : '☆ No destacado'}
                    </button>
                    {product.isNew && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/productos/${product.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ver producto en la tienda"
                        className="hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/productos/${product.id}/editar`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar producto"
                        className="hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(product.id)}
                      title="Eliminar producto"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
