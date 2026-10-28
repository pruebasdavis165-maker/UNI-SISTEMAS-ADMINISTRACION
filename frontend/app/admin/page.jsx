'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { ShieldCheck } from 'lucide-react';

export default function AdminIndexPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-primary-blue rounded-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-montserrat font-bold text-2xl text-slate-900">
                Panel Exclusivo de Administrador
              </h1>
              <p className="font-inter text-sm text-slate-500">
                Acceso restringido validado por Middleware y JWT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
