'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  wholesalePrice: number | null;
  stock: number;
  isActive: boolean;
}

interface PromotionProductSelectorProps {
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
}

export function PromotionProductSelector({
  selectedProductIds,
  onChange,
}: PromotionProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error('Error loading products:', res.status);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  });

  const handleToggle = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onChange(selectedProductIds.filter((id) => id !== productId));
    } else {
      onChange([...selectedProductIds, productId]);
    }
  };

  const handleSelectAll = () => {
    const activeProductIds = filteredProducts
      .filter((p) => p.isActive)
      .map((p) => p.id);
    onChange(activeProductIds);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando productos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Preview de productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-green-900">
              Productos seleccionados ({selectedProducts.length})
            </Label>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-green-700 hover:text-green-900 underline"
            >
              Limpiar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <Badge
                key={product.id}
                variant="secondary"
                className="bg-white border-green-300 text-green-900"
              >
                {product.name} ({product.sku})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          {filteredProducts.length} producto(s) encontrado(s)
        </Label>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-primary hover:underline"
        >
          Seleccionar todos (activos)
        </button>
      </div>

      {/* Lista de productos */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isInactive = !product.isActive;

              return (
                <div
                  key={product.id}
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    isInactive ? 'opacity-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(product.id)}
                    disabled={isInactive}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      {isInactive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>SKU: {product.sku}</span>
                      <span>•</span>
                      <span>Precio: {formatCurrency(product.price)}</span>
                      {product.wholesalePrice && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            Mayorista: {formatCurrency(product.wholesalePrice)}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProductIds.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>Debes seleccionar al menos un producto para la promoción</p>
        </div>
      )}
    </div>
  );
}
