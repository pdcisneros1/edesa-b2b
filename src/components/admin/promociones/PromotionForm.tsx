'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { promotionSchema, type PromotionFormData } from '@/lib/validators';
import { PromotionProductSelector } from './PromotionProductSelector';
import { ArrowLeft, Save, Percent, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Promotion } from '@/types/promotion';

interface PromotionFormProps {
  promotion?: Promotion & { products: { id: string; productId: string }[] };
  mode: 'create' | 'edit';
}

export function PromotionForm({ promotion, mode }: PromotionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: promotion
      ? {
          name: promotion.name,
          description: promotion.description || '',
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          validFrom: promotion.validFrom ? new Date(promotion.validFrom).toISOString().slice(0, 16) : '',
          validUntil: promotion.validUntil ? new Date(promotion.validUntil).toISOString().slice(0, 16) : '',
          daysFromActivation: promotion.daysFromActivation || undefined,
          productIds: promotion.products.map((p) => p.productId),
          isActive: promotion.isActive,
        }
      : {
          name: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          validFrom: '',
          validUntil: '',
          daysFromActivation: undefined,
          productIds: [],
          isActive: true,
        },
  });

  const discountType = watch('discountType');
  const productIds = watch('productIds');
  const isActive = watch('isActive');

  const onSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);

    try {
      const url =
        mode === 'create'
          ? '/api/admin/promociones'
          : `/api/admin/promociones/${promotion?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : null,
          validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
          daysFromActivation: data.daysFromActivation || null,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(
          mode === 'create' ? 'Promoción creada exitosamente' : 'Promoción actualizada exitosamente'
        );
        router.push('/admin/promociones');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al guardar la promoción');
        if (result.details) {
          toast.error(result.details);
        }
      }
    } catch (error) {
      console.error('Error submitting promotion:', error);
      toast.error('Error al guardar la promoción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <h1 className="text-3xl font-bold">
              {mode === 'create' ? 'Nueva Promoción' : 'Editar Promoción'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create'
                ? 'Crea una nueva promoción para productos'
                : 'Modifica los detalles de la promoción'}
            </p>
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
          <CardDescription>
            Detalles generales de la promoción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la promoción *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Black Friday 2026, Descuento de Verano"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe la promoción..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
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
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Descuento */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Descuento</CardTitle>
          <CardDescription>
            Define el tipo y valor del descuento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de descuento *</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value: 'percentage' | 'fixed') =>
                setValue('discountType', value)
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="percentage"
                  id="percentage"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="percentage"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Percent className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Porcentaje</p>
                    <p className="text-xs text-muted-foreground">
                      Descuento en porcentaje
                    </p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="fixed"
                  id="fixed"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="fixed"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <DollarSign className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Monto Fijo</p>
                    <p className="text-xs text-muted-foreground">
                      Descuento en dólares
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Valor del descuento *{' '}
              {discountType === 'percentage' ? '(0-100%)' : '(USD)'}
            </Label>
            <div className="relative">
              <Input
                id="discountValue"
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                {...register('discountValue', { valueAsNumber: true })}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {discountType === 'percentage' ? '%' : '$'}
              </div>
            </div>
            {errors.discountValue && (
              <p className="text-sm text-red-600">{errors.discountValue.message}</p>
            )}
            {discountType === 'percentage' && (
              <p className="text-xs text-muted-foreground">
                Ingresa un valor entre 0 y 100
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validez de la Promoción */}
      <Card>
        <CardHeader>
          <CardTitle>Validez de la Promoción</CardTitle>
          <CardDescription>
            Define cuándo y por cuánto tiempo será válida la promoción.
            Puedes usar fechas, días desde activación, o ambos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Fecha de inicio (opcional)</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                {...register('validFrom')}
              />
              <p className="text-xs text-muted-foreground">
                Si no se especifica, inicia inmediatamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Fecha de fin (opcional)</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                {...register('validUntil')}
              />
              <p className="text-xs text-muted-foreground">
                Si no se especifica, no expira por fecha
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="daysFromActivation">
                Días desde activación (opcional)
              </Label>
              <Input
                id="daysFromActivation"
                type="number"
                step="1"
                {...register('daysFromActivation', { valueAsNumber: true })}
                placeholder="Ej: 30"
              />
              <p className="text-xs text-muted-foreground">
                Número de días que la promoción estará activa desde que se aplica
                a cada producto
              </p>
            </div>
          </div>

          {errors.validFrom && (
            <p className="text-sm text-red-600">{errors.validFrom.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Selector de Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos en Promoción *</CardTitle>
          <CardDescription>
            Selecciona los productos que tendrán esta promoción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromotionProductSelector
            selectedProductIds={productIds || []}
            onChange={(ids) => setValue('productIds', ids)}
          />
          {errors.productIds && (
            <p className="text-sm text-red-600 mt-2">{errors.productIds.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
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
