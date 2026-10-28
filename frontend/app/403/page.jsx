'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-lg text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-alert-amber mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-montserrat uppercase tracking-wider bg-rose-100 text-rose-700 mb-2">
          Código 403: Acceso Denegado
        </span>

        <h1 className="font-montserrat font-extrabold text-2xl text-slate-900 mb-3">
          Permisos Insuficientes
        </h1>

        <p className="font-inter text-sm text-slate-600 mb-8 leading-relaxed">
          Tu cuenta actual no posee el rol requerido para consultar este recurso o panel administrativo.
          Si eres empleado, contacta a soporte o al Administrador para actualizar tu perfil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" icon={Home} className="w-full">
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" icon={Lock} className="w-full">
              Cambiar de Cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
