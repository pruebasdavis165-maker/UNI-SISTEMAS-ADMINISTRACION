'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getToken, 
  getUser, 
  setSession, 
  clearSession, 
  isTokenExpired, 
  normalizeRole, 
  isInternalRole,
  parseJwtPayload 
} from '../lib/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isInternal: false,
  isAdmin: false,
  isLogistica: false,
  isVendedor: false,
  isCliente: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshSession: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncAuth = useCallback(() => {
    try {
      const currentToken = getToken();
      const currentUser = getUser();

      if (!currentToken || isTokenExpired(currentToken)) {
        if (currentToken) {
          clearSession();
        }
        setUser(null);
        setToken(null);
      } else {
        setToken(currentToken);
        if (currentUser) {
          setUser({
            ...currentUser,
            rol: normalizeRole(currentUser.rol)
          });
        } else {
          // Extraer usuario desde el JWT si no está en localStorage
          const payload = parseJwtPayload(currentToken);
          if (payload) {
            const role = normalizeRole(payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
            const inferredUser = {
              id: payload.nameid || payload.sub,
              nombreCompleto: payload.unique_name || payload.name || 'Usuario',
              email: payload.email,
              rol: role
            };
            setUser(inferredUser);
          }
        }
      }
    } catch (err) {
      console.error('Error sincronizando sesión en AuthProvider:', err);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncAuth();

    const handleAuthEvent = () => syncAuth();
    window.addEventListener('storage', handleAuthEvent);
    window.addEventListener('authChanged', handleAuthEvent);

    return () => {
      window.removeEventListener('storage', handleAuthEvent);
      window.removeEventListener('authChanged', handleAuthEvent);
    };
  }, [syncAuth]);

  const login = (newToken, newUser) => {
    setSession(newToken, newUser);
    syncAuth();
    window.dispatchEvent(new Event('authChanged'));
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/';
  };

  const role = normalizeRole(user?.rol);
  const isAuthenticated = !!token && !!user;
  const isInternal = isAuthenticated && isInternalRole(role);
  const isAdmin = isAuthenticated && role === 'Admin';
  const isLogistica = isAuthenticated && role === 'Logística';
  const isVendedor = isAuthenticated && role === 'Vendedor';
  const isCliente = isAuthenticated && role === 'Cliente';

  const contextValue = {
    user,
    token,
    role,
    isAuthenticated,
    isInternal,
    isAdmin,
    isLogistica,
    isVendedor,
    isCliente,
    loading,
    login,
    logout,
    refreshSession: syncAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
