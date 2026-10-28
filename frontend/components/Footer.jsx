import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
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
              Sistema Certificado Sede a Sede 2026
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="font-montserrat font-bold text-slate-900 text-xs tracking-wider uppercase mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-primary-blue transition-colors">Inicio</Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-slate-600 hover:text-primary-blue transition-colors">Catálogo de Productos</Link>
              </li>
              <li>
                <Link href="/rastreo" className="text-slate-600 hover:text-primary-blue transition-colors">Rastreo de Guía / Tracking</Link>
              </li>
              <li>
                <Link href="/sedes" className="text-slate-600 hover:text-primary-blue transition-colors">Directorio de Sedes</Link>
              </li>
              <li>
                <Link href="/carrito" className="text-slate-600 hover:text-primary-blue transition-colors">Mi Carrito</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Sedes Principales */}
          <div>
            <h3 className="font-montserrat font-bold text-slate-900 text-xs tracking-wider uppercase mb-4">
              Ventanillas de Retiro
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="border-l-2 border-primary-blue pl-3">
                <strong className="text-slate-900 block font-montserrat">Sede Miami Hub (EE.UU.)</strong>
                8400 NW 25th St, Doral, FL 33198
              </li>
              <li className="border-l-2 border-accent-magenta pl-3">
                <strong className="text-slate-900 block font-montserrat">Sede Central Managua (Nicaragua)</strong>
                Km 4.5 Carretera Norte, Frente Enabas
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-montserrat font-bold text-slate-900 text-xs tracking-wider uppercase mb-4">
              Atención al Cliente
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-primary-blue shrink-0" />
                <span>PBX: +505 2249-0100</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-accent-magenta shrink-0" />
                <span>contacto@nicalogistics.com</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 mt-4">
                <strong className="text-slate-900">Aviso de Entrega:</strong> Recuerda presentar tu documento de identidad en ventanilla para el retiro de encomiendas.
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center md:flex md:justify-between items-center text-xs text-slate-500">
          <p>© 2026 NicaLogistics. Todos los derechos reservados. Arquitectura Hexagonal y Next.js.</p>
          <p className="mt-2 md:mt-0 font-medium text-slate-600">
            Regla de Negocio: Envíos Exclusivos Sede a Sede (Pickup en Ventanilla)
          </p>
        </div>
      </div>
    </footer>
  );
}
