import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_INFO, SITE_NAME } from '@/lib/constants';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contáctanos para cotizaciones mayoristas, asesoría técnica o información sobre distribución de sanitarios y acabados de construcción en Ecuador.',
  openGraph: {
    title: 'Contacto | EDESA VENTAS',
    description: 'Solicita cotización mayorista para tu ferretería o proyecto de construcción en Ecuador.',
  },
};

const contactItems = [
  {
    icon: Phone,
    label: 'Teléfono',
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phone}`,
  },
  {
    icon: Mail,
    label: 'Email',
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    icon: MapPin,
    label: 'Dirección',
    value: CONTACT_INFO.address,
    href: undefined,
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun–Vie: 9:00–18:00 · Sáb: 9:00–14:00',
    href: undefined,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Estamos aquí para ayudarte
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
            Contáctanos
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">
            Para cotizaciones, asesoría técnica o información sobre distribución mayorista en Ecuador. Respondemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Envíanos un Mensaje</h2>
              <form className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      Nombre
                    </Label>
                    <Input id="firstName" name="firstName" placeholder="Tu nombre" required className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Apellido
                    </Label>
                    <Input id="lastName" name="lastName" placeholder="Tu apellido" required className="h-10" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <Input id="phone" name="phone" type="tel" placeholder="09X XXX XXXX" required className="h-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                    Empresa <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <Input id="company" name="company" placeholder="Nombre de tu empresa" className="h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Asunto
                  </Label>
                  <Input id="subject" name="subject" placeholder="¿En qué podemos ayudarte?" required className="h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Mensaje
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="gap-2 font-semibold">
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Información de Contacto</h2>
              <div className="space-y-5">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm text-gray-700 hover:text-primary transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold text-white text-sm">WhatsApp</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                ¿Necesitas respuesta rápida? Contáctanos por WhatsApp y te respondemos al instante.
              </p>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
              >
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
