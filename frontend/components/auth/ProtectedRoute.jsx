'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, isTokenExpired, clearSession } from '../../lib/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

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

    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.rol))) {
      router.push('/403');
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue mb-4" />
        <p className="font-inter text-sm text-slate-600 font-medium">Verificando credenciales y permisos...</p>
      </div>
    );
  }

  return authorized ? children : null;
}
