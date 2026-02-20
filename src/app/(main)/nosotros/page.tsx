import type { Metadata } from 'next';
import { CheckCircle2, Target, Users, Award } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    `Conoce más sobre ${SITE_NAME}, especialistas en distribución mayorista de acabados de construcción en Ecuador. Más de 30 años sirviendo a ferreterías y sub-distribuidores.`,
  openGraph: {
    title: `Nosotros | ${SITE_NAME}`,
    description: `Distribuidora mayorista de sanitarios y acabados de construcción en Ecuador. Confianza y calidad para ferreterías y sub-distribuidores.`,
  },
};

const values = [
  {
    icon: Target,
    title: 'Misión',
    description:
      'Proveer productos de la más alta calidad para acabados de construcción en Ecuador, ofreciendo soluciones integrales que superen las expectativas de nuestros clientes y socios distribuidores.',
  },
  {
    icon: CheckCircle2,
    title: 'Visión',
    description:
      'Ser la empresa líder en Ecuador en distribución mayorista de productos para acabados de construcción, reconocida por nuestra excelencia en servicio, calidad y relaciones comerciales de largo plazo.',
  },
  {
    icon: Users,
    title: 'Compromiso',
    description:
      'Mantener relaciones duraderas con ferreterías, sub-distribuidores y proveedores en todo Ecuador, basadas en la confianza, respeto y profesionalismo.',
  },
  {
    icon: Award,
    title: 'Calidad',
    description:
      'Garantizar productos de las mejores marcas del mercado ecuatoriano, respaldados por certificaciones y garantías que aseguran la satisfacción total del cliente final.',
  },
];

const stats = [
  { value: '30+', label: 'Años de Experiencia' },
  { value: '5,000+', label: 'Clientes Atendidos' },
  { value: '98%', label: 'Satisfacción del Cliente' },
];

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-12 md:py-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Distribuidora Mayorista Ecuador
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl mb-4 leading-tight">
            Acerca de {SITE_NAME}
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Especialistas en distribución de productos para acabados de construcción en Ecuador,
            con presencia nacional y enfoque en ferreterías y sub-distribuidores.
          </p>
        </div>
      </div>

      <div className="container py-10 md:py-14">
        {/* Story */}
        <div className="max-w-3xl mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nuestra Historia</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-4">
            <p className="text-gray-600 leading-relaxed text-sm">
              Desde nuestros inicios, {SITE_NAME} se ha dedicado a proveer los mejores productos
              para acabados de construcción en Ecuador. Trabajamos con las marcas más reconocidas
              del mercado, garantizando calidad y durabilidad en cada producto que distribuimos a
              ferreterías y sub-distribuidores en todo el país.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              Nuestra experiencia nos ha permitido comprender las necesidades específicas de cada
              proyecto en Ecuador, desde pequeñas remodelaciones residenciales hasta grandes
              desarrollos comerciales. Contamos con un equipo de especialistas listos para asesorar
              a nuestros distribuidores en la selección de productos ideales.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              En {SITE_NAME}, no solo distribuimos productos: construimos relaciones duraderas con
              ferreterías y sub-distribuidores, ofreciendo precios mayoristas competitivos, soporte
              técnico especializado y atención personalizada en todo Ecuador.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-14">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Lo que nos define
            </p>
            <h2 className="text-lg font-bold text-gray-900">Nuestros Valores</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-primary/8 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{value.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 rounded-xl p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold text-primary mb-2 tabular-nums">{value}</div>
                <p className="text-gray-400 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
