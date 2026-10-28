'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, Search, ShieldCheck, MapPin, ArrowRight, Clock, 
  Plane, Ship, CheckCircle2, ShoppingCart, Sparkles, Building2,
  ChevronRight, Award, Warehouse, ArrowUpRight
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '../components/ui';

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
                <span>EXCLUSIVO SEDE A SEDE • CERO EXTRAVÍOS EN DOMICILIO</span>
              </div>

              <h1 className="font-montserrat font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15]">
                Tus Envíos Miami a Nicaragua con <span className="text-primary-blue">Retiro Seguro en Ventanilla</span>
              </h1>

              <p className="font-inter text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                El sistema logístico más confiable de la región. Sin entregas a domicilio fallidas ni riesgos en la calle. 
                Tus compras y encomiendas viajan protegidas entre nuestras <strong>bóvedas de seguridad en Managua y Miami Hub</strong> para retiro personal en ventanilla oficial.
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
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md">
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
                  <p className="text-[11px] text-slate-400">Notificación automática por correo al arribar a sede.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA EL MODELO SEDE A SEDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="magenta" size="md">Operación Transparente</Badge>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2 mb-3">
            ¿Cómo Funciona el Envío Sede a Sede?
          </h2>
          <p className="font-inter text-slate-600 text-sm sm:text-base">
            Diseñado para erradicar las direcciones confusas de Nicaragua y los repartidores extraviados. 
            Tus encomiendas van directamente de nuestra sede en EE.UU. a la ventanilla de tu ciudad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm relative group hover:border-primary-blue/50 transition-all">
            <span className="text-4xl font-extrabold text-blue-100 font-montserrat absolute top-4 right-4 group-hover:text-primary-blue/20 transition-colors">
              01
            </span>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary-blue flex items-center justify-center font-bold text-lg mb-4">
              <Warehouse className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat font-bold text-base text-slate-900 mb-2">
              Recibimos en Miami
            </h3>
            <p className="font-inter text-xs text-slate-500 leading-relaxed">
              Envías tus compras a nuestro almacén en Doral, FL con tu código de casillero NicaLogistics.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm relative group hover:border-primary-blue/50 transition-all">
            <span className="text-4xl font-extrabold text-blue-100 font-montserrat absolute top-4 right-4 group-hover:text-primary-blue/20 transition-colors">
              02
            </span>
            <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-accent-magenta flex items-center justify-center font-bold text-lg mb-4">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat font-bold text-base text-slate-900 mb-2">
              Transporte y Aduana
            </h3>
            <p className="font-inter text-xs text-slate-500 leading-relaxed">
              Despacho en vuelos regulares (Martes y Viernes) y gestión de aforo y trámites aduanales DGA.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm relative group hover:border-primary-blue/50 transition-all">
            <span className="text-4xl font-extrabold text-blue-100 font-montserrat absolute top-4 right-4 group-hover:text-primary-blue/20 transition-colors">
              03
            </span>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-alert-amber flex items-center justify-center font-bold text-lg mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat font-bold text-base text-slate-900 mb-2">
              Distribución a Sede
            </h3>
            <p className="font-inter text-xs text-slate-500 leading-relaxed">
              El paquete se transfiere de inmediato a la ventanilla oficial seleccionada (Sede Central Managua o Miami Hub).
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm relative group hover:border-primary-blue/50 transition-all">
            <span className="text-4xl font-extrabold text-blue-100 font-montserrat absolute top-4 right-4 group-hover:text-primary-blue/20 transition-colors">
              04
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-success-green flex items-center justify-center font-bold text-lg mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-montserrat font-bold text-base text-slate-900 mb-2">
              Retiro en Ventanilla
            </h3>
            <p className="font-inter text-xs text-slate-500 leading-relaxed">
              Presentas tu Cédula física o código de guía y retiras sin filas ni sorpresas de cobro.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CALCULADORA DE FLETE EN LÍNEA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-soft-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="green" size="md">Transparencia Total</Badge>
              <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-white">
                Calculadora de Flete Miami ⇄ Sedes Nicaragua
              </h2>
              <p className="font-inter text-sm text-slate-300 leading-relaxed">
                Sin cargos ocultos ni tarifas sorpresa. El precio por libra incluye recepción, transporte 
                internacional y resguardo en bóveda de ventanilla hasta por 15 días calendario.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Modalidad
                  </label>
                  <select 
                    value={calcService}
                    onChange={(e) => setCalcService(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl p-2.5 border border-slate-700 text-sm focus:outline-none focus:border-primary-blue"
                  >
                    <option value="aereo">Aéreo Exprés ($4.50/lb)</option>
                    <option value="maritimo">Marítimo ($1.85/lb)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Peso Estimado (Libras)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 text-white rounded-xl p-2.5 border border-slate-700 text-sm focus:outline-none focus:border-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Sede de Retiro
                  </label>
                  <select 
                    value={calcSede}
                    onChange={(e) => setCalcSede(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl p-2.5 border border-slate-700 text-sm focus:outline-none focus:border-primary-blue"
                  >
                    <option value="Managua">Managua Central</option>
                    <option value="León">León Regional</option>
                    <option value="Estelí">Estelí Regional</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  Costo Estimado de Retiro en {calcSede}
                </span>
                <div className="font-montserrat font-extrabold text-4xl sm:text-5xl text-accent-magenta">
                  ${calculateEstimate()} <span className="text-lg text-white font-normal">USD</span>
                </div>
                <p className="text-xs text-slate-300">
                  {calcService === 'aereo' ? 'Tiempo estimado: 3 a 5 días hábiles' : 'Tiempo estimado: 12 a 15 días'}
                </p>
                <Link href="/catalogo" className="block pt-2">
                  <Button variant="accent" className="w-full">
                    Explorar Catálogo con Flete
                  </Button>
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
            <Badge variant="blue" size="md">E-Commerce Sede a Sede</Badge>
            <h2 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-2">
              Productos Disponibles para Retiro
            </h2>
            <p className="font-inter text-sm text-slate-500">
              Compra directamente tecnología e insumos originales con retiro asegurado en ventanilla.
            </p>
          </div>
          <Link href="/catalogo">
            <Button variant="outline" icon={ArrowRight}>
              Ver Todo el Catálogo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1 */}
          <Card className="flex flex-col justify-between">
            <div className="p-4 bg-slate-100/60 flex items-center justify-center h-48 border-b border-slate-100">
              <Package className="w-20 h-20 text-slate-400 stroke-1" />
            </div>
            <CardContent className="p-5 space-y-2 flex-grow">
              <div className="flex justify-between items-center text-xs">
                <Badge variant="blue" size="sm">Electrónica</Badge>
                <span className="text-emerald-700 font-semibold">12 en stock</span>
              </div>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2">
                MacBook Air 15" M3 - 16GB / 512GB SSD
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Portátil ultraligero con chip Apple M3, Liquid Retina y carga MagSafe.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $1,299.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Comprar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 2 */}
          <Card className="flex flex-col justify-between">
            <div className="p-4 bg-slate-100/60 flex items-center justify-center h-48 border-b border-slate-100">
              <Package className="w-20 h-20 text-slate-400 stroke-1" />
            </div>
            <CardContent className="p-5 space-y-2 flex-grow">
              <div className="flex justify-between items-center text-xs">
                <Badge variant="amber" size="sm">Stock Bajo</Badge>
                <span className="text-alert-amber font-semibold">4 en stock</span>
              </div>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2">
                Lenovo ThinkPad X1 Carbon Gen 11
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Intel Core i7 empresarial, 32GB RAM, 1TB NVMe, chasis de fibra de carbono.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $1,450.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Comprar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 3 */}
          <Card className="flex flex-col justify-between">
            <div className="p-4 bg-slate-100/60 flex items-center justify-center h-48 border-b border-slate-100">
              <Package className="w-20 h-20 text-slate-400 stroke-1" />
            </div>
            <CardContent className="p-5 space-y-2 flex-grow">
              <div className="flex justify-between items-center text-xs">
                <Badge variant="blue" size="sm">Smartphones</Badge>
                <span className="text-emerald-700 font-semibold">8 en stock</span>
              </div>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2">
                iPhone 15 Pro Max 256GB Titanio Natural
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Chip A17 Pro, cámara 48MP teleobjetivo 5x y puerto USB-C de alta velocidad.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $1,199.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Comprar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>

          {/* Item 4 */}
          <Card className="flex flex-col justify-between">
            <div className="p-4 bg-slate-100/60 flex items-center justify-center h-48 border-b border-slate-100">
              <Package className="w-20 h-20 text-slate-400 stroke-1" />
            </div>
            <CardContent className="p-5 space-y-2 flex-grow">
              <div className="flex justify-between items-center text-xs">
                <Badge variant="blue" size="sm">Repuestos</Badge>
                <span className="text-emerald-700 font-semibold">25 en stock</span>
              </div>
              <h4 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2">
                Kit Scanner Automotriz OBD2 Bluetooth
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Herramienta profesional de diagnóstico para lectura de códigos y sensores.
              </p>
              <div className="pt-2 font-montserrat font-extrabold text-xl text-primary-blue">
                $85.00 <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Link href="/catalogo" className="w-full">
                <Button variant="primary" size="sm" icon={ShoppingCart} className="w-full">
                  Comprar en Ventanilla
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. DIRECTORIO OFICIAL DE SEDES (SEDE A SEDE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="green" size="md">Ventanillas Físicas</Badge>
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
        <div className="bg-primary-blue rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-soft-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-white">
              ¿Listo para ordenar y retirar en tu ventanilla más cercana?
            </h2>
            <p className="font-inter text-blue-100 text-sm sm:text-base">
              Abre tu cuenta gratis hoy mismo y experimenta la tranquilidad del modelo Sede a Sede.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/registro">
                <Button variant="accent" size="lg" icon={ArrowRight}>
                  Crear Casillero Gratis
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
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
