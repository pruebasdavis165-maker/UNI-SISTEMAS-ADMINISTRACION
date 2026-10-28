'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { setSession, API_BASE_URL } from '../../lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Política 2 de TI: Mínimo 8 caracteres, mayúsculas, minúsculas, números y carácter especial
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('La contraseña no cumple con la Política 2: debe tener al menos 8 caracteres, e incluir mayúsculas, minúsculas, números y al menos un carácter especial.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto,
          email,
          telefono,
          password,
          rolId: 4 // Cliente
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      setSession(data.token, data.user);
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/catalogo');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white p-2 shadow-soft-md border border-slate-100 mb-4 items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-montserrat font-extrabold text-2xl text-slate-900">
            Crear Cuenta de Cliente
          </h1>
          <p className="font-inter text-xs text-slate-500 mt-1">
            Regístrate para comprar en USA y retirar en nuestras ventanillas oficiales
          </p>
        </div>

        <Card hover={false} className="p-2 sm:p-4">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {error && (
              <Alert type="error" title="No se pudo registrar">
                {error}
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nombre Completo"
                icon={User}
                placeholder="Juan Pérez Morales"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />

              <Input
                label="Correo Electrónico"
                type="email"
                icon={Mail}
                placeholder="juan@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Teléfono / WhatsApp"
                type="tel"
                icon={Phone}
                placeholder="+505 8888-9999"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9, @#*)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-inter">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                  <span>Política 2: Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolo.</span>
                </div>
              </div>

              <Input
                label="Confirmar Contraseña"
                type="password"
                icon={Lock}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                <strong>Modelo Sede a Sede:</strong> Al registrarte aceptas retirar tus compras y encomiendas en nuestras sedes oficiales autorizadas (Sede Central Managua y Sede Miami Hub).
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={ArrowRight}
              >
                Crear Mi Cuenta
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="font-inter text-xs text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-semibold text-primary-blue hover:underline">
                  Inicia Sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
