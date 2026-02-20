import type { Metadata } from 'next';
import { BANK_INFO, SITE_NAME } from '@/lib/constants';
import { Landmark, CreditCard, ShieldCheck, Clock, Copy } from 'lucide-react';

export const metadata: Metadata = {
  title: `Métodos de Pago | ${SITE_NAME}`,
  description:
    'Conoce los métodos de pago aceptados por EDESA VENTAS: transferencia bancaria y próximamente pago con tarjeta.',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function PagosPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container py-10 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Pagos
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
            Métodos de Pago
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Aceptamos los siguientes métodos de pago para pedidos mayoristas en Ecuador.
          </p>
        </div>

        <div className="space-y-5">
          {/* Transfer card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-primary px-6 py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Transferencia Bancaria</h2>
                <p className="text-xs text-white/80">Disponible — Método principal</p>
              </div>
              <span className="ml-auto text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                Recomendado
              </span>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                Realiza una transferencia a nuestra cuenta e indica el número de pedido como referencia.
                Tu pedido se activará una vez confirmemos la recepción del pago.
              </p>

              <div className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Datos bancarios
                </p>
                <InfoRow label="Banco" value={BANK_INFO.bankName} />
                <InfoRow label="Tipo de cuenta" value={BANK_INFO.accountType} />
                <InfoRow label="Número de cuenta" value={BANK_INFO.accountNumber} />
                <InfoRow label="Beneficiario" value={BANK_INFO.companyName} />
                <InfoRow label="RUC" value={BANK_INFO.companyRuc} />
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Importante:</strong> incluye el número de tu pedido como referencia de la transferencia.
                  Tienes <strong>24 horas</strong> para realizar el pago.
                </p>
              </div>
            </div>
          </div>

          {/* Card payment (coming soon) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-70">
            <div className="bg-gray-300 px-6 py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Pago con Tarjeta</h2>
                <p className="text-xs text-white/80">Crédito / Débito / Visa / Mastercard</p>
              </div>
              <span className="ml-auto text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                Próximamente
              </span>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500">
                Estamos integrando una pasarela de pagos local. Pronto podrás pagar con tarjeta de
                crédito o débito directamente en la plataforma.
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-4">
            <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800 mb-0.5">Transacciones Seguras</p>
              <p className="text-xs text-green-700">
                Toda información de pago se maneja con los más altos estándares de seguridad.
                Nunca compartiremos tus datos bancarios con terceros.
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              ¿Tienes preguntas sobre pagos?{' '}
              <a href="https://wa.me/593987654321" className="text-primary font-medium hover:underline">
                Escríbenos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
