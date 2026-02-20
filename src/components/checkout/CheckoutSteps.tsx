import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  href: string;
}

const steps: Step[] = [
  { number: 1, title: 'Información', href: '/checkout/informacion' },
  { number: 2, title: 'Envío', href: '/checkout/envio' },
  { number: 3, title: 'Confirmación', href: '/checkout/confirmacion' },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progreso del checkout">
      <ol className="flex items-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <li key={step.number} className="flex items-center">
              {/* Step indicator */}
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                    isCompleted && 'border-primary bg-primary text-white',
                    isCurrent && 'border-primary bg-white text-primary',
                    isUpcoming && 'border-gray-200 bg-white text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-gray-900',
                    isCompleted && 'text-gray-600',
                    isUpcoming && 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-3 h-0.5 w-8 md:w-16',
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
