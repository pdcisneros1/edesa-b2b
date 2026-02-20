import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Envío a Todo Ecuador',
    description: 'Entregas rápidas y seguras a todo el país',
    link: undefined,
    external: false,
  },
  {
    icon: Shield,
    title: 'Productos Garantizados',
    description: 'Todos nuestros productos cuentan con garantía',
    link: undefined,
    external: false,
  },
  {
    icon: Headphones,
    title: 'Atención Personalizada',
    description: 'Asesoría especializada por WhatsApp',
    link: 'https://wa.me/593992686411?text=Hola%2C%20necesito%20información%20sobre%20productos',
    external: true,
  },
  {
    icon: CreditCard,
    title: 'Métodos de Pago',
    description: 'Transferencia bancaria y próximamente tarjeta',
    link: '/pagos',
    external: false,
  },
];

export function Features() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container">
        <div className="grid grid-cols-2 divide-x divide-y md:divide-y-0 md:grid-cols-4 border-x border-gray-100">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const Wrapper = feature.link ? 'a' : 'div';
            const wrapperProps = feature.link
              ? feature.external
                ? { href: feature.link, target: '_blank', rel: 'noopener noreferrer' }
                : { href: feature.link }
              : {};

            return (
              <Wrapper key={index} {...(wrapperProps as any)}>
                <div
                  className={`flex items-center gap-3 px-5 py-4 h-full ${
                    feature.link
                      ? 'hover:bg-gray-50 cursor-pointer transition-colors group'
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0 rounded-lg bg-primary/8 p-2.5">
                    <Icon className={`h-4.5 w-4.5 text-primary ${feature.link ? 'group-hover:scale-110 transition-transform' : ''}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{feature.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">{feature.description}</p>
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
