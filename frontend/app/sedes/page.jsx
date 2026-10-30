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
          setSedes(data && data.length > 0 ? data : officialSedes);
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

      {/* 2. Listado Oficial de Sedes Dinámico */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-inter text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-blue mb-2" />
            <p>Cargando red de sedes oficiales...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sedes.map((sede) => {
              const isUSA = sede.pais?.toLowerCase().includes('estados unidos') || sede.codigo?.includes('MIA');
              const isCentral = sede.codigo?.includes('MGA');

              return (
                <Card 
                  key={sede.id || sede.codigo} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:border-primary-blue/40 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-montserrat ${
                          isUSA ? 'text-primary-blue' : isCentral ? 'text-accent-magenta' : 'text-emerald-700'
                        }`}>
                          {isUSA ? 'Sede Oficial EE.UU.' : isCentral ? 'Sede Central Nicaragua' : 'Sede Regional'} • {sede.codigo}
                        </span>
                        <h2 className="font-montserrat font-extrabold text-xl text-slate-900 mt-1">
                          {sede.nombre}
                        </h2>
                        <p className="text-xs text-slate-500 font-inter mt-0.5">
                          {sede.ciudad}, {sede.pais}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUSA 
                          ? 'bg-purple-50 text-accent-magenta border-purple-100' 
                          : isCentral 
                            ? 'bg-blue-50 text-primary-blue border-blue-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isUSA ? <Globe className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 font-inter text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900 font-semibold text-[11px]">Dirección de Ventanilla:</strong>
                          <span className="text-slate-600 leading-snug">{sede.direccionVentanilla}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-accent-magenta shrink-0" />
                        <span className="text-slate-600">{sede.telefonoContacto || 'Contacto en ventanilla'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-600">{sede.horarioAtencion || 'Lun - Sáb 8:00 AM - 5:00 PM'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-montserrat font-bold text-[11px] uppercase tracking-wider text-slate-700">
                        Servicios en Ventanilla
                      </h4>
                      <ul className="text-xs text-slate-600 font-inter space-y-1">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Retiro seguro con documento de identidad</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pickup local gratuito ($0.00 flete)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Bóveda con monitoreo 24/7</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-inter">Retiro presencial</span>
                    <Link href="/catalogo">
                      <Button variant="primary" size="sm" icon={ArrowRight}>
                        Ver Catálogo
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

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
