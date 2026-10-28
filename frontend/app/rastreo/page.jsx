'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Truck, Package, MapPin, CheckCircle2, 
  Clock, Calendar, AlertCircle, ArrowRight, ShieldCheck, 
  Building2, Phone, AlertTriangle, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Button, Input, Card, Badge, Alert } from '../../components/ui';
import { API_BASE_URL } from '../../lib/auth';

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || '';

  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchTracking = async (codeToSearch) => {
    const code = (codeToSearch || trackingCode).trim();
    if (!code) {
      setError('Por favor ingresa un código de tracking válido (ej. NL-2026-XXXXX).');
      return;
    }

    setIsLoading(true);
    setError('');
    setShipment(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/encomiendas/rastreo/${encodeURIComponent(code)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`No encontramos ninguna encomienda con el código "${code}". Verifica el número en tu correo de confirmación.`);
        }
        throw new Error('Error al consultar el servicio de rastreo.');
      }

      const data = await res.json();
      setShipment(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      searchTracking(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/rastreo?code=${encodeURIComponent(trackingCode.trim())}`);
      searchTracking(trackingCode.trim());
    }
  };

  // State progression index (0: REGISTRADA, 1: EN_TRANSITO, 2: LISTA_PARA_RETIRO, 3: ENTREGADA)
  const getStageIndex = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'REGISTRADA': return 0;
      case 'EN_TRANSITO': return 1;
      case 'LISTA_PARA_RETIRO': return 2;
      case 'ENTREGADA': return 3;
      case 'CANCELADA': return -1;
      default: return 0;
    }
  };

  const stages = [
    {
      key: 'REGISTRADA',
      label: 'Registrada en Origen',
      desc: 'Paquete recepcionado y documentado en sede de salida.',
      color: 'bg-primary-blue text-white',
      border: 'border-primary-blue'
    },
    {
      key: 'EN_TRANSITO',
      label: 'En Tránsito Internacional / Local',
      desc: 'Mercancía en traslado logístico hacia la sucursal de destino.',
      color: 'bg-alert-amber text-white',
      border: 'border-alert-amber'
    },
    {
      key: 'LISTA_PARA_RETIRO',
      label: 'Lista para Retiro (Pickup)',
      desc: 'Paquete en ventanilla oficial. Disponible para entrega.',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-600'
    },
    {
      key: 'ENTREGADA',
      label: 'Entregada en Ventanilla',
      desc: 'Retiro completado por el titular con identificación.',
      color: 'bg-slate-800 text-white',
      border: 'border-slate-800'
    }
  ];

  const currentStageIndex = shipment ? getStageIndex(shipment.estado) : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Search Bar Card */}
      <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase tracking-wider">
            Ingresa tu Código de Tracking Oficial
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Ej. NL-2026-DEMO88 o NL-2026-XXXXX"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="text-base font-montserrat font-bold tracking-wide uppercase"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              icon={Truck}
              isLoading={isLoading}
              className="shadow-md"
            >
              Rastrear Encomienda
            </Button>
          </div>

          {/* Quick Demo Suggestions */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-inter">
            <span>¿Quieres probar una demo?</span>
            <button
              type="button"
              onClick={() => {
                setTrackingCode('NL-2026-DEMO88');
                searchTracking('NL-2026-DEMO88');
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-primary-blue font-semibold transition-colors"
            >
              NL-2026-DEMO88 (Demo Inicial)
            </button>
          </div>
        </form>
      </Card>

      {/* Error Message */}
      {error && <Alert type="error" title="No se encontró la encomienda">{error}</Alert>}

      {/* Shipment Results */}
      {shipment && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-900 via-primary-blue to-indigo-900 text-white rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] text-blue-200 uppercase tracking-widest font-semibold font-inter">
                  Código de Rastreo Confirmado
                </span>
                <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-white tracking-wide mt-0.5">
                  {shipment.codigoTracking}
                </h2>
                <p className="text-xs text-blue-100/80 mt-1 font-inter">
                  Orden de Venta: <strong>{shipment.numeroPedido}</strong> • Titular: <strong>{shipment.clienteNombre}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-blue-200 block uppercase font-bold">Estado Logístico</span>
                <span className="inline-block px-3 py-1 bg-white text-primary-blue rounded-full text-xs font-montserrat font-extrabold uppercase mt-1 shadow-md">
                  {shipment.estado.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Sede a Sede Route */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs font-inter">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-blue-200 block mb-1">Origen (Despacho):</span>
                <p className="font-bold text-white text-sm">{shipment.sedeOrigenNombre}</p>
                <p className="text-white/80 mt-0.5">{shipment.sedeOrigenDireccion}</p>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-emerald-400/40">
                <span className="text-emerald-300 font-semibold block mb-1">Destino de Retiro en Ventanilla (Pickup):</span>
                <p className="font-bold text-white text-sm">{shipment.sedeDestinoNombre}</p>
                <p className="text-white/80 mt-0.5">{shipment.sedeDestinoDireccion}</p>
              </div>
            </div>
          </Card>

          {/* Interactive Visual Timeline (RF-10) */}
          <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-montserrat font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Progreso del Traslado "Sede a Sede"
            </h3>

            {/* Stepper Bar */}
            <div className="relative">
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
              <div 
                className="hidden sm:block absolute top-1/2 left-0 h-1 bg-primary-blue -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, currentStageIndex) * 33.33}%` }}
              ></div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                {stages.map((stage, idx) => {
                  const isCompleted = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div 
                      key={stage.key} 
                      className={`p-4 rounded-xl border transition-all text-center ${
                        isCurrent 
                          ? `${stage.border} border-2 bg-slate-50 shadow-md` 
                          : isCompleted 
                            ? 'border-slate-200 bg-white' 
                            : 'border-slate-100 bg-slate-50/40 opacity-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xs ${
                        isCompleted ? stage.color : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <h4 className="font-montserrat font-bold text-xs text-slate-800">
                        {stage.label}
                      </h4>
                      <p className="font-inter text-[11px] text-slate-400 mt-1">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Callout: Ready for Pickup */}
            {shipment.estado === 'LISTA_PARA_RETIRO' && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs font-inter space-y-1">
                  <p className="font-bold font-montserrat text-sm text-emerald-950">
                    ¡Tu encomienda está lista para retiro en ventanilla!
                  </p>
                  <p>
                    Puedes presentarte en <strong>{shipment.sedeDestinoNombre}</strong> ({shipment.sedeDestinoDireccion}) con tu cédula de identidad y el código <strong>{shipment.codigoTracking}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Special Callout: Delivered */}
            {shipment.estado === 'ENTREGADA' && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs font-inter space-y-1">
                  <p className="font-bold font-montserrat text-sm text-slate-900">
                    Encomienda entregada al cliente
                  </p>
                  <p>
                    Entregado el: {shipment.fechaEntrega ? new Date(shipment.fechaEntrega).toLocaleString() : 'Fecha registrada'}
                    {shipment.empleadoEntregaNombre ? ` • Atendido por: ${shipment.empleadoEntregaNombre}` : ''}.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Historical Movement Logs (RF-10) */}
          <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-montserrat font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Bitácora Detallada de Movimientos
            </h3>

            <div className="space-y-4">
              {shipment.historial?.map((log, index) => (
                <div key={log.id} className="flex items-start gap-3 text-xs font-inter">
                  <div className="w-2 h-2 rounded-full bg-primary-blue mt-1.5 shrink-0"></div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-montserrat">
                        {log.estado.replace('_', ' ')}
                      </span>
                      {log.ubicacionSede && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary-blue text-[10px] font-semibold">
                          {log.ubicacionSede}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{log.comentario}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(log.fecha).toLocaleString()}
                      {log.registradoPor ? ` • Operador: ${log.registradoPor}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}

export default function RastreoPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="blue" size="md">Portal de Rastreo Satelital Sede a Sede</Badge>
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Seguimiento de Encomiendas en Tiempo Real
          </h1>
          <p className="font-inter text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
            Consulta el estado de tu paquete entre las sedes de Miami Hub, Managua, León y Estelí. Retiro seguro en ventanilla oficial.
          </p>
        </div>

        {/* Suspense Boundary required for useSearchParams */}
        <Suspense fallback={
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-blue mb-2" />
            <p className="text-sm font-inter">Cargando buscador de tracking...</p>
          </div>
        }>
          <TrackingContent />
        </Suspense>

      </div>
    </div>
  );
}
