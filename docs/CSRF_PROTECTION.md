# 🔒 CSRF Protection - Guía de Implementación Frontend

Este documento explica cómo usar la protección CSRF implementada en EDESA VENTAS B2B.

## ¿Qué es CSRF Protection?

**CSRF (Cross-Site Request Forgery)** es un ataque donde un sitio malicioso hace que el navegador del usuario envíe requests no autorizadas a nuestra aplicación usando las cookies de sesión del usuario.

**Nuestra protección:**
- Double Submit Cookie Pattern
- Token en cookie `csrf-token` (httpOnly=false, sameSite=strict)
- Token debe enviarse en header `x-csrf-token`
- Validación obligatoria en POST/PUT/DELETE

## 🎯 Endpoints Protegidos

Todos estos endpoints requieren token CSRF válido:

### Órdenes
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/[id]` - Actualizar estado de orden (admin)

### Admin - Productos
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/[id]` - Actualizar producto
- `DELETE /api/admin/products/[id]` - Eliminar producto

### Admin - Upload
- `POST /api/admin/upload` - Subir archivos

### Admin - Usuarios (cuando se implementen)
- `POST /api/admin/usuarios` - Crear usuario
- `PUT /api/admin/usuarios/[id]` - Actualizar usuario
- `DELETE /api/admin/usuarios/[id]` - Eliminar usuario

### Admin - Promociones (cuando se implementen)
- `POST /api/admin/promociones` - Crear promoción
- `PUT /api/admin/promociones/[id]` - Actualizar promoción
- `DELETE /api/admin/promociones/[id]` - Eliminar promoción

## 📖 Cómo Funciona

1. **Usuario inicia sesión** → Backend genera token CSRF automáticamente
2. **Token guardado en cookie** → `csrf-token` (readable por JavaScript)
3. **Frontend lee cookie** → Antes de cada POST/PUT/DELETE
4. **Frontend envía header** → `x-csrf-token: <valor-de-cookie>`
5. **Backend valida** → Cookie === Header (comparación en tiempo constante)

## 🚀 Implementación Frontend

### Opción 1: Helper Manual (Vanilla JS/TypeScript)

```typescript
/**
 * Obtiene el token CSRF desde la cookie.
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Realiza un fetch protegido con CSRF.
 *
 * @param url - URL del endpoint
 * @param options - Opciones de fetch (method, body, etc.)
 */
async function csrfFetch(url: string, options: RequestInit = {}) {
  const token = getCsrfToken();

  if (!token) {
    throw new Error('Token CSRF no encontrado. Recarga la página.');
  }

  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}

// Ejemplo de uso
async function crearPedido(orderData: any) {
  const response = await csrfFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear pedido');
  }

  return response.json();
}
```

### Opción 2: Hook React Recomendado

```typescript
// src/hooks/useCsrfFetch.ts
import { useCallback } from 'react';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

export function useCsrfFetch() {
  const csrfFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getCsrfToken();

    if (!token) {
      // Intentar obtener nuevo token
      await fetch('/api/csrf');
      const newToken = getCsrfToken();

      if (!newToken) {
        throw new Error('No se pudo obtener token CSRF. Recarga la página.');
      }
    }

    const headers = new Headers(options.headers);
    headers.set('x-csrf-token', token || getCsrfToken()!);

    if (options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Importante: enviar cookies
    });

    // Si falla por CSRF, refrescar token y reintentar
    if (response.status === 403) {
      const error = await response.json();
      if (error.error?.includes('CSRF')) {
        // Obtener nuevo token
        await fetch('/api/csrf');
        const newToken = getCsrfToken();

        if (newToken) {
          headers.set('x-csrf-token', newToken);
          // Reintentar request
          return fetch(url, { ...options, headers, credentials: 'include' });
        }
      }
    }

    return response;
  }, []);

  return { csrfFetch };
}

// Uso en componente
function CheckoutPage() {
  const { csrfFetch } = useCsrfFetch();

  const handleSubmit = async (orderData: any) => {
    try {
      const response = await csrfFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Error al crear pedido');
      }

      const data = await response.json();
      console.log('Pedido creado:', data.order);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({...}); }}>
      {/* ... */}
    </form>
  );
}
```

### Opción 3: Axios Interceptor

```typescript
// src/lib/api-client.ts
import axios from 'axios';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Interceptor para agregar CSRF token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = getCsrfToken();

  if (token && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
    config.headers['x-csrf-token'] = token;
  }

  return config;
});

// Interceptor para manejar errores CSRF
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      // Obtener nuevo token
      await axios.get('/api/csrf');

      // Reintentar request original
      const token = getCsrfToken();
      if (token) {
        error.config.headers['x-csrf-token'] = token;
        return axios(error.config);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Uso
import apiClient from '@/lib/api-client';

async function crearPedido(orderData: any) {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
}
```

## 🔐 FormData (File Uploads)

Para subir archivos, el token CSRF también es obligatorio:

```typescript
async function subirArchivo(file: File) {
  const token = getCsrfToken();

  if (!token) {
    throw new Error('Token CSRF no encontrado');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      'x-csrf-token': token,
      // NO incluir Content-Type para FormData (el browser lo hace automático)
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al subir archivo');
  }

  return response.json();
}
```

## ⚠️ Errores Comunes

### Error 403: "Token CSRF inválido"

**Causas:**
1. Cookie no existe (usuario no ha iniciado sesión)
2. Header no se envió correctamente
3. Token expiró (cookie expiró después de 7 días)

**Solución:**
```typescript
// Verificar que la cookie existe
const token = getCsrfToken();
console.log('CSRF Token:', token);

// Verificar que el header se está enviando
console.log('Headers:', request.headers);

// Si el token no existe, obtener uno nuevo
if (!token) {
  await fetch('/api/csrf');
}
```

### Cookie no se puede leer

**Causa:** sameSite=strict puede bloquear la cookie en navegación cross-site.

**Solución:** Asegurarse de que el usuario está navegando directamente en tu dominio, no desde un link externo.

### Token expirado

**Causa:** Cookie de CSRF expira después de 7 días.

**Solución:** Solicitar nuevo token con `GET /api/csrf`

## 🧪 Testing

### Verificar que CSRF funciona correctamente:

```typescript
// Test 1: Request sin token debe fallar
async function testSinToken() {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ /* ... */ }),
  });

  console.assert(response.status === 403, 'Sin token debe retornar 403');
}

// Test 2: Request con token correcto debe funcionar
async function testConToken() {
  const token = getCsrfToken();
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token!,
    },
    body: JSON.stringify({ /* ... */ }),
  });

  console.assert(response.status !== 403, 'Con token debe pasar validación CSRF');
}

// Test 3: Request con token incorrecto debe fallar
async function testTokenIncorrecto() {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'token-falso-123',
    },
    body: JSON.stringify({ /* ... */ }),
  });

  console.assert(response.status === 403, 'Token incorrecto debe retornar 403');
}
```

## 📚 Recursos Adicionales

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

## 🎯 Resumen

1. ✅ Token CSRF se genera automáticamente en login
2. ✅ Token se guarda en cookie `csrf-token` (readable)
3. ✅ Frontend lee cookie y envía en header `x-csrf-token`
4. ✅ Backend valida en todos los POST/PUT/DELETE protegidos
5. ✅ Si falla (403), obtener nuevo token con `GET /api/csrf`

**Implementa el hook `useCsrfFetch` o el interceptor de Axios para proteger todas tus requests automáticamente.**
