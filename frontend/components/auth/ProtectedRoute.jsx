'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, isTokenExpired, clearSession, normalizeRole } from '../../lib/auth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || isTokenExpired(token)) {
      clearSession();
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (allowedRoles.length > 0) {
      const userRole = normalizeRole(user?.rol);
      const isAllowed = allowedRoles.some((r) => normalizeRole(r) === userRole);

      if (!isAllowed) {
        router.push('/403');
        return;
      }
    }

    setAuthorized(true);
    setLoading(false);
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue mb-4" />
        <p className="font-inter text-sm text-slate-600 font-medium">
          Verificando credenciales y permisos de acceso...
        </p>
      </div>
    );
  }

  return authorized ? children : null;
}
