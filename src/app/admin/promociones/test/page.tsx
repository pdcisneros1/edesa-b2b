'use client';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page - Promociones</h1>
      <div className="space-y-4">
        <p className="text-green-600">✅ Esta página carga correctamente</p>
        <p>Si ves esto, significa que:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>El routing funciona</li>
          <li>El layout admin funciona</li>
          <li>'use client' funciona</li>
        </ul>
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium">Siguiente paso:</p>
          <p className="text-sm text-muted-foreground">
            Visita /admin/promociones/nueva y envíame screenshot de cualquier error en la consola
          </p>
        </div>
      </div>
    </div>
  );
}
