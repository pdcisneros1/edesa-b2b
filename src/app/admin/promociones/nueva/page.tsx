'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Percent, DollarSign, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
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

export default function NuevaPromocionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [daysFromActivation, setDaysFromActivation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Product selector state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products (manual - solo cuando se hace click)
  const loadProducts = async () => {
    if (productsLoaded) return; // Ya cargados

    setIsLoadingProducts(true);

    try {
      console.log('Iniciando carga de productos...');

      const res = await fetch('/api/admin/products', {
        credentials: 'include',
      });

      console.log('Respuesta del servidor:', res.status);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Productos recibidos:', data?.length || 0);

      // Validar que data es un array
      if (!Array.isArray(data)) {
        throw new Error('La respuesta no es un array de productos');
      }

      // Validar estructura de cada producto
      const validProducts = data.filter((p: any) => {
        return p && typeof p === 'object' && p.id && p.name && p.sku;
      });

      console.log('Productos válidos:', validProducts.length);

      if (validProducts.length === 0) {
        toast.error('No hay productos disponibles');
      } else {
        setProducts(validProducts);
        setProductsLoaded(true);
        toast.success(`${validProducts.length} productos cargados`);
      }

    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error(`Error: ${error.message || 'No se pudieron cargar los productos'}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  });

  const handleToggleProduct = (productId: string) => {
    // Asegurar que productId es string
    const id = String(productId);

    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((existingId) => existingId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleSelectAll = () => {
    const activeProductIds = filteredProducts
      .filter((p) => p.isActive)
      .map((p) => String(p.id)); // Asegurar que son strings
    setSelectedProducts(activeProductIds);
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!name || name.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast.error('El valor del descuento debe ser mayor a 0');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Debes seleccionar al menos un producto');
      return;
    }

    if (!validFrom && !validUntil && !daysFromActivation) {
      toast.error('Debes especificar al menos una condición de validez');
      return;
    }

    // Validar que todos los productIds sean strings válidos
    const validProductIds = selectedProducts
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0);

    if (validProductIds.length === 0) {
      toast.error('Los IDs de productos no son válidos');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        discountType,
        discountValue: parseFloat(discountValue),
        validFrom: validFrom && validFrom.trim() !== '' ? new Date(validFrom).toISOString() : null,
        validUntil: validUntil && validUntil.trim() !== '' ? new Date(validUntil).toISOString() : null,
        daysFromActivation: daysFromActivation && daysFromActivation.trim() !== '' ? parseInt(daysFromActivation, 10) : null,
        productIds: validProductIds, // Array de strings validados
        isActive,
      };

      console.log('Enviando promoción:', payload); // Debug

      const res = await fetch('/api/admin/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Promoción creada exitosamente');
        console.log('Promoción creada:', result); // Debug

        // Limpiar formulario
        setName('');
        setDescription('');
        setDiscountType('percentage');
        setDiscountValue('');
        setValidFrom('');
        setValidUntil('');
        setDaysFromActivation('');
        setSelectedProducts([]);
        setIsActive(true);
        setSearchQuery(''); // Limpiar búsqueda también
      } else {
        console.error('Error del servidor:', result); // Debug
        toast.error(result.error || 'Error al crear la promoción');

        // Mostrar detalles del error si existen
        if (result.details) {
          console.error('Detalles del error:', result.details);
          toast.error(`Detalles: ${result.details}`);
        }

        // Mostrar errores de validación específicos
        if (result.errors) {
          console.error('Errores de validación:', result.errors);
          Object.entries(result.errors).forEach(([field, error]) => {
            toast.error(`${field}: ${error}`);
          });
        }
      }
    } catch (error: any) {
      console.error('Error de red o parsing:', error);
      toast.error(`Error: ${error.message || 'Error al crear la promoción'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Promoción</h1>
            <p className="text-muted-foreground">Crea una nueva promoción para productos</p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Guardando...' : 'Guardar Promoción'}
        </Button>
      </div>

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Detalles generales de la promoción</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la promoción *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Black Friday 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la promoción..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promoción activa</Label>
              <p className="text-sm text-muted-foreground">
                Activar o desactivar esta promoción
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Descuento */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Descuento</CardTitle>
          <CardDescription>Define el tipo y valor del descuento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de descuento *</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="percentage" id="percentage" className="peer sr-only" />
                <Label
                  htmlFor="percentage"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Percent className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Porcentaje</p>
                    <p className="text-xs text-muted-foreground">Descuento en porcentaje</p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="fixed" id="fixed" className="peer sr-only" />
                <Label
                  htmlFor="fixed"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <DollarSign className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Monto Fijo</p>
                    <p className="text-xs text-muted-foreground">Descuento en dólares</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Valor del descuento * {discountType === 'percentage' ? '(0-100%)' : '(USD)'}
            </Label>
            <div className="relative">
              <Input
                id="discountValue"
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="pr-12"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {discountType === 'percentage' ? '%' : '$'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validez */}
      <Card>
        <CardHeader>
          <CardTitle>Validez de la Promoción</CardTitle>
          <CardDescription>
            Define cuándo y por cuánto tiempo será válida la promoción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Fecha de inicio (opcional)</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Fecha de fin (opcional)</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysFromActivation">Días desde activación (opcional)</Label>
            <Input
              id="daysFromActivation"
              type="number"
              step="1"
              value={daysFromActivation}
              onChange={(e) => setDaysFromActivation(e.target.value)}
              placeholder="Ej: 30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos en Promoción *</CardTitle>
          <CardDescription>
            Selecciona los productos que tendrán esta promoción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botón para cargar productos */}
          {!productsLoaded && !isLoadingProducts && (
            <div className="text-center py-8">
              <Button
                type="button"
                onClick={loadProducts}
                variant="outline"
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Cargar Lista de Productos
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Click para ver todos los productos disponibles
              </p>
            </div>
          )}

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
                {products
                  .filter((p) => selectedProducts.includes(p.id))
                  .map((product) => (
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

          {/* Buscador - solo si hay productos cargados */}
          {productsLoaded && (
            <>
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
            </>
          )}

          {/* Lista de productos */}
          {isLoadingProducts ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-50" />
              <p>Cargando productos...</p>
            </div>
          ) : productsLoaded ? (
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
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
                          onCheckedChange={() => handleToggleProduct(product.id)}
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
          ) : null}

          {selectedProducts.length === 0 && !isLoadingProducts && productsLoaded && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Package className="h-4 w-4 flex-shrink-0" />
              <p>Debes seleccionar al menos un producto para la promoción</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Guardando...' : 'Guardar Promoción'}
        </Button>
      </div>
    </form>
  );
}
