'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

// Schema simplificado
const simpleSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  discountValue: z.number().min(0),
});

type SimpleFormData = z.infer<typeof simpleSchema>;

export default function NuevaPromocionSinSelectorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimpleFormData>({
    resolver: zodResolver(simpleSchema),
    defaultValues: {
      name: '',
      discountValue: 0,
    },
  });

  const onSubmit = async (data: SimpleFormData) => {
    console.log('Form submitted:', data);
    alert(`Nombre: ${data.name}, Descuento: ${data.discountValue}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
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
            <h1 className="text-3xl font-bold">Nueva Promoción (Sin Selector)</h1>
            <p className="text-muted-foreground">Test sin PromotionProductSelector</p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>

      {/* Card de prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>
            Si ves este formulario y NO te expulsa, el problema está en PromotionProductSelector
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la promoción *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Black Friday 2026"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">Valor del descuento</Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              {...register('discountValue', { valueAsNumber: true })}
            />
            {errors.discountValue && (
              <p className="text-sm text-red-600">{errors.discountValue.message}</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-medium text-blue-900">🔍 Diagnóstico:</p>
            <ul className="list-disc ml-6 mt-2 text-sm text-blue-800">
              <li>✅ useForm funciona</li>
              <li>✅ zodResolver funciona</li>
              <li>✅ useState funciona</li>
              <li>✅ useRouter funciona</li>
              <li>✅ Card components funcionan</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-blue-900">
              Si esta página NO te expulsa → el problema está en PromotionProductSelector
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
