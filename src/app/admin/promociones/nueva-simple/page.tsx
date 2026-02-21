'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NuevaPromocionSimplePage() {
  const [name, setName] = useState('');

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Nueva Promoción (Versión Simple)</h1>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la promoción</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Black Friday 2026"
          />
        </div>

        <Button onClick={() => alert(`Nombre: ${name}`)}>
          Probar
        </Button>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-medium text-green-900">✅ Si ves este formulario simple:</p>
          <ul className="list-disc ml-6 mt-2 text-sm text-green-800">
            <li>Los componentes básicos funcionan</li>
            <li>'use client' funciona</li>
            <li>Los hooks funcionan</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            El problema está en el PromotionForm completo o sus dependencias
          </p>
        </div>
      </div>
    </div>
  );
}
