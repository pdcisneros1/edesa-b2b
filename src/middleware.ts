import { NextRequest, NextResponse } from 'next/server';
import { decryptEdge } from '@/lib/session';

/**
 * Rutas que requieren autenticación (cualquier usuario).
 * El middleware redirige a /login si no hay sesión válida.
 */
const AUTH_REQUIRED_PATHS = [
  '/cuenta',
  '/checkout/confirmacion',
  '/checkout/envio',
  '/checkout/informacion',
];

/**
 * Rutas que requieren rol 'admin'.
 * El middleware redirige a /login si no hay sesión, o a / si no es admin.
 */
const ADMIN_PATHS = ['/admin'];

/**
 * Rutas públicas que NUNCA deben redirigirse aunque haya sesión
 * (evitar loops en redirect de login).
 */
const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Headers de seguridad HTTP aplicados a todas las respuestas.
 * CSP configurada para Next.js: permite scripts y estilos inline (necesarios para
 * el runtime de Next.js), imágenes de orígenes de datos externos y CDNs necesarios.
 */
function applySecurityHeaders(response: NextResponse, isProduction: boolean): void {
  // Previene clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Previene MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer info solo al mismo origen en requests cross-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Deshabilitar funciones de dispositivo innecesarias
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Content Security Policy
  // - Next.js requiere 'unsafe-inline' para estilos y scripts del runtime
  // - 'unsafe-eval' puede ser necesario para algunos transpiladores; se quita en producción si es posible
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: self + inline (Next.js runtime) + datos en línea
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Estilos: self + inline (Tailwind/CSS-in-JS)
    "style-src 'self' 'unsafe-inline'",
    // Imágenes: self + data URIs + placehold.co (usado para placeholders)
    "img-src 'self' data: blob: https://placehold.co",
    // Fuentes: self + data URIs
    "font-src 'self' data:",
    // Conexiones: self (fetch/XHR propios)
    "connect-src 'self'",
    // Formularios: solo self
    "form-action 'self'",
    // No permite iframes embebidos
    "frame-ancestors 'none'",
    // Base URI: solo self
    "base-uri 'self'",
    // Objetos embebidos: ninguno
    "object-src 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // HSTS: forzar HTTPS por 1 año (solo en producción)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';

  // Ignorar archivos estáticos y rutas de Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/documents') ||
    pathname.match(/\.(ico|png|jpg|jpeg|webp|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Leer y verificar sesión desde la cookie
  const token = request.cookies.get('session')?.value;
  let session = null;

  if (token) {
    session = await decryptEdge(token);
    // Si el token está corrupto o expirado, lo ignoramos (session = null)
    // La cookie se limpiará en el siguiente getSession() del server component
  }

  // ─── Protección de rutas admin ───────────────────────────────────────────
  if (isAdminPath(pathname)) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      applySecurityHeaders(response, isProduction);
      return response;
    }

    if (session.role !== 'admin') {
      // Autenticado pero no admin — redirigir a su cuenta
      const response = NextResponse.redirect(new URL('/cuenta', request.url));
      applySecurityHeaders(response, isProduction);
      return response;
    }
  }

  // ─── Protección de rutas que requieren autenticación ────────────────────
  if (isAuthRequiredPath(pathname) && !isPublicPath(pathname)) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      applySecurityHeaders(response, isProduction);
      return response;
    }
  }

  // ─── Respuesta normal con headers de seguridad ───────────────────────────
  const response = NextResponse.next();
  applySecurityHeaders(response, isProduction);
  return response;
}

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
