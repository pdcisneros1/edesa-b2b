'use client';

import { useState, useEffect } from 'react';
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
import { Edit, Trash2, Eye, Search, X, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCsrfFetch } from '@/hooks/useCsrfFetch';
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

interface SelectedProduct {
  productId: string;
  quantity: number;
}

export function ProductsTable({ products: initialProducts, showLowStockFilter }: ProductsTableProps) {
  const router = useRouter();
  const { csrfFetch } = useCsrfFetch();
  const [products, setProducts] = useState(initialProducts);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Sincronizar estado local cuando cambien los productos del servidor
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Map(selectedProducts);
    if (checked) {
      newSelected.set(productId, 30); // Cantidad por defecto: 30
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const newSelected = new Map(selectedProducts);
    newSelected.set(productId, quantity);
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Map<string, number>();
      filtered.forEach(product => {
        newSelected.set(product.id, 30);
      });
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts(new Map());
    }
  };

  const handleCreateConsolidatedOrder = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    const items = Array.from(selectedProducts.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const confirmed = confirm(
      `¿Crear orden de compra con ${items.length} productos seleccionados?\n\n` +
      `Se generará UNA orden consolidada con todos los productos.`
    );

    if (!confirmed) return;

    setIsCreatingOrder(true);
    try {
      const res = await csrfFetch('/api/admin/bulk-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear orden');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al crear orden');
      }

      toast.success(`✅ Orden ${data.invoiceNumber} creada exitosamente`, {
        description: `${items.length} productos - Total: $${data.totalAmount.toFixed(2)}`,
      });

      // Limpiar selección
      setSelectedProducts(new Map());

      // Redirigir a compras
      setTimeout(() => {
        router.push('/admin/purchases');
      }, 1500);
    } catch (error) {
      console.error('❌ Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('❌ Error al crear orden de compra', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const allSelected = filtered.length > 0 && filtered.every(p => selectedProducts.has(p.id));
  const someSelected = selectedProducts.size > 0;

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
              {showLowStockFilter && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              <TableHead className="w-20">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              {showLowStockFilter && (
                <TableHead className="w-32">Cantidad</TableHead>
              )}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={showLowStockFilter ? 9 : 7} className="py-12 text-center text-sm text-gray-500">
                  No se encontraron productos para &quot;{search}&quot;
                </TableCell>
              </TableRow>
            )}
            {filtered.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              const quantity = selectedProducts.get(product.id) || 30;

              return (
                <TableRow key={product.id} className={isSelected ? 'bg-blue-50' : ''}>
                  {showLowStockFilter && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        aria-label={`Seleccionar ${product.name}`}
                      />
                    </TableCell>
                  )}
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
                  {showLowStockFilter && (
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={isSelected ? quantity : 30}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value);
                          if (qty >= 1) {
                            if (!isSelected) {
                              handleSelectProduct(product.id, true);
                            }
                            handleQuantityChange(product.id, qty);
                          }
                        }}
                        onFocus={() => {
                          if (!isSelected) {
                            handleSelectProduct(product.id, true);
                          }
                        }}
                        className="w-20"
                        disabled={!isSelected && selectedProducts.size > 0}
                      />
                    </TableCell>
                  )}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Floating action button */}
      {showLowStockFilter && someSelected && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4">
          <Button
            onClick={handleCreateConsolidatedOrder}
            disabled={isCreatingOrder}
            size="lg"
            className="gap-3 bg-green-600 hover:bg-green-700 shadow-2xl h-16 px-8 rounded-full"
          >
            {isCreatingOrder ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creando orden...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Crear Orden de Compra</span>
                  <span className="text-xs opacity-90">{selectedProducts.size} productos seleccionados</span>
                </div>
              </>
            )}
          </Button>
        </div>
      )}

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
