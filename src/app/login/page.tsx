'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Store, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { SITE_NAME } from '@/lib/constants';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Bienvenido de vuelta!');
        const redirect = searchParams.get('redirect');
        const safeRedirect =
          redirect && redirect.startsWith('/') ? redirect : '/admin';
        router.push(safeRedirect);
      } else {
        toast.error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const isFromStorefront = searchParams.get('redirect')?.startsWith('/productos');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — only on desktop */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gray-950 p-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-base">
            E
          </div>
          <span className="font-bold text-white text-sm tracking-tight">{SITE_NAME}</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Plataforma B2B
            </p>
            <h2 className="text-2xl font-bold text-white leading-snug">
              El catálogo mayorista para ferreterías en Ecuador
            </h2>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Accede a precios exclusivos, gestiona pedidos y trabaja directamente con el distribuidor.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Precios mayoristas en tiempo real',
              'Pedidos con facturación empresarial',
              'Catálogo de más de 1,700 productos',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-7">
          {/* Logo (mobile) */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-xl shadow">
                E
              </div>
              <span className="font-bold text-gray-900">{SITE_NAME}</span>
            </Link>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isFromStorefront ? 'Acceso Ferretería' : 'Acceder al sistema'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isFromStorefront
                ? 'Ingresa tus credenciales para ver precios mayoristas'
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {isFromStorefront && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                  Plataforma B2B Ferretería
                </p>
              </div>
              <div className="space-y-1.5">
                {[
                  'Precios mayoristas exclusivos',
                  'Compra directa al distribuidor',
                  'Facturación empresarial disponible',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-blue-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-center text-gray-500">
            ¿Eres ferretería y no tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <div className="text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
