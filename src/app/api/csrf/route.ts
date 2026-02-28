import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie, hasCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 *
 * Endpoint para obtener o generar un token CSRF.
 * El frontend debe llamar a este endpoint antes de realizar
 * operaciones POST/PUT/DELETE si no tiene un token.
 *
 * Flujo:
 * 1. Si ya existe token en cookie, lo retorna
 * 2. Si no existe, genera uno nuevo, lo guarda en cookie y lo retorna
 *
 * El token se retorna en el response body y también se establece en cookie.
 * El frontend debe leer el token de la cookie y enviarlo en el header.
 *
 * @example
 * // Frontend
 * const response = await fetch('/api/csrf');
 * const { token } = await response.json();
 * // El token también está en document.cookie
 */
export async function GET(request: NextRequest) {
  let token: string;

  // Verificar si ya existe token
  if (hasCsrfToken(request)) {
    // Ya existe, reutilizar
    token = request.cookies.get('csrf-token')?.value ?? '';
  } else {
    // No existe, generar nuevo
    token = generateCsrfToken();
    await setCsrfCookie(token);
  }

  return NextResponse.json({
    token,
    headerName: 'x-csrf-token',
    cookieName: 'csrf-token',
  });
}
