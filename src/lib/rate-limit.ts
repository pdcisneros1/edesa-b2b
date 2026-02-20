/**
 * Rate limiter en memoria con ventana deslizante (sliding window).
 * Apropiado para despliegues single-instance (Vercel, un solo servidor).
 * Para multi-instance en producción, migrar a Redis con ioredis.
 *
 * NO exponer ningún detalle de implementación al cliente.
 */

interface RateLimitEntry {
  /** Timestamps de solicitudes en la ventana actual */
  timestamps: number[];
  /** Si el IP/key está bloqueado temporalmente */
  blockedUntil?: number;
}

interface RateLimitConfig {
  /** Número máximo de solicitudes permitidas en la ventana */
  maxRequests: number;
  /** Tamaño de la ventana en milisegundos */
  windowMs: number;
  /** Tiempo de bloqueo en ms si se excede el límite (default: windowMs) */
  blockDurationMs?: number;
}

// Store global en memoria
const store = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar memory leaks (cada 5 minutos)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Eliminar entradas cuyo bloqueo expiró y sin timestamps recientes
      const isBlocked = entry.blockedUntil && entry.blockedUntil > now;
      const hasRecentTimestamps = entry.timestamps.some((t) => t > now - 60 * 60 * 1000);
      if (!isBlocked && !hasRecentTimestamps) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Verifica si una clave (IP o email) ha excedido el límite de solicitudes.
 * @returns `{ limited: true, retryAfterMs }` si está limitado, `{ limited: false }` si no.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { limited: false } | { limited: true; retryAfterMs: number } {
  const { maxRequests, windowMs, blockDurationMs = windowMs } = config;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Verificar si está bloqueado
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return { limited: true, retryAfterMs: entry.blockedUntil - now };
  }

  // Limpiar timestamps fuera de la ventana
  entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);

  if (entry.timestamps.length >= maxRequests) {
    // Bloquear por blockDurationMs
    entry.blockedUntil = now + blockDurationMs;
    return { limited: true, retryAfterMs: blockDurationMs };
  }

  // Registrar esta solicitud
  entry.timestamps.push(now);
  return { limited: false };
}

/**
 * Reinicia el contador para una clave (usar tras login exitoso para limpiar intentos fallidos).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

// ─── Configuraciones predefinidas ────────────────────────────────────────────

/** Login: 5 intentos por ventana de 15 minutos, bloqueo de 15 minutos */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
};

/** Registro: 3 intentos por IP por ventana de 1 hora */
export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
};

/** Checkout: 10 pedidos por IP por ventana de 1 hora */
export const CHECKOUT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
};

/**
 * Extrae el IP real del request, respetando proxies de confianza (Vercel, Cloudflare).
 * Si no hay IP disponible (tests, localhost sin proxy), usa fallback.
 */
export function getClientIp(request: Request): string {
  // Vercel / Cloudflare envían el IP real en estos headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Puede ser "ip1, ip2, ip3" — el primero es el cliente original
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback para entornos locales sin proxy
  return '127.0.0.1';
}
