'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

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

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          discountType,
          discountValue: parseFloat(discountValue),
          validFrom: validFrom ? new Date(validFrom).toISOString() : null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          daysFromActivation: daysFromActivation ? parseInt(daysFromActivation) : null,
          productIds: selectedProducts,
          isActive,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Promoción creada exitosamente');
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
      } else {
        toast.error(result.error || 'Error al crear la promoción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la promoción');
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

      {/* Productos (Simplificado - por ahora solo IDs manuales) */}
      <Card>
        <CardHeader>
          <CardTitle>Productos *</CardTitle>
          <CardDescription>
            Por ahora: ingresa IDs de productos separados por comas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Ej: cm8abc123,cm8def456,cm8ghi789"
            value={selectedProducts.join(',')}
            onChange={(e) => setSelectedProducts(e.target.value.split(',').filter(id => id.trim()))}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {selectedProducts.length} producto(s) seleccionado(s)
          </p>
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
