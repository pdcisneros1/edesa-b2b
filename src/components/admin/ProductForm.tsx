'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Product, Category, Brand, ProductImage, ProductSpecification } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from './ImageUpload';
import { SpecificationsEditor } from './SpecificationsEditor';
import { TechnicalSheetUpload } from './TechnicalSheetUpload';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}

type FormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'specifications' | 'images'> & {
  images?: ProductImage[];
  specifications?: ProductSpecification[];
};

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<Array<{ id?: string; url: string; alt: string }>>(
    product?.images?.map(img => ({ id: img.id, url: img.url, alt: img.alt })) || []
  );
  const [specifications, setSpecifications] = useState<Record<string, string>>(() => {
    if (!product?.specifications) return {};

    // Convert array to object if needed
    if (Array.isArray(product.specifications)) {
      return product.specifications.reduce((acc, spec) => {
        acc[spec.key] = spec.value;
        return acc;
      }, {} as Record<string, string>);
    }

    return product.specifications as Record<string, string>;
  });
  const [technicalSheet, setTechnicalSheet] = useState<string | undefined>(
    product?.technicalSheet ?? undefined
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: product || {
      sku: '',
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: 0,
      compareAtPrice: undefined,
      stock: 0,
      categoryId: '',
      brandId: '',
      images: [],
      specifications: [],
      isActive: true,
      isFeatured: false,
      isNew: false,
    },
  });

  const watchName = watch('name');

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Convert simple images to ProductImage format
      const productImages: ProductImage[] = images.map((img, index) => ({
        id: img.id || `img_${Date.now()}_${index}`,
        productId: product?.id || '',
        url: img.url,
        alt: img.alt,
        order: index,
      }));

      // Convert specifications object to array
      const specsArray: ProductSpecification[] = Object.entries(specifications).map(
        ([key, value], index) => ({
          id: `spec_${Date.now()}_${index}`,
          productId: product?.id || '',
          key,
          value,
          order: index,
        })
      );

      const productData: Partial<Product> = {
        ...data,
        slug: data.slug || generateSlug(data.name),
        images: productImages,
        specifications: specsArray,
        technicalSheet,
      };

      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';

      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        toast.success(
          product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
        );
        router.push('/admin/productos');
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Error al guardar producto');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Error al guardar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between">
        <Link href="/admin/productos">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2">
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    {...register('sku', { required: 'SKU es requerido' })}
                    placeholder="SKU-001"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', {
                      required: 'Stock es requerido',
                      min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                    })}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Nombre es requerido' })}
                  placeholder="Inodoro de una pieza"
                  onChange={(e) => {
                    register('name').onChange(e);
                    if (!product) {
                      setValue('slug', generateSlug(e.target.value));
                    }
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug', { required: 'Slug es requerido' })}
                  placeholder="inodoro-de-una-pieza"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL: /productos/{watch('slug')}
                </p>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shortDescription">Descripción Corta</Label>
                <Input
                  id="shortDescription"
                  {...register('shortDescription')}
                  placeholder="Una línea descriptiva del producto"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción Completa *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...register('description', {
                    required: 'Descripción es requerida',
                  })}
                  placeholder="Descripción detallada del producto..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Precios y Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="costPrice">Costo de Compra (Fábrica)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    {...register('costPrice')}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Precio al que compras el producto
                  </p>
                </div>

                <div>
                  <Label htmlFor="price">Precio de Venta *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', {
                      required: 'Precio es requerido',
                      min: { value: 0, message: 'Debe ser mayor a 0' },
                    })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="compareAtPrice">Precio de Comparación</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    {...register('compareAtPrice')}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Precio antes del descuento (opcional)
                  </p>
                </div>

                {watch('costPrice') && watch('price') && (
                  <div className="flex flex-col justify-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">
                      Margen de Ganancia
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        ((watch('price') - (watch('costPrice') || 0)) /
                          watch('price')) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-xs text-green-700">
                      Ganancia: ${(
                        watch('price') - (watch('costPrice') || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecificationsEditor
                specifications={specifications}
                onChange={setSpecifications}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Category & Brand */}
          <Card>
            <CardHeader>
              <CardTitle>Organización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Categoría *</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="brandId">Marca (Opcional)</Label>
                <Select
                  value={watch('brandId') || undefined}
                  onValueChange={(value) => setValue('brandId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona marca (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) =>
                    setValue('isActive', checked as boolean)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Producto Activo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) =>
                    setValue('isFeatured', checked as boolean)
                  }
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Producto Destacado
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNew"
                  checked={watch('isNew')}
                  onCheckedChange={(checked) =>
                    setValue('isNew', checked as boolean)
                  }
                />
                <Label htmlFor="isNew" className="cursor-pointer">
                  Producto Nuevo
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} />
            </CardContent>
          </Card>

          {/* Technical Sheet */}
          <Card>
            <CardHeader>
              <CardTitle>Ficha Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <TechnicalSheetUpload
                technicalSheet={technicalSheet}
                onChange={setTechnicalSheet}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
