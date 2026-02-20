'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="text-center max-w-md space-y-5">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 border border-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Algo salió mal</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Ocurrió un error inesperado. Por favor intenta de nuevo o vuelve al inicio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
