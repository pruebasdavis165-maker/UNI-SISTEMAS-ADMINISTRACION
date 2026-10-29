'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUser, normalizeRole, isInternalRole } from '../lib/auth';

export default function Footer() {
  const pathname = usePathname();
  const auth = useAuth();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const sync = () => setLocalUser(getUser());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('authChanged', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('authChanged', sync);
    };
  }, [pathname]);

  const effectiveUser = auth.user || localUser;
  const effectiveRole = normalizeRole(effectiveUser?.rol);
  const isInternal = isInternalRole(effectiveRole);

  // Supresión 100% total del footer corporativo y bloques comerciales para personal interno o rutas administrativas
  if (isInternal || pathname?.startsWith('/panel') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-50 text-slate-600 font-inter border-t border-slate-200">
      {/* Pre-Footer: Beneficios Sede a Sede */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100/70 flex items-center justify-center text-primary-blue">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-slate-900 text-base">Retiro Seguro en Ventanilla</h4>
              <p className="text-xs text-slate-500">Retiro seguro en ventanilla física oficial.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-100/70 flex items-center justify-center text-accent-magenta">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-slate-900 text-base">Horarios Cómodos</h4>
              <p className="text-xs text-slate-500">Atención de Lunes a Sábado hasta 6:00 PM.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100/70 flex items-center justify-center text-primary-blue">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-slate-900 text-base">Red de Sedes Físicas</h4>
              <p className="text-xs text-slate-500">Sede Miami Hub (USA) y Sede Central Managua (Nicaragua)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Columna 1: Marca y Misión */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-200">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-montserrat font-black text-2xl text-slate-900 tracking-tight">
                Nica<span className="text-primary-blue">Logistics</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Plataforma empresarial de e-commerce y logística internacional bajo la modalidad exclusiva de 
              <strong className="text-slate-800"> entrega Sede a Sede</strong>. Garantizamos seguridad total y trazabilidad en ventanilla.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-accent-magenta font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent-magenta animate-ping"></span>
              <span>Miami Hub ⇄ Managua Operando al 100%</span>
            </div>
          </div>

          {/* Columna 2: Sedes Oficiales Autorizadas */}
          <div className="space-y-3 text-sm">
            <h4 className="font-montserrat font-bold text-slate-900 uppercase tracking-wider text-xs">
              Sedes Oficiales (Retiro Exclusivo)
            </h4>
            <ul className="space-y-2.5">
              <li>
                <strong className="text-slate-800 block text-xs">Sede Miami Hub (USA):</strong>
                <span className="text-xs text-slate-500">8400 NW 25th St, Doral, FL 33198</span>
              </li>
              <li>
                <strong className="text-slate-800 block text-xs">Sede Central Managua:</strong>
                <span className="text-xs text-slate-500">Km 4.5 Carretera Norte, Frente a Enabas</span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Enlaces Rápidos */}
          <div className="space-y-3 text-sm">
            <h4 className="font-montserrat font-bold text-slate-900 uppercase tracking-wider text-xs">
              Accesos Directos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo" className="hover:text-primary-blue transition-colors">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link href="/rastreo" className="hover:text-primary-blue transition-colors">
                  Rastreo en Tiempo Real
                </Link>
              </li>
              <li>
                <Link href="/sedes" className="hover:text-primary-blue transition-colors">
                  Directorio de Sedes
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary-blue transition-colors">
                  Acceso a Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Canales de Atención */}
          <div className="space-y-3 text-sm">
            <h4 className="font-montserrat font-bold text-slate-900 uppercase tracking-wider text-xs">
              Canales Oficiales
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-blue" />
                <span>+505 2249-0100 (Managua)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-magenta" />
                <span>+1 (305) 555-0199 (Miami Hub)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-blue" />
                <span>soporte@nicalogistics.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra de Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} NicaLogistics Enterprise. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="text-slate-500 font-medium">Modelo 100% Pickup Oficial en Ventanilla</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
