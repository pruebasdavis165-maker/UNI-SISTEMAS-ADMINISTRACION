'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Truck, Package, MapPin, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, Building2, 
  AlertCircle, RefreshCw 
} from 'lucide-react';
import { Button, Input, Card, Badge, Alert } from '../../../components/ui';
import { API_BASE_URL, getToken } from '../../../lib/auth';

function TrackingInternalContent() {
  const searchParams = useSearchParams();
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
          throw new Error(`No se encontró ninguna encomienda registrada con el código "${code}".`);
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
      searchTracking(trackingCode.trim());
    }
  };

  const getStageIndex = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'REGISTRADA': return 0;
      case 'EN_TRANSITO': return 1;
      case 'LISTA_PARA_RETIRO': return 2;
      case 'ENTREGADA': return 3;
      default: return 0;
    }
  };

  const stages = [
    {
      key: 'REGISTRADA',
      label: 'Registrada en Origen',
      desc: 'Paquete recepcionado y documentado en sede física.',
      color: 'bg-primary-blue text-white',
      border: 'border-primary-blue'
    },
    {
      key: 'EN_TRANSITO',
      label: 'En Tránsito Bilateral',
      desc: 'Traslado seguro en ruta Miami Hub ⇄ Managua.',
      color: 'bg-amber-500 text-white',
      border: 'border-amber-500'
    },
    {
      key: 'LISTA_PARA_RETIRO',
      label: 'Lista para Retiro (Pickup)',
      desc: 'En ventanilla oficial. Titular notificado para entrega.',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-600'
    },
    {
      key: 'ENTREGADA',
      label: 'Entregada en Ventanilla',
      desc: 'Retiro concluido contra documento de identidad.',
      color: 'bg-slate-800 text-white',
      border: 'border-slate-800'
    }
  ];

  const currentStageIndex = shipment ? getStageIndex(shipment.estado) : -1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Interno */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="sm">Trazabilidad Operativa</Badge>
          <span className="text-xs text-slate-500 font-inter">Control de Encomiendas Sede a Sede</span>
        </div>
        <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
          Consulta Global de Rastreo
        </h1>
        <p className="font-inter text-xs sm:text-sm text-slate-500">
          Verificación en tiempo real del estado de paquetes, sedes de custodia y bitácora de movimientos.
        </p>
      </div>

      {/* Formulario de Búsqueda */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase tracking-wider">
            Código de Tracking Oficial
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Ej. NL-2026-DEMO88 o NL-2026-XXXXX"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="text-base font-mono font-bold tracking-wider uppercase"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              icon={Truck}
              isLoading={isLoading}
            >
              Consultar Encomienda
            </Button>
          </div>
        </form>
      </div>

      {error && <Alert type="error" title="No se encontró la encomienda">{error}</Alert>}

      {/* Detalle de Encomienda */}
      {shipment && (
        <div className="space-y-6">
          {/* Card Resumen de Estado */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold font-inter">
                  Tracking Confirmado
                </span>
                <h2 className="font-montserrat font-extrabold text-2xl text-primary-blue tracking-wide mt-0.5">
                  {shipment.codigoTracking}
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-inter">
                  Orden: <strong className="text-slate-800">{shipment.numeroPedido}</strong> • Titular: <strong className="text-slate-800">{shipment.clienteNombre}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado Actual</span>
                <span className="inline-block px-3 py-1 bg-blue-50 text-primary-blue border border-blue-200 rounded-full text-xs font-montserrat font-extrabold uppercase mt-1">
                  {shipment.estado.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Ruta Sede Origen -> Sede Destino */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-inter">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block mb-1 uppercase text-[10px]">Sede de Despacho (Origen):</span>
                <p className="font-bold text-slate-900 text-sm">{shipment.sedeOrigenNombre}</p>
                <p className="text-slate-500 mt-0.5">{shipment.sedeOrigenDireccion}</p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-semibold block mb-1 uppercase text-[10px]">Sede de Retiro (Pickup en Ventanilla):</span>
                <p className="font-bold text-slate-900 text-sm">{shipment.sedeDestinoNombre}</p>
                <p className="text-slate-500 mt-0.5">{shipment.sedeDestinoDireccion}</p>
              </div>
            </div>
          </div>

          {/* Stepper de Progresión */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-montserrat font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Circuito de Trazabilidad Sede a Sede
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {stages.map((stage, idx) => {
                const isCompleted = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div 
                    key={stage.key} 
                    className={`p-4 rounded-xl border transition-all text-center ${
                      isCurrent 
                        ? `${stage.border} border-2 bg-blue-50/50 shadow-2xs` 
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

          {/* Botón de Acceso Operativo para Personal de Logística */}
          <div className="flex justify-end">
            <Link href="/panel/logistica">
              <Button variant="outline" icon={Truck}>
                Ir al Tablero Operativo Kanban
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanelRastreoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Cargando módulo de rastreo...</div>}>
      <TrackingInternalContent />
    </Suspense>
  );
}
