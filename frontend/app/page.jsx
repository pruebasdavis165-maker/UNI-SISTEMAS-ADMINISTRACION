'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, Search, ShieldCheck, MapPin, ArrowRight, Clock, 
  Plane, Ship, CheckCircle2, ShoppingCart, Sparkles, Building2,
  ChevronRight, Award, Warehouse, ArrowUpRight
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, CustomDropdown } from '../components/ui';

export default function HomePage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');
  const [calcWeight, setCalcWeight] = useState(5);
  const [calcService, setCalcService] = useState('aereo');
  const [calcSede, setCalcSede] = useState('Managua');

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/rastreo?codigo=${encodeURIComponent(trackingCode.trim())}`);
    }
  };

  const calculateEstimate = () => {
    const rate = calcService === 'aereo' ? 4.50 : 1.85;
    return (calcWeight * rate).toFixed(2);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-primary-blue text-xs font-bold font-inter tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent-magenta" />
                <span>COMERCIO BILATERAL & LOGÍSTICA MIAMI ⇄ MANAGUA</span>
              </div>

              <h1 className="font-montserrat font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15]">
                Tus Envíos Miami a Nicaragua con <span className="text-primary-blue">Retiro Seguro en Ventanilla</span>
              </h1>

              <p className="font-inter text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                El sistema comercial y logístico bilateral más seguro de la región. Tus compras y encomiendas viajan protegidas entre nuestras <strong>bóvedas de seguridad en Managua y Miami Hub</strong> para retiro personal en ventanilla oficial.
              </p>

              {/* Interactive Tracking Widget */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-lg max-w-xl">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-grow">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ej. NL-2026-DEMO88 (Tracking)"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 font-inter text-sm"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" icon={Package} className="shrink-0">
                    Rastrear Encomienda
                  </Button>
                </form>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-inter">
                  <span>Prueba con la guía de demo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingCode('NL-2026-DEMO88');
                      router.push('/rastreo?codigo=NL-2026-DEMO88');
                    }}
                    className="font-semibold text-primary-blue hover:underline"
                  >
                    NL-2026-DEMO88
                  </button>
                </div>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-semibold font-inter">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-green" />
                  <span>Entrega contra Cédula de Identidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-green" />
                  <span>Bóvedas con Monitoreo 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-green" />
                  <span>Casillero en Miami Gratuito</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Diagram Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-900">
                      Ruta Sede a Sede Activa
                    </span>
                  </div>
                  <Badge variant="blue" size="sm">Aéreo & Marítimo</Badge>
                </div>

                {/* Sede Origen */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-blue text-white shadow-soft-sm">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary-blue tracking-wider">Sede Origen</span>
                    <h4 className="font-montserrat font-bold text-sm text-slate-900">Miami Hub Central (Doral, FL)</h4>
                    <p className="text-xs text-slate-500">Recepción, pesaje y despacho aduanal</p>
                  </div>
                </div>

                {/* En Tránsito Indicator */}
                <div className="flex justify-center -my-3">
                  <div className="bg-primary-blue text-white px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-2 shadow-soft-sm">
                    <Plane className="w-3.5 h-3.5 text-accent-magenta animate-pulse" />
                    <span>Tránsito Internacional Consolidado</span>
                  </div>
                </div>

                {/* Sede Destino */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-success-green text-white shadow-soft-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Sede Destino (Pickup)</span>
                    <h4 className="font-montserrat font-bold text-sm text-slate-900">Sede Central Managua (Nicaragua)</h4>
                    <p className="text-xs text-slate-500">Retiro seguro en ventanilla física</p>
                  </div>
                </div>

                {/* Live Tracking Status Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-inter space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Estado Actual:</span>
                    <strong className="text-success-green font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success-green inline-block"></span>
                      Listo para Retiro en Ventanilla
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-400">Disponible para retiro físico inmediato en ventanilla oficial.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA EL MODELO SEDE A SEDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1A56DB] text-xs font-bold uppercase tracking-wider font-inter border border-blue-100 mb-3">
            <span>Flujo Logístico 100% Controlado</span>
          </div>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-800 mt-1 mb-3">
            ¿Cómo Funciona el Envío Sede a Sede?
          </h2>
          <p className="font-inter text-slate-600 text-sm sm:text-base leading-relaxed">
            Diseñado para erradicar las direcciones confusas de Nicaragua y los repartidores extraviados. 
            Tus encomiendas van directamente de nuestra sede en EE.UU. a la ventanilla oficial de tu ciudad.
          </p>
        </div>

        {/* Stepper Container con Línea de Progreso Conectora Unificada */}
        <div className="relative">
          {/* Línea horizontal continua en Desktop que pasa por detrás de los indicadores */}
          <div className="hidden md:block absolute top-11 left-16 right-16 h-0.5 border-t-2 border-dashed border-slate-300 z-0 pointer-events-none" />

          {/* Línea vertical continua en Móvil a la izquierda */}
          <div className="md:hidden absolute top-8 bottom-8 left-11 w-0.5 border-l-2 border-dashed border-slate-300 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {/* Step 1: Miami Hub */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <Warehouse className="w-6 h-6" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1A56DB] text-white flex items-center justify-center font-montserrat font-extrabold text-sm shadow-md ring-4 ring-white shrink-0">
                  01
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat font-bold text-base text-slate-800 group-hover:text-[#1A56DB] transition-colors">
                  Recibimos en Miami
                </h3>
                <p className="font-inter text-sm text-slate-500 leading-relaxed">
                  Envías tus compras a nuestro almacén en Doral, FL con tu código de casillero NicaLogistics.
                </p>
              </div>
            </div>

            {/* Step 2: Transporte y Aduana */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-fuchsia-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-[#D946EF] flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <Plane className="w-6 h-6" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#D946EF] text-white flex items-center justify-center font-montserrat font-extrabold text-sm shadow-md ring-4 ring-white shrink-0">
                  02
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat font-bold text-base text-slate-800 group-hover:text-[#D946EF] transition-colors">
                  Transporte y Aduana
                </h3>
                <p className="font-inter text-sm text-slate-500 leading-relaxed">
                  Despacho en vuelos regulares (Martes y Viernes) y gestión de aforo y trámites aduanales DGA.
                </p>
              </div>
            </div>

            {/* Step 3: Distribución a Sede */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-amber-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-montserrat font-extrabold text-sm shadow-md ring-4 ring-white shrink-0">
                  03
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat font-bold text-base text-slate-800 group-hover:text-[#F59E0B] transition-colors">
                  Distribución a Sede
                </h3>
                <p className="font-inter text-sm text-slate-500 leading-relaxed">
                  El paquete se transfiere de inmediato a la ventanilla oficial seleccionada en Managua o Miami Hub.
                </p>
              </div>
            </div>

            {/* Step 4: Retiro en Ventanilla */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-emerald-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-montserrat font-extrabold text-sm shadow-md ring-4 ring-white shrink-0">
                  04
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat font-bold text-base text-slate-800 group-hover:text-[#10B981] transition-colors">
                  Retiro en Ventanilla
                </h3>
                <p className="font-inter text-sm text-slate-500 leading-relaxed">
                  Presentas tu Cédula física o código de guía y retiras sin filas ni sorpresas de cobro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CALCULADORA DE FLETE INTERNACIONAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-slate-800 shadow-xl border border-slate-200 relative overflow-hidden">
          {/* Subtle Corporate Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent-magenta/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary-blue text-xs font-semibold tracking-wide">
                <Plane className="w-3.5 h-3.5 text-accent-magenta" />
                Tarifas Oficiales Sin Cargos Ocultos
              </span>
              <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Calculadora de Flete Miami ⇄ Managua
              </h2>
              <p className="font-inter text-sm text-slate-600 leading-relaxed max-w-xl">
                Cotiza el transporte de tus paquetes entre Florida y Nicaragua. El costo incluye recepción, 
                tránsito internacional seguro y resguardo en ventanilla oficial hasta por 15 días.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div>
                  <CustomDropdown
                    label="Modalidad de Envío"
                    value={calcService}
                    onChange={(val) => setCalcService(val)}
                    options={[
                      { value: 'aereo', label: 'Aéreo Exprés ($4.50/lb)' },
                      { value: 'maritimo', label: 'Marítimo Carga ($1.85/lb)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5 font-montserrat">
                    Peso Estimado (Libras)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl py-2.5 px-3.5 border border-slate-200 text-xs font-inter font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Sede de Retiro"
                    value={calcSede}
                    onChange={(val) => setCalcSede(val)}
                    options={[
                      { value: 'Managua', label: 'Sede Central Managua (Nicaragua)' },
                      { value: 'Miami', label: 'Sede Miami Hub (Estados Unidos)' }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-gradient-to-b from-blue-50/70 via-white to-slate-50 rounded-2xl p-6 border border-blue-100 text-center space-y-4 shadow-md">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-600 font-inter">
                  <Building2 className="w-3.5 h-3.5 text-primary-blue" />
                  Costo de Retiro en {calcSede}
                </div>
                <div className="font-montserrat font-extrabold text-4xl sm:text-5xl text-accent-magenta tracking-tight">
                  ${calculateEstimate()} <span className="text-base text-slate-500 font-normal">USD</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600 space-y-1">
                  <p className="font-medium text-slate-800">
                    {calcService === 'aereo' ? 'Tiempo estimado: 3 a 5 días hábiles' : 'Tiempo marítimo: 12 a 15 días'}
                  </p>
                  <p className="text-[11px] text-slate-500">Retiro exclusivo en ventanilla oficial con documento de identidad</p>
                </div>
                <Link href="/catalogo" className="block pt-1">
                  <button 
                    type="button" 
                    className="w-full py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-primary-blue to-blue-700 hover:from-primary-blue hover:to-accent-magenta shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Explorar Catálogo con Flete</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PREVIEW DE CATÁLOGO DISPONIBLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-2">
              Productos Destacados Miami ⇄ Nicaragua
            </h2>
            <p className="font-inter text-sm text-slate-500">
              Gastronomía típica, rosquillas y café de altura nicaragüense para envío a EE.UU., y tecnología selecta para retiro en Managua.
            </p>
          </div>
          <Link href="/catalogo">
            <Button variant="outline" icon={ArrowRight}>
              Ver Todo el Catálogo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1: Café Especial de Nicaragua */}
          <Card className="flex flex-col justify-between overflow-hidden group hover:border-primary-blue/40 hover:shadow-soft-md transition-all">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80" 
                alt="Café Especial Dipilto"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-primary-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-montserrat shadow-xs">
                Nicaragua ➔ USA
              </span>
              <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-inter shadow-xs">
                50 en stock
              </span>
            </div>
            <CardContent className="p-4 space-y-1.5 flex-grow">
              <span className="text-[11px] font-semibold text-primary-blue uppercase font-inter tracking-wider">
                Café de Especialidad
              </span>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-primary-blue transition-colors">
                Café de Altura Dipilto (Grano 1 lb)
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Café arábica de estricta altura (SHG) con notas achocolatadas de Nueva Segovia.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $14.50 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Ordenar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 2: Rosquillas Somoteñas */}
          <Card className="flex flex-col justify-between overflow-hidden group hover:border-primary-blue/40 hover:shadow-soft-md transition-all">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" 
                alt="Rosquillas Somoteñas"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-primary-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-montserrat shadow-xs">
                Nicaragua ➔ USA
              </span>
              <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-inter shadow-xs">
                40 en stock
              </span>
            </div>
            <CardContent className="p-4 space-y-1.5 flex-grow">
              <span className="text-[11px] font-semibold text-accent-magenta uppercase font-inter tracking-wider">
                Gastronomía Típica
              </span>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-primary-blue transition-colors">
                Rosquillas Somoteñas (Bolsa 500g)
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Auténticas rosquillas de maíz tostado y queso artesanal crujiente de Somoto.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $12.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Ordenar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 3: Hamaca de Masaya */}
          <Card className="flex flex-col justify-between overflow-hidden group hover:border-primary-blue/40 hover:shadow-soft-md transition-all">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" 
                alt="Hamaca de Masaya"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-primary-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-montserrat shadow-xs">
                Nicaragua ➔ USA
              </span>
              <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-inter shadow-xs">
                10 en stock
              </span>
            </div>
            <CardContent className="p-4 space-y-1.5 flex-grow">
              <span className="text-[11px] font-semibold text-alert-amber uppercase font-inter tracking-wider">
                Artesanías Masaya
              </span>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-primary-blue transition-colors">
                Hamaca Matrimonial de Cedro
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Tejida a mano en algodón de alta resistencia con travesaños de madera fina.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $65.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Ordenar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 4: MacBook Air USA */}
          <Card className="flex flex-col justify-between overflow-hidden group hover:border-primary-blue/40 hover:shadow-soft-md transition-all">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" 
                alt="MacBook Air M3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-montserrat shadow-xs">
                USA ➔ Nicaragua
              </span>
              <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-inter shadow-xs">
                8 en stock
              </span>
            </div>
            <CardContent className="p-4 space-y-1.5 flex-grow">
              <span className="text-[11px] font-semibold text-primary-blue uppercase font-inter tracking-wider">
                Tecnología Importada
              </span>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-primary-blue transition-colors">
                MacBook Air 15" M3 - 16GB RAM
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Chip Apple M3, Liquid Retina y hasta 18h de batería. Despacho desde Miami Hub.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $1,299.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Ordenar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. DIRECTORIO OFICIAL DE SEDES (SEDE A SEDE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          
          <h2 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-2">
            Red de Sedes Oficiales de Retiro
          </h2>
          <p className="font-inter text-slate-500 text-sm">
            Todas nuestras ubicaciones cuentan con personal calificado, cámaras de seguridad y ventanillas climatizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Miami */}
          <div className="bg-white rounded-2xl p-6 border-2 border-primary-blue/30 shadow-soft-sm hover:shadow-soft-md transition-all">
            <span className="text-xs font-bold font-montserrat text-primary-blue uppercase tracking-wider block mb-1">
              Sede Oficial EE.UU. (Ventanilla & Hub)
            </span>
            <h3 className="font-montserrat font-bold text-xl text-slate-900">Sede Miami Hub (Estados Unidos)</h3>
            <p className="text-xs text-slate-600 mt-2 font-inter leading-relaxed">
              8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p><strong>Tel:</strong> +1 (305) 555-0199</p>
              <p><strong>Horario:</strong> Lun - Vie: 8:00 AM - 5:00 PM</p>
              <p className="text-primary-blue font-semibold mt-1">Flujo: Recepción / Despacho USA ⇄ Nicaragua</p>
            </div>
          </div>

          {/* Managua */}
          <div className="bg-white rounded-2xl p-6 border-2 border-accent-magenta/30 shadow-soft-sm hover:shadow-soft-md transition-all">
            <span className="text-xs font-bold font-montserrat text-accent-magenta uppercase tracking-wider block mb-1">
              Sede Oficial Nicaragua (Ventanilla Principal)
            </span>
            <h3 className="font-montserrat font-bold text-xl text-slate-900">Sede Central Managua (Nicaragua)</h3>
            <p className="text-xs text-slate-600 mt-2 font-inter leading-relaxed">
              Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p><strong>Tel:</strong> +505 2249-0100</p>
              <p><strong>Horario:</strong> Lun - Sáb: 8:00 AM - 6:00 PM</p>
              <p className="text-accent-magenta font-semibold mt-1">Flujo: Retiro en Ventanilla / Envíos a Miami</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white rounded-3xl p-8 sm:p-12 text-slate-900 text-center space-y-6 shadow-soft-xl border border-blue-100 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-blue/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-900">
              ¿Listo para ordenar y retirar en tu ventanilla oficial?
            </h2>
            <p className="font-inter text-slate-600 text-sm sm:text-base">
              Abre tu cuenta gratis hoy mismo para compras y traslados de encomiendas entre Miami Hub y Managua Central.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/registro">
                <Button variant="accent" size="lg" icon={ArrowRight}>
                  Crear Casillero Gratis
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button variant="outline" size="lg" className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50">
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
