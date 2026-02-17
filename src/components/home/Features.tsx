import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Truck,
    title: 'Envío a Todo Ecuador',
    description: 'Entregas rápidas y seguras a todo el país',
    link: undefined,
  },
  {
    icon: Shield,
    title: 'Productos Garantizados',
    description: 'Todos nuestros productos cuentan con garantía',
    link: undefined,
  },
  {
    icon: Headphones,
    title: 'Atención Personalizada',
    description: 'Asesoría especializada - Contáctanos por WhatsApp',
    link: 'https://wa.me/593992686411?text=Hola%2C%20necesito%20información%20sobre%20productos',
  },
  {
    icon: CreditCard,
    title: 'Pagos Seguros',
    description: 'Múltiples opciones de pago disponibles',
    link: undefined,
  },
];

export function Features() {
  return (
    <section className="py-12 md:py-16 border-y bg-muted/20">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const CardWrapper = feature.link ? 'a' : 'div';
            const cardProps = feature.link
              ? { href: feature.link, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <CardWrapper key={index} {...cardProps}>
                <Card className={`border-0 shadow-none bg-transparent ${feature.link ? 'hover:bg-muted/30 transition-colors cursor-pointer' : ''}`}>
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
