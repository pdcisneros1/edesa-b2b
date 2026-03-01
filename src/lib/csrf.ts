import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'crypto';

/**
 * ============================================================================
 * CSRF Protection - Double Submit Cookie Pattern
 * ============================================================================
 *
 * Estrategia de seguridad:
 * 1. Generar token aleatorio criptográficamente seguro (32 bytes)
 * 2. Almacenar en cookie httpOnly=false (frontend puede leer)
 * 3. Frontend incluye token en header X-CSRF-Token
 * 4. Backend valida: cookie === header (ambos deben coincidir)
 *
 * Protección contra:
 * - CSRF attacks: Atacante no puede leer cookie desde otro dominio (SameSite)
 * - Cookie theft: Incluso con cookie robada, atacante necesita enviar custom header
 * - Replay attacks: Token rotado en cada login
 *
 * NO protege contra:
 * - XSS (si hay XSS, el atacante puede leer cookie y header)
 * - Subdomain attacks (si *.ejemplo.com está comprometido)
 *
 * Mitigaciones adicionales:
 * - SameSite=lax en cookies (previene envío cross-site en POST)
 * - Content-Security-Policy headers (previene XSS)
 * - HTTPS only en producción
 * ============================================================================
 */

// Nombre de la cookie CSRF
const CSRF_COOKIE_NAME = 'csrf-token';

// Nombre del header HTTP donde el frontend envía el token
const CSRF_HEADER_NAME = 'x-csrf-token';

// Longitud del token en bytes (32 bytes = 256 bits de entropía)
const TOKEN_LENGTH_BYTES = 32;

/**
 * Genera un token CSRF criptográficamente seguro.
 * Usa randomBytes (Node.js crypto module) para garantizar
 * aleatoriedad de calidad criptográfica.
 *
 * @returns Token hexadecimal de 64 caracteres (32 bytes)
 * @example
 * const token = generateCsrfToken();
 * // "a3f2d8e9c1b4f7a6e2d9c8b5f4a3e2d1c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4"
 */
export function generateCsrfToken(): string {
  return randomBytes(TOKEN_LENGTH_BYTES).toString('hex');
}

/**
 * Compara dos tokens en tiempo constante.
 * Previene timing attacks donde un atacante podría inferir el token correcto
 * midiendo el tiempo de respuesta de comparaciones character-by-character.
 *
 * @param a Primer token (esperado)
 * @param b Segundo token (proporcionado)
 * @returns true si los tokens son idénticos, false en caso contrario
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  // timingSafeEqual requiere buffers de igual longitud
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    // Si hay error (ej: longitudes diferentes), retornar false
    return false;
  }
}

/**
 * Establece la cookie CSRF en la respuesta.
 * Cookie debe ser httpOnly=false para que el frontend pueda leerla.
 *
 * @param token Token CSRF a almacenar en la cookie
 * @param expiresAt Fecha de expiración (opcional, por defecto 7 días)
 */
export async function setCsrfCookie(
  token: string,
  expiresAt?: Date
): Promise<void> {
  const cookieStore = await cookies();
  const expires = expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // IMPORTANTE: Frontend debe poder leer esta cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Cambiado de strict a lax para mejor compatibilidad
    path: '/',
    expires,
  });
}

/**
 * Elimina la cookie CSRF.
 * Usar al hacer logout o cuando la sesión expira.
 */
export async function deleteCsrfCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * Obtiene el token CSRF desde la cookie del request.
 *
 * @param request NextRequest de Next.js
 * @returns Token CSRF de la cookie o null si no existe
 */
function getCsrfTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
}

/**
 * Obtiene el token CSRF desde el header del request.
 * El frontend debe enviar el token en el header X-CSRF-Token.
 *
 * @param request NextRequest de Next.js
 * @returns Token CSRF del header o null si no existe
 */
function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_HEADER_NAME) ?? null;
}

/**
 * Valida el token CSRF usando Double Submit Cookie Pattern.
 *
 * Algoritmo:
 * 1. Extraer token de cookie
 * 2. Extraer token de header X-CSRF-Token
 * 3. Verificar que ambos existan
 * 4. Verificar que sean idénticos (comparación en tiempo constante)
 *
 * @param request NextRequest de Next.js (API route)
 * @returns true si el token es válido, false en caso contrario
 *
 * @example
 * // En un API route
 * export async function POST(request: NextRequest) {
 *   if (!validateCsrfToken(request)) {
 *     return NextResponse.json(
 *       { error: 'CSRF token inválido' },
 *       { status: 403 }
 *     );
 *   }
 *   // ... procesar request
 * }
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const tokenFromCookie = getCsrfTokenFromCookie(request);
  const tokenFromHeader = getCsrfTokenFromHeader(request);

  console.log('🔐 CSRF Validation:');
  console.log('  Cookie token:', tokenFromCookie ? `${tokenFromCookie.substring(0, 10)}...` : 'MISSING');
  console.log('  Header token:', tokenFromHeader ? `${tokenFromHeader.substring(0, 10)}...` : 'MISSING');

  // Ambos tokens deben existir
  if (!tokenFromCookie || !tokenFromHeader) {
    console.error('❌ CSRF validation failed: Missing token');
    return false;
  }

  // Ambos tokens deben ser idénticos (comparación en tiempo constante)
  const isValid = constantTimeEqual(tokenFromCookie, tokenFromHeader);
  console.log('  Tokens match:', isValid);

  if (!isValid) {
    console.error('❌ CSRF validation failed: Tokens do not match');
  }

  return isValid;
}

/**
 * Helper para obtener el nombre del header CSRF (para documentación).
 * El frontend debe incluir este header en todas las requests que modifiquen datos.
 *
 * @returns Nombre del header HTTP donde debe enviarse el token
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Helper para obtener el nombre de la cookie CSRF (para documentación).
 * El frontend lee esta cookie para obtener el token.
 *
 * @returns Nombre de la cookie que contiene el token CSRF
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

/**
 * Genera y establece un token CSRF si no existe en el request.
 * Debe llamarse en GET requests para asegurar que el frontend
 * siempre tenga un token disponible.
 *
 * @param request NextRequest de Next.js
 * @returns Token CSRF (existente o nuevo)
 *
 * @example
 * // En middleware o API route GET
 * export async function GET(request: NextRequest) {
 *   await ensureCsrfToken(request);
 *   // ... resto del handler
 * }
 */
export async function ensureCsrfToken(request: NextRequest): Promise<string> {
  const existingToken = getCsrfTokenFromCookie(request);

  if (existingToken) {
    return existingToken;
  }

  // No existe token, generar uno nuevo
  const newToken = generateCsrfToken();
  await setCsrfCookie(newToken);
  return newToken;
}

/**
 * Verifica si el request ya tiene un token CSRF válido en la cookie.
 *
 * @param request NextRequest de Next.js
 * @returns true si existe token en cookie, false si no
 */
export function hasCsrfToken(request: NextRequest): boolean {
  const token = getCsrfTokenFromCookie(request);
  return !!token && token.length > 0;
}

/**
 * Helper para validar CSRF y retornar respuesta 403 si falla.
 * Simplifica la validación en API routes.
 *
 * @param request NextRequest de Next.js
 * @returns null si válido, NextResponse con error 403 si inválido
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const csrfError = requireCsrfToken(request);
 *   if (csrfError) return csrfError;
 *   // ... continuar con lógica
 * }
 */
export function requireCsrfToken(request: NextRequest): Response | null {
  if (!validateCsrfToken(request)) {
    return Response.json(
      { error: 'Token CSRF inválido. Recarga la página e intenta nuevamente.' },
      { status: 403 }
    );
  }
  return null;
}
