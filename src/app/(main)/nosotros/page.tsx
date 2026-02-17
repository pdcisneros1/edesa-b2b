import { CheckCircle2, Target, Users, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SITE_NAME } from '@/lib/constants';

export const metadata = {
  title: 'Nosotros',
  description: 'Conoce más sobre EDESA VENTAS, especialistas en acabados de construcción',
};

const values = [
  {
    icon: Target,
    title: 'Misión',
    description:
      'Proveer productos de la más alta calidad para acabados de construcción, ofreciendo soluciones integrales que superen las expectativas de nuestros clientes.',
  },
  {
    icon: CheckCircle2,
    title: 'Visión',
    description:
      'Ser la empresa líder en México en distribución de productos para acabados de construcción, reconocida por nuestra excelencia en servicio y calidad.',
  },
  {
    icon: Users,
    title: 'Compromiso',
    description:
      'Mantener relaciones duraderas con nuestros clientes, proveedores y colaboradores, basadas en la confianza, respeto y profesionalismo.',
  },
  {
    icon: Award,
    title: 'Calidad',
    description:
      'Garantizar productos de las mejores marcas del mercado, respaldados por certificaciones y garantías que aseguran la satisfacción total.',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-12">
      {/* Hero section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">
          Acerca de {SITE_NAME}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Con más de 30 años de experiencia, somos especialistas en la
          distribución de productos para acabados de construcción, ofreciendo
          soluciones integrales para proyectos residenciales y comerciales.
        </p>
      </div>

      {/* Story section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Desde nuestros inicios, {SITE_NAME} se ha dedicado a
                proporcionar los mejores productos para acabados de construcción
                en México. Trabajamos con las marcas más reconocidas del
                mercado, garantizando calidad y durabilidad en cada producto.
              </p>
              <p>
                Nuestra experiencia nos ha permitido comprender las necesidades
                específicas de cada proyecto, desde pequeñas remodelaciones
                hasta grandes desarrollos comerciales. Contamos con un equipo de
                especialistas listos para asesorarte en la selección de
                productos ideales para tu proyecto.
              </p>
              <p>
                En {SITE_NAME}, no solo vendemos productos, construimos
                relaciones duraderas con nuestros clientes, ofreciendo servicio
                personalizado y soporte técnico especializado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Values section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nuestros Valores
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-muted/40 rounded-lg p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-3 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">30+</div>
            <p className="text-muted-foreground">Años de Experiencia</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <p className="text-muted-foreground">Proyectos Completados</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Satisfacción del Cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
