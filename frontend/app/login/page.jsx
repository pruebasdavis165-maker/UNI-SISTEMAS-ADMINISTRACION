'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { API_BASE_URL, normalizeRole } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') || '/' : '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      // Sincronizar contexto y cookies
      login(data.token, data.user);
      window.dispatchEvent(new Event('cartUpdated'));

      const userRole = normalizeRole(data.user?.rol);

      let targetUrl = '/catalogo';
      if (redirectPath && redirectPath !== '/') {
        targetUrl = redirectPath;
      } else if (userRole === 'Admin') {
        targetUrl = '/panel';
      } else if (userRole === 'Logística') {
        targetUrl = '/panel/logistica';
      } else if (userRole === 'Vendedor') {
        targetUrl = '/panel/vendedor';
      }

      // Navegación limpia para garantizar que todas las cookies y cabeceras HTTP se envíen
      window.location.href = targetUrl;
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor de autenticación');
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
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none flex items-center justify-center"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              }
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

      {/* Demo Credentials Box */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/60 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-2 text-slate-700">
          <UserCheck className="w-4 h-4 text-primary-blue" />
          <span className="font-montserrat font-bold text-xs uppercase tracking-wider">
            Accesos Rápidos de Prueba (Demo)
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 font-inter">
          Haz clic en cualquier rol para autocompletar credenciales y probar la plataforma:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDemoCredentials('davismunoz165@gmail.com', 'Admin123*')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-blue hover:bg-blue-50/50 transition-colors text-left flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-slate-900 font-inter">Administrador</span>
            <span className="text-[10px] text-slate-400 font-inter">Full Access</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials('vendedor@nicalogistics.com', 'Vendedor123*')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-blue hover:bg-blue-50/50 transition-colors text-left flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-slate-900 font-inter">Vendedor</span>
            <span className="text-[10px] text-slate-400 font-inter">Catálogo & Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials('logistica@nicalogistics.com', 'Logistica123*')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-blue hover:bg-blue-50/50 transition-colors text-left flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-slate-900 font-inter">Logística</span>
            <span className="text-[10px] text-slate-400 font-inter">Envíos & Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials('cliente@ejemplo.com', 'Cliente123*')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-blue hover:bg-blue-50/50 transition-colors text-left flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-slate-900 font-inter">Cliente</span>
            <span className="text-[10px] text-slate-400 font-inter">Compras & Tracking</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense fallback={<div className="text-sm text-slate-500 font-inter">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
