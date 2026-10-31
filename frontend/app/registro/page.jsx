'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, 
  RefreshCw, KeyRound, Eye, EyeOff 
} from 'lucide-react';
import { Button, Input, Card, CardContent, Alert, PhoneInput, Badge } from '../../components/ui';
import { setSession, API_BASE_URL } from '../../lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  // Registration step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Form fields
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP fields
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // Reference for Auto-Scroll to Error
  const errorRef = useRef(null);

  const scrollToError = () => {
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  useEffect(() => {
    if (error) {
      scrollToError();
    }
  }, [error]);

  const triggerError = (msg) => {
    setError(msg);
    scrollToError();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      triggerError('Las contraseñas no coinciden.');
      return;
    }

    // Política 2 de TI: Mínimo 8 caracteres, mayúsculas, minúsculas, números y carácter especial
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      triggerError('La contraseña no cumple con la Política 2: debe tener al menos 8 caracteres, e incluir mayúsculas, minúsculas, números y al menos un carácter especial.');
      return;
    }

    if (telefono && telefono.trim()) {
      const digitsOnly = telefono.replace(/\D/g, '');
      const isUS = telefono.startsWith('+1');
      const expected = isUS ? 10 : 8;
      const actualDigits = isUS && digitsOnly.startsWith('1') ? digitsOnly.slice(1) : (telefono.startsWith('+505') && digitsOnly.startsWith('505') ? digitsOnly.slice(3) : digitsOnly);
      if (actualDigits.length !== expected) {
        triggerError(`El número de teléfono debe tener exactamente ${expected} dígitos para ${isUS ? 'Estados Unidos (+1)' : 'Nicaragua (+505)'}.`);
        return;
      }
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

      if (data.requiresVerification) {
        setRegisteredEmail(email);
        setStep('otp');
        setOtpSuccessMsg(data.message || 'Hemos enviado un código de 6 dígitos a tu correo electrónico.');
      } else {
        setSession(data.token, data.user);
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('cartUpdated'));
        router.push('/catalogo');
      }
    } catch (err) {
      triggerError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      triggerError('Por favor ingresa el código numérico de 6 dígitos completo.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredEmail,
          otpCode: otpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al verificar el código OTP.');
      }

      setSession(data.token, data.user);
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/catalogo');
    } catch (err) {
      triggerError(err.message || 'Código inválido o expirado.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setOtpSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reenviar código.');
      setOtpSuccessMsg('¡Nuevo código enviado! Revisa tu bandeja de entrada.');
    } catch (err) {
      triggerError(err.message);
    } finally {
      setIsResending(false);
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
            {step === 'form' ? 'Crear Cuenta de Cliente' : 'Verificación de Correo'}
          </h1>
          <p className="font-inter text-xs text-slate-500 mt-1">
            {step === 'form' 
              ? 'Regístrate para comprar en USA y retirar en nuestras ventanillas oficiales'
              : 'Seguridad Transaccional Resend: activa tu cuenta con el código OTP'}
          </p>
        </div>

        <Card hover={false} className="p-2 sm:p-4 overflow-visible relative">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div ref={errorRef} className="scroll-mt-6">
              {error && (
                <Alert type="error" title="No se pudo continuar">
                  {error}
                </Alert>
              )}
            </div>

            {otpSuccessMsg && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-inter flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {step === 'form' ? (
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

                <PhoneInput
                  label="Teléfono / WhatsApp"
                  value={telefono}
                  onChange={(val) => setTelefono(val)}
                  helperText="Selecciona Nicaragua (+505) o USA (+1) para avisos y notificaciones de llegada."
                />

                <div>
                  <Input
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9, @#*)"
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
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-inter">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                    <span>Política 2: Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolo.</span>
                  </div>
                </div>

                <Input
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none flex items-center justify-center"
                      title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  }
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
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-600 font-inter leading-relaxed">
                    Hemos enviado un código numérico de <strong>6 dígitos</strong> a: <br />
                    <span className="font-semibold text-slate-900">{registeredEmail}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-center text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
                    Código de Seguridad (OTP)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 px-4 text-center text-2xl font-mono font-extrabold tracking-[0.5em] text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-center text-slate-400 font-inter">
                    Válido durante 15 minutos. Revisa tu carpeta de spam si no lo ves.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isVerifying}
                  className="w-full"
                  icon={CheckCircle2}
                >
                  Verificar y Activar Cuenta
                </Button>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-primary-blue font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>Reenviar código</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('form'); setError(''); }}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    Volver al formulario
                  </button>
                </div>
              </form>
            )}

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
