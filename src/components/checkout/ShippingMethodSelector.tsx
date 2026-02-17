'use client';

import { useState } from 'react';
import { Check, Truck, Zap, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SHIPPING_METHODS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ShippingMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const icons = {
  standard: Truck,
  express: Zap,
  pickup: Store,
};

export function ShippingMethodSelector({ value, onChange }: ShippingMethodSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
      {SHIPPING_METHODS.map((method) => {
        const Icon = icons[method.id as keyof typeof icons] || Truck;
        const isSelected = value === method.id;

        return (
          <Card
            key={method.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              isSelected && 'border-primary bg-primary/5'
            )}
            onClick={() => onChange(method.id)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={method.id} className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{method.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </Label>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {method.price === 0 ? (
                    <span className="text-secondary">Gratis</span>
                  ) : (
                    formatPrice(method.price)
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </RadioGroup>
  );
}
