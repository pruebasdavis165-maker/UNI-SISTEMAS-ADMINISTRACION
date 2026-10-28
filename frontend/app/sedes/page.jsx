'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, MapPin, Phone, Clock, ArrowRight, ShieldCheck, 
  CheckCircle2, RefreshCw, AlertCircle, Plane, Navigation, Globe
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { API_BASE_URL } from '../../lib/auth';

export default function SedesPage() {
  const [sedes, setSedes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback official sedes strictly defined
  const officialSedes = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      codigo: 'MGA-01',
      nombre: 'Sede Central Managua',
      pais: 'Nicaragua',
      ciudad: 'Managua',
      direccionVentanilla: 'Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)',
      telefonoContacto: '+505 2249-0100',
      horarioAtencion: 'Lun - Sáb: 8:00 AM - 6:00 PM',
      tipo: 'Nacional (Despacho & Retiro)',
      tagline: 'Centro Logístico Principal en Nicaragua'
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      codigo: 'MIA-01',
      nombre: 'Sede Miami Hub',
      pais: 'Estados Unidos',
      ciudad: 'Miami, Florida',
      direccionVentanilla: '8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)',
      telefonoContacto: '+1 (305) 555-0199',
      horarioAtencion: 'Lun - Vie: 8:00 AM - 5:00 PM',
      tipo: 'Internacional (Recepción USA & Retiro)',
      tagline: 'Centro de Consolidación y Envíos a Nicaragua'
    }
  ];

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sedes?activeOnly=true`);
        if (res.ok) {
          const data = await res.json();
          // Filter to strictly official sedes
          const filtered = data.filter(s => s.codigo === 'MGA-01' || s.codigo === 'MIA-01');
          setSedes(filtered.length > 0 ? filtered : officialSedes);
        } else {
          setSedes(officialSedes);
        }
      } catch {
        setSedes(officialSedes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSedes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* 1. Header Luminoso */}
      <div className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary-blue text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-accent-magenta" />
            <span>Red de Sucursales Autorizadas</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
            Directorio de Sedes Oficiales
          </h1>
          <p className="font-inter text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            NicaLogistics opera exclusivamente bajo el modelo de entrega <strong>Sede a Sede</strong>. 
            Todas las compras y traslados de paquetería se realizan de forma directa y segura entre nuestras 
            dos sucursales oficiales con retiro en ventanilla física autorizada.
          </p>
        </div>
      </div>

      {/* 2. Listado Oficial de Sedes (Managua y Miami) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sede 1: Managua */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-primary-blue/40 transition-all">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-magenta font-montserrat">
                    Sede Oficial Nicaragua • Código MGA-01
                  </span>
                  <h2 className="font-montserrat font-extrabold text-2xl text-slate-900 mt-1">
                    Sede Central Managua
                  </h2>
                  <p className="text-xs text-slate-500 font-inter mt-0.5">
                    Centro logístico de recepción, despacho y retiro en Nicaragua.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary-blue flex items-center justify-center shrink-0 border border-blue-100">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 font-inter text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold">Dirección de Ventanilla Oficial:</strong>
                    <span>Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal), Managua</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-accent-magenta shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-semibold mr-1.5">Teléfono:</strong>
                    <span>+505 2249-0100</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-semibold mr-1.5">Horario de Atención:</strong>
                    <span>Lunes a Sábado: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-800">
                  Servicios Disponibles en Ventanilla
                </h4>
                <ul className="text-xs text-slate-600 font-inter space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Retiro de compras en línea importadas de EE.UU.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Recepción y despacho de productos típicos y encomiendas hacia Miami Hub</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bóveda de seguridad climatizada y cámaras 24/7</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-inter">Retiro con Cédula o Pasaporte</span>
              <Link href="/catalogo">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Ver Catálogo
                </Button>
              </Link>
            </div>
          </Card>

          {/* Sede 2: Miami Hub */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-primary-blue/40 transition-all">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-blue font-montserrat">
                    Sede Oficial EE.UU. • Código MIA-01
                  </span>
                  <h2 className="font-montserrat font-extrabold text-2xl text-slate-900 mt-1">
                    Sede Miami Hub
                  </h2>
                  <p className="text-xs text-slate-500 font-inter mt-0.5">
                    Centro de consolidación, recepción y distribución internacional en Florida.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-accent-magenta flex items-center justify-center shrink-0 border border-purple-100">
                  <Globe className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 font-inter text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold">Dirección de Ventanilla Oficial:</strong>
                    <span>8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción), Miami</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-accent-magenta shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-semibold mr-1.5">Teléfono:</strong>
                    <span>+1 (305) 555-0199</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-semibold mr-1.5">Horario de Atención:</strong>
                    <span>Lunes a Viernes: 8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-800">
                  Servicios Disponibles en Ventanilla
                </h4>
                <ul className="text-xs text-slate-600 font-inter space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Recepción de paquetería de tiendas online de Estados Unidos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Retiro de productos tradicionales nicaragüenses despachados desde Managua</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Consolidación de carga aérea y marítima internacional</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-inter">Retiro con ID o Pasaporte Oficial</span>
              <Link href="/rastreo">
                <Button variant="outline" size="sm" icon={ArrowRight}>
                  Rastrear Envío
                </Button>
              </Link>
            </div>
          </Card>

        </div>

        {/* 3. Garantía y Protocolo de Retiro */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue uppercase tracking-wider font-montserrat">
              <ShieldCheck className="w-4 h-4 text-primary-blue" />
              Protocolo Oficial de Ventanilla
            </div>
            <h3 className="font-montserrat font-bold text-xl text-slate-900">
              ¿Qué necesitas para retirar tu paquete en ventanilla?
            </h3>
            <p className="font-inter text-sm text-slate-600 leading-relaxed">
              Para garantizar que nadie más retire tu mercancía, toda entrega se efectúa de manera presencial en ventanilla oficial. 
              Únicamente debes presentar:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-inter text-slate-700">
                <strong className="block text-slate-900 font-semibold mb-1">1. Código de Rastreo o Pedido:</strong>
                <span>Número de guía único generado por el sistema (ej. NL-2026-DEMO88).</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-inter text-slate-700">
                <strong className="block text-slate-900 font-semibold mb-1">2. Documento de Identidad Oficial:</strong>
                <span>Cédula de identidad nicaragüense, pasaporte vigente o licencia oficial de conducir.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
