'use client';

import { cn } from '@/lib/utils';
import { BANK_INFO } from '@/lib/constants';
import { Landmark, CreditCard, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { PaymentMethod } from '@/types/sales';

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

const methods: { id: PaymentMethod; label: string; description: string; icon: React.ElementType; available: boolean }[] = [
  {
    id: 'transferencia',
    label: 'Transferencia Bancaria',
    description: 'Realiza el pago a nuestra cuenta. El pedido se activa al confirmar la transferencia.',
    icon: Landmark,
    available: true,
  },
  {
    id: 'tarjeta',
    label: 'Pago con Tarjeta',
    description: 'Próximamente disponible.',
    icon: CreditCard,
    available: false,
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Method cards */}
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = value === method.id;
        return (
          <button
            key={method.id}
            type="button"
            disabled={!method.available}
            onClick={() => method.available && onChange(method.id)}
            className={cn(
              'w-full text-left rounded-xl border-2 p-4 transition-all',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 bg-white hover:border-gray-300',
              !method.available && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  {!method.available && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  )}
                  {method.id === 'transferencia' && method.available && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
              </div>
              {/* Radio indicator */}
              <div className={cn(
                'mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors',
                isSelected ? 'border-primary bg-primary' : 'border-gray-300'
              )}>
                {isSelected && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Bank details — shown when transferencia selected */}
      {value === 'transferencia' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">Datos para la transferencia</p>
          <div className="space-y-2 text-sm">
            <BankDetail label="Banco" value={BANK_INFO.bankName} />
            <BankDetail label="Tipo de cuenta" value={BANK_INFO.accountType} />
            <BankDetail
              label="Número de cuenta"
              value={BANK_INFO.accountNumber}
              copyable
              onCopy={handleCopy}
              copied={copied}
            />
            <BankDetail label="Beneficiario" value={BANK_INFO.companyName} />
            <BankDetail label="RUC" value={BANK_INFO.companyRuc} />
          </div>
          <p className="text-xs text-amber-700 border-t border-amber-200 pt-3">
            {BANK_INFO.transferNote}
          </p>
        </div>
      )}
    </div>
  );
}

function BankDetail({
  label, value, copyable, onCopy, copied,
}: {
  label: string; value: string; copyable?: boolean;
  onCopy?: (v: string) => void; copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 min-w-[120px]">{label}:</span>
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-gray-900">{value}</span>
        {copyable && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(value)}
            className="text-gray-400 hover:text-primary transition-colors"
            title="Copiar"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
