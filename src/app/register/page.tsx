'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, User, Phone, Mail, Lock, IdCard, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Error al registrarse');
        return;
      }
      toast.success('¡Registro exitoso! Bienvenido a EDESA VENTAS');
      router.push('/cuenta');
      router.refresh();
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] flex-shrink-0 bg-gray-950 p-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-base">
            E
          </div>
          <span className="font-bold text-white text-sm tracking-tight">{SITE_NAME}</span>
        </Link>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Cuenta Empresarial
            </p>
            <h2 className="text-2xl font-bold text-white leading-snug">
              Únete a la red de distribución
            </h2>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Regístrate y accede a precios mayoristas, catálogo completo y atención personalizada.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Precios exclusivos para ferreterías',
              'Pedidos con RUC y factura',
              'Soporte por WhatsApp dedicado',
              'Catálogo de 1,700+ productos',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <span className="text-xl font-extrabold text-primary tracking-tight">{SITE_NAME}</span>
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-900">Registro de Ferretería</h1>
            <p className="text-sm text-gray-500 mt-1">
              Accede a precios mayoristas y gestiona tus pedidos
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Company */}
              <div>
                <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                  Nombre de Empresa <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    placeholder="Ferretería García & Asociados"
                    className="pl-9 h-10"
                    {...register('company')}
                  />
                </div>
                {errors.company && (
                  <p className="text-xs text-red-600 mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* RUC */}
              <div>
                <Label htmlFor="ruc" className="text-sm font-medium text-gray-700">
                  RUC <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="ruc"
                    placeholder="0912345678001"
                    className="pl-9 h-10"
                    {...register('ruc')}
                  />
                </div>
                {errors.ruc && (
                  <p className="text-xs text-red-600 mt-1">{errors.ruc.message}</p>
                )}
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      className="pl-9 h-10"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="García"
                    className="mt-1.5 h-10"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="09X XXX XXXX"
                    className="pl-9 h-10"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="pedidos@ferreteria.ec"
                    className="pl-9 h-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9 pr-9 h-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repetir contraseña"
                      className="pl-9 pr-9 h-10"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta de Ferretería'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Al registrarte aceptas nuestros{' '}
            <a href="#" className="hover:underline">términos y condiciones</a>
          </p>
        </div>
      </div>
    </div>
  );
}
