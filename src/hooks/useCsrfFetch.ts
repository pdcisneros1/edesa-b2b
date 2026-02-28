import { useCallback } from 'react';

/**
 * Hook para realizar fetch requests con protección CSRF automática.
 *
 * Uso:
 * ```tsx
 * const { csrfFetch } = useCsrfFetch();
 *
 * const response = await csrfFetch('/api/orders', {
 *   method: 'POST',
 *   body: JSON.stringify(orderData),
 * });
 * ```
 *
 * El hook:
 * - Lee el token CSRF de la cookie automáticamente
 * - Lo incluye en el header x-csrf-token
 * - Maneja errores CSRF (403) reintentando con nuevo token
 * - Incluye credentials: 'include' por defecto
 */
export function useCsrfFetch() {
  /**
   * Obtiene el token CSRF desde la cookie.
   */
  const getCsrfToken = useCallback((): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    return match ? match[1] : null;
  }, []);

  /**
   * Realiza un fetch con protección CSRF automática.
   *
   * @param url - URL del endpoint (relativa o absoluta)
   * @param options - Opciones de fetch (method, body, headers, etc.)
   * @returns Promise<Response>
   */
  const csrfFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let token = getCsrfToken();

      // Si no existe token, intentar obtener uno nuevo
      if (!token) {
        try {
          await fetch('/api/csrf', { credentials: 'include' });
          token = getCsrfToken();
        } catch (error) {
          console.error('Error al obtener token CSRF:', error);
        }

        if (!token) {
          throw new Error(
            'No se pudo obtener token CSRF. Por favor, recarga la página.'
          );
        }
      }

      // Preparar headers
      const headers = new Headers(options.headers);
      headers.set('x-csrf-token', token);

      // Si el body es un objeto JSON string, agregar Content-Type
      if (
        options.body &&
        typeof options.body === 'string' &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json');
      }

      // Realizar request
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials ?? 'include', // Importante: enviar cookies
      });

      // Si falla por CSRF (403), intentar con nuevo token
      if (response.status === 403) {
        try {
          const errorData = await response.clone().json();

          if (errorData.error?.toLowerCase().includes('csrf')) {
            console.warn('Token CSRF inválido, obteniendo nuevo token...');

            // Obtener nuevo token
            await fetch('/api/csrf', { credentials: 'include' });
            const newToken = getCsrfToken();

            if (newToken) {
              headers.set('x-csrf-token', newToken);

              // Reintentar request con nuevo token
              return fetch(url, {
                ...options,
                headers,
                credentials: options.credentials ?? 'include',
              });
            }
          }
        } catch (error) {
          console.error('Error al procesar respuesta 403:', error);
        }
      }

      return response;
    },
    [getCsrfToken]
  );

  return { csrfFetch, getCsrfToken };
}
