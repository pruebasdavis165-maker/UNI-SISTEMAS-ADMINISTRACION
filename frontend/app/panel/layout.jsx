'use client';

import React, { useState } from 'react';
import InternalSidebar from '../../components/InternalSidebar';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { Menu } from 'lucide-react';

export default function PanelLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor', 'Logística']}>
      <div className="flex min-h-screen bg-slate-50 font-inter">
        {/* Sidebar Fijo Izquierdo (w-72) */}
        <InternalSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Área de Contenido Principal a la Derecha (md:ml-72) */}
        <div className="flex-1 md:ml-72 min-w-0 flex flex-col min-h-screen">
          {/* Barra superior mínima exclusiva para dispositivos móviles */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
              <span className="font-montserrat font-bold text-base text-slate-900">
                Nica<span className="text-primary-blue">Logistics</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {/* Canvas de Contenido */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
