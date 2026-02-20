'use client';

import { createContext, useContext } from 'react';
import type { SessionPayload, ClientType } from '@/lib/auth';

interface AuthContextValue {
  session: SessionPayload | null;
  isAuthenticated: boolean;
  clientType: ClientType | null;
  /** true si puede ver precios mayoristas */
  canSeePrices: boolean;
  /**
   * true si el cliente está aprobado para comprar.
   * Por ahora todos los usuarios autenticados están aprobados automáticamente.
   * Arquitectura preparada para aprobación manual futura.
   */
  clienteAprobado: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isAuthenticated: false,
  clientType: null,
  canSeePrices: false,
  clienteAprobado: false,
});

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: SessionPayload | null;
}) {
  const isAuthenticated = !!session;
  const clientType = session?.clientType ?? null;
  // Cualquier usuario autenticado puede ver precios
  const canSeePrices = isAuthenticated;
  // TODO: cuando se requiera validación manual, leer session.clienteAprobado desde el JWT
  const clienteAprobado = isAuthenticated;

  return (
    <AuthContext.Provider value={{ session, isAuthenticated, clientType, canSeePrices, clienteAprobado }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
