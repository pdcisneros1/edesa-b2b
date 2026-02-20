/**
 * Funciones de sesión JWT compatibles con Edge Runtime.
 * Este módulo SOLO usa `jose` (compatible con Edge) y NO importa
 * bcrypt ni Prisma. Es seguro usarlo en src/middleware.ts.
 *
 * Las funciones que requieren Prisma o bcrypt están en src/lib/auth.ts.
 */
import { jwtVerify } from 'jose';
import type { SessionPayload } from './auth';

const secretKey = process.env.JWT_SECRET;

/**
 * Decodifica y verifica un JWT.
 * Retorna null si el token es inválido, expirado o el secreto no está configurado.
 * Compatible con Edge Runtime (no usa Node.js APIs).
 */
export async function decryptEdge(token: string): Promise<SessionPayload | null> {
  if (!secretKey) return null;

  try {
    const key = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    // Verificar que el payload contiene los campos requeridos mínimos
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    // Token expirado, firma inválida, etc.
    return null;
  }
}
