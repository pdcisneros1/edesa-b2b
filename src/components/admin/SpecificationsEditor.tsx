'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface SpecificationsEditorProps {
  specifications: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
}

export function SpecificationsEditor({
  specifications,
  onChange,
}: SpecificationsEditorProps) {
  const [entries, setEntries] = useState<Array<{ key: string; value: string }>>(
    Object.entries(specifications).map(([key, value]) => ({ key, value }))
  );

  const addEntry = () => {
    const newEntries = [...entries, { key: '', value: '' }];
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateSpecs(newEntries);
  };

  const updateEntry = (index: number, field: 'key' | 'value', value: string) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
    updateSpecs(newEntries);
  };

  const updateSpecs = (newEntries: Array<{ key: string; value: string }>) => {
    const specs: Record<string, string> = {};
    newEntries.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        specs[key.trim()] = value.trim();
      }
    });
    onChange(specs);
  };

  return (
    <div className="space-y-3">
      {entries.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay especificaciones. Agrega una para comenzar.
        </p>
      )}

      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Característica (ej: Material)"
            value={entry.key}
            onChange={(e) => updateEntry(index, 'key', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Valor (ej: Cerámica)"
            value={entry.value}
            onChange={(e) => updateEntry(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeEntry(index)}
            className="shrink-0 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Agregar Especificación
      </Button>
    </div>
  );
}
