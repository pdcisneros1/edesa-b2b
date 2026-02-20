import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { SITE_NAME, CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg">
                E
              </div>
              <div className="leading-none">
                <div className="font-bold text-white text-sm">{SITE_NAME}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Ecuador</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Especialistas en acabados de construcción. Distribuimos a ferreterías y sub-distribuidores en todo el Ecuador con los mejores productos del mercado.
            </p>
            <div className="flex gap-2">
              {[
                { href: SOCIAL_LINKS.facebook, Icon: Facebook, label: 'Facebook' },
                { href: SOCIAL_LINKS.instagram, Icon: Instagram, label: 'Instagram' },
                { href: SOCIAL_LINKS.twitter, Icon: Twitter, label: 'Twitter' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-primary hover:border-primary hover:text-white transition-all"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm tracking-wide">Navegación</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/productos', label: 'Productos' },
                { href: '/categorias', label: 'Categorías' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/contacto', label: 'Contacto' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm tracking-wide">Atención al Cliente</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/carrito" className="text-gray-400 hover:text-white transition-colors">
                  Mi Carrito
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-gray-400 hover:text-white transition-colors">
                  Finalizar Compra
                </Link>
              </li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Envío</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm tracking-wide">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary group-hover:text-primary/80" />
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary group-hover:text-primary/80" />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-gray-400">{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {currentYear} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
