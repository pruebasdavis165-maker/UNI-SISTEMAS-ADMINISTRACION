'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Ship, Truck, Building2, Scale, ArrowRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CustomDropdown } from './ui';
import { API_BASE_URL } from '../lib/auth';

export default function CalculadoraFlete() {
  const [calcWeight, setCalcWeight] = useState(5);
  const [calcService, setCalcService] = useState('AEREO_INT');
  const [calcSede, setCalcSede] = useState('MGA-01');
  const [sedes, setSedes] = useState([]);
  const [formas, setFormas] = useState([]);

  // Carga dinámica de modalidades y sedes desde el Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFormas, resSedes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/envios/formas?activeOnly=true`),
          fetch(`${API_BASE_URL}/api/sedes?activeOnly=true`)
        ]);

        if (resFormas.ok) {
          const dataFormas = await resFormas.json();
          if (dataFormas && dataFormas.length > 0) {
            setFormas(dataFormas);
          }
        }

        if (resSedes.ok) {
          const dataSedes = await resSedes.json();
          if (dataSedes && dataSedes.length > 0) {
            setSedes(dataSedes);
          }
        }
      } catch (err) {
        console.warn('Usando valores de flete locales de respaldo:', err);
      }
    };

    fetchData();
  }, []);

  // Opciones de servicio con fallbacks corporativos
  const serviceOptions = formas.length > 0
    ? formas.map(f => ({
        value: f.codigo,
        label: `${f.nombre} ($${f.tarifaPorLibra.toFixed(2)}/lb • ${f.tiempoEstimado})`,
        description: f.descripcion || `${f.tipoRuta} - Tarifa base $${f.tarifaBase.toFixed(2)} USD`
      }))
    : [
        { 
          value: 'AEREO_INT', 
          label: 'Aéreo Exprés ($4.50/lb • 2-4 días)', 
          description: 'Vuelo exprés prioritario bilateral con despacho rápido y aforo aduanal' 
        },
        { 
          value: 'MARITIMO_INT', 
          label: 'Marítimo Económico ($1.85/lb • 10-15 días)', 
          description: 'Carga marítima consolidada económica para bultos medianos y grandes' 
        },
        { 
          value: 'TERRESTRE_NAC', 
          label: 'Terrestre Nacional ($0.75/lb • 24-48 hrs)', 
          description: 'Transporte terrestre interdepartamental seguro entre sedes de Nicaragua' 
        }
      ];

  // Opciones de sedes de retiro
  const sedeOptions = sedes.length > 0
    ? sedes.map(s => ({
        value: s.codigo,
        label: `${s.nombre} (${s.ciudad}, ${s.pais})`,
        description: s.direccionVentanilla
      }))
    : [
        { 
          value: 'MGA-01', 
          label: 'Sede Central Managua (Nicaragua)', 
          description: 'Km 4.5 Carretera Norte, Frente a Enabas' 
        },
        { 
          value: 'MIA-01', 
          label: 'Sede Miami Hub (Estados Unidos)', 
          description: '8400 NW 25th St, Doral, FL 33198' 
        }
      ];

  // Buscar objeto de modalidad seleccionada
  const selectedForma = formas.find(f => f.codigo === calcService);

  const calculateEstimate = () => {
    const weight = Math.max(1, Number(calcWeight) || 1);

    if (selectedForma) {
      return (selectedForma.tarifaBase + (weight * selectedForma.tarifaPorLibra)).toFixed(2);
    }

    if (calcService === 'TERRESTRE_NAC') {
      return (3.00 + (weight * 0.75)).toFixed(2);
    }
    if (calcService === 'MARITIMO_INT') {
      return (10.00 + (weight * 1.85)).toFixed(2);
    }
    // AEREO_INT
    return (20.00 + (weight * 4.50)).toFixed(2);
  };

  const getEstimatedTime = () => {
    if (selectedForma) return selectedForma.tiempoEstimado;
    if (calcService === 'TERRESTRE_NAC') return '24 a 48 horas hábiles';
    if (calcService === 'MARITIMO_INT') return '10 a 15 días hábiles';
    return '2 a 4 días hábiles (Prioritario)';
  };

  const selectedSedeName = sedeOptions.find(s => s.value === calcSede)?.label.split('(')[0]?.trim() || 'Ventanilla Oficial';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-800 shadow-xl border border-slate-200 relative">
      {/* Decorative corporate ambient background glow - enclosed to prevent overflow clipping */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50/70 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-fuchsia-50/50 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary-blue text-xs font-semibold tracking-wide">
            <Plane className="w-3.5 h-3.5 text-accent-magenta" />
            <span>Tarifario Oficial Dinámico Sin Cargos Ocultos</span>
          </div>

          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Calculadora de Flete Miami ⇄ Managua
          </h2>
          
          <p className="font-inter text-sm text-slate-600 leading-relaxed max-w-xl">
            Cotiza en tiempo real el flete de tus encomiendas y compras. Incluye recepción, 
            pesaje en báscula certificada, tránsito seguro y resguardo en ventanilla oficial.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            
            {/* 1. Modalidad de Envío */}
            <div>
              <CustomDropdown
                label="Modalidad de Envío"
                value={calcService}
                onChange={(val) => setCalcService(val)}
                options={serviceOptions}
                icon={calcService === 'AEREO_INT' ? Plane : calcService === 'MARITIMO_INT' ? Ship : Truck}
              />
            </div>

            {/* 2. Peso en Libras */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5 font-montserrat">
                Peso Estimado (Libras)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 rounded-xl py-2.5 px-3.5 border border-slate-200 text-xs font-inter font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all shadow-xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none font-inter">
                  lbs
                </span>
              </div>
            </div>

            {/* 3. Sede de Retiro */}
            <div>
              <CustomDropdown
                label="Sede de Retiro"
                value={calcSede}
                onChange={(val) => setCalcSede(val)}
                options={sedeOptions}
                icon={Building2}
              />
            </div>

          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-inter">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Retiro en ventanilla con Cédula/ID</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-blue shrink-0" />
              <span>Retiro local (Origen = Destino) siempre $0.00</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-gradient-to-b from-blue-50/70 via-white to-slate-50 rounded-2xl p-6 border border-blue-100 text-center space-y-4 shadow-md">
            
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-600 font-inter">
              <Building2 className="w-3.5 h-3.5 text-primary-blue" />
              <span>Retiro en {selectedSedeName}</span>
            </div>

            <div className="space-y-1">
              <div className="font-montserrat font-extrabold text-4xl sm:text-5xl text-accent-magenta tracking-tight">
                ${calculateEstimate()} <span className="text-base text-slate-500 font-normal">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 font-inter font-medium">
                Tarifa total para {calcWeight} lb{calcWeight > 1 ? 's' : ''} de carga
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 space-y-1 text-left font-inter">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Clock className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                <span>Tiempo de entrega: {getEstimatedTime()}</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-5">
                Retiro presencial y seguro en ventanilla oficial autorizada.
              </p>
            </div>

            <Link href="/catalogo" className="block pt-1">
              <button 
                type="button" 
                className="w-full py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-primary-blue to-blue-700 hover:from-primary-blue hover:to-accent-magenta shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explorar Catálogo con Flete</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
