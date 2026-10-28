'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { setSession, API_BASE_URL } from '../../lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') || '/' : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setSession(data.token, data.user);
      window.dispatchEvent(new Event('cartUpdated'));

      if (redirectPath && redirectPath !== '/') {
        router.push(redirectPath);
      } else if (data.user.rol === 'Admin') {
        router.push('/panel/usuarios');
      } else if (data.user.rol === 'Logística') {
        router.push('/panel/logistica');
      } else if (data.user.rol === 'Vendedor') {
        router.push('/panel/inventario');
      } else {
        router.push('/catalogo');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-white p-2 shadow-soft-md border border-slate-100 mb-4 items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-montserrat font-extrabold text-2xl text-slate-900">
          Iniciar Sesión
        </h1>
        <p className="font-inter text-xs text-slate-500 mt-1">
          Accede a tu cuenta de NicaLogistics y gestiona tus envíos Sede a Sede
        </p>
      </div>

      <Card hover={false} className="p-2 sm:p-4">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {error && (
            <Alert type="error" title="No se pudo iniciar sesión">
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              icon={Mail}
              placeholder="ejemplo@nicalogistics.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Ingresar a la Plataforma
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="font-inter text-xs text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="font-semibold text-primary-blue hover:underline">
                Regístrate como Cliente
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Roles Quick Picker for Testing Acceptance Criteria */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-primary-blue" />
          <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-700">
            Credenciales Rápidas de Prueba
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDemoCredentials('admin@nicalogistics.com', 'Admin123*!')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <strong className="block text-primary-blue">Administrador</strong>
            <span className="text-[10px] text-slate-500">admin@nicalogistics.com</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('vendedor@nicalogistics.com', 'Vendedor123*!')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-300 transition-colors"
          >
            <strong className="block text-accent-magenta">Vendedor</strong>
            <span className="text-[10px] text-slate-500">vendedor@nicalogistics.com</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('logistica@nicalogistics.com', 'Logistica123*!')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors"
          >
            <strong className="block text-alert-amber">Logística</strong>
            <span className="text-[10px] text-slate-500">logistica@nicalogistics.com</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('cliente@gmail.com', 'Cliente123*!')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <strong className="block text-success-green">Cliente</strong>
            <span className="text-[10px] text-slate-500">cliente@gmail.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-inter">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
