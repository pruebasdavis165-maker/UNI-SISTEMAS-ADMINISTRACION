'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, MapPin, CreditCard, Building2, 
  ArrowRight, CheckCircle2, AlertTriangle, Package, 
  Clock, Phone, ArrowLeft, RefreshCw, Truck, Lock, Ship, Plane, Scale, Copy, Check
} from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, Input, CustomDropdown, PhoneInput } from '../../components/ui';
import { getCart, clearCart } from '../../lib/cart';
import { calculateShippingCost } from '../../lib/shipping';
import { getToken, getUser, API_BASE_URL, clearSession, isInternalRole } from '../../lib/auth';

function CheckoutContent() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [sedeOrigenId, setSedeOrigenId] = useState('');
  const [sedeDestinoId, setSedeDestinoId] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [metodoPago, setMetodoPago] = useState('TARJETA');
  const [cardHolder, setCardHolder] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');

  const [isLoadingSedes, setIsLoadingSedes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [user, setUser] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load auth, cart & sedes
  useEffect(() => {
    const currentUser = getUser();
    const token = getToken();

    if (!token || !currentUser) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Bloqueo de Checkout para roles administrativos/internos
    if (isInternalRole(currentUser.rol) || (currentUser.rolId && currentUser.rolId !== 4)) {
      alert('Los roles administrativos o internos no pueden realizar compras de clientes.');
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChanged'));
      }
      router.push('/login');
      return;
    }

    setUser(currentUser);
    setCardHolder(currentUser.nombreCompleto || '');
    setContactoTelefono(currentUser.telefono || '');

    const items = getCart();
    if (!items || items.length === 0) {
      router.push('/catalogo');
      return;
    }
    setCartItems(items);

    const fetchSedes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sedes?activeOnly=true`);
        if (!res.ok) throw new Error('Error al cargar las sedes de entrega.');
        const data = await res.json();
        setSedes(data);

        // Preselección: Origen Miami Hub, Destino Managua Central
        const miami = data.find(s => s.codigo.includes('MIA') || s.ciudad.toLowerCase().includes('miami')) || data[0];
        const managua = data.find(s => s.codigo.includes('MGA') || s.ciudad.toLowerCase().includes('managua')) || data[1] || data[0];

        if (miami) setSedeOrigenId(miami.id);
        if (managua && managua.id !== miami?.id) setSedeDestinoId(managua.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingSedes(false);
      }
    };

    fetchSedes();
  }, [router]);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + ((item.pesoLibras || 1.0) * item.quantity), 0);

  useEffect(() => {
    if (!sedeOrigenId || !sedeDestinoId) return;

    const fetchQuote = async () => {
      setIsLoadingShipping(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/envios/cotizar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sedeOrigenId,
            sedeDestinoId,
            pesoTotalLibras: totalWeight
          })
        });
        if (res.ok) {
          const options = await res.json();
          setShippingOptions(options);
          if (options.length > 0) {
            setSelectedShippingOption(options[0]);
          }
        }
      } catch (err) {
        console.error('Error al cotizar envío:', err);
      } finally {
        setIsLoadingShipping(false);
      }
    };

    fetchQuote();
  }, [sedeOrigenId, sedeDestinoId, totalWeight]);

  const shippingCost = selectedShippingOption?.costo || 0;
  const finalTotal = subtotal + shippingCost;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    const currentUser = getUser();
    if (isInternalRole(currentUser?.rol) || (currentUser?.rolId && currentUser.rolId !== 4)) {
      alert('Los roles administrativos o internos no pueden realizar compras de clientes.');
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChanged'));
      }
      router.push('/login');
      return;
    }

    // Strict Sede a Sede Validation
    if (!sedeOrigenId || !sedeDestinoId) {
      setError('Debes seleccionar obligatoriamente una Sede de Origen y una Sede de Destino.');
      return;
    }

    if (!contactoTelefono || !contactoTelefono.trim()) {
      setError('Debes ingresar un número telefónico de contacto para recibir las alertas y el código de retiro.');
      return;
    }

    const digitsOnly = contactoTelefono.replace(/\D/g, '');
    const isUS = contactoTelefono.startsWith('+1');
    const expected = isUS ? 10 : 8;
    const actualDigits = isUS && digitsOnly.startsWith('1') ? digitsOnly.slice(1) : (contactoTelefono.startsWith('+505') && digitsOnly.startsWith('505') ? digitsOnly.slice(3) : digitsOnly);
    if (actualDigits.length !== expected) {
      setError(`El número de teléfono de contacto debe tener exactamente ${expected} dígitos para ${isUS ? 'Estados Unidos (+1)' : 'Nicaragua (+505)'}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      let transactionReference = `DEP-${Date.now()}`;

      // Procesamiento atómico con Stripe Sandbox cuando el método es TARJETA
      if (metodoPago === 'TARJETA') {
        if (!stripe || !elements) {
          throw new Error('La pasarela de pagos Stripe se está inicializando. Por favor intenta de nuevo en unos segundos.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('No se encontró el formulario seguro de tarjeta bancaria.');
        }

        // 1. Solicitar PaymentIntent al backend
        const intentRes = await fetch(`${API_BASE_URL}/api/pagos/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            monto: finalTotal,
            descripcion: `Orden de compra Sede a Sede - ${user?.nombreCompleto || 'Cliente'}`,
            items: cartItems.map(item => ({
              productoId: item.id,
              cantidad: item.quantity
            }))
          })
        });

        const intentData = await intentRes.json();
        if (!intentRes.ok) {
          throw new Error(intentData.message || 'Error al iniciar la pasarela de pagos.');
        }

        // 2. Confirmar el pago en Stripe con la tarjeta de crédito
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolder || user?.nombreCompleto || 'Cliente NicaLogistics',
              email: user?.email
            }
          }
        });

        if (stripeError) {
          throw new Error(stripeError.message || 'El pago fue rechazado por la pasarela de pagos.');
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error(`La transacción no fue autorizada (Estado: ${paymentIntent.status}).`);
        }

        transactionReference = paymentIntent.id;
      }

      // 3. Registrar el pedido atómico en el backend
      const payload = {
        sedeOrigenId,
        sedeDestinoId,
        metodoPago,
        referenciaTransaccion: transactionReference,
        modalidadEnvio: selectedShippingOption?.modalidad || 'Terrestre Estándar',
        costoEnvio: shippingCost,
        pesoTotalLibras: totalWeight,
        items: cartItems.map(item => ({
          productoId: item.id,
          cantidad: item.quantity
        }))
      };

      const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar el pedido.');
      }

      // Success: Limpiar carrito y mostrar pantalla de éxito
      clearCart();
      setOrderResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSedeOrigen = sedes.find(s => s.id === sedeOrigenId);
  const selectedSedeDestino = sedes.find(s => s.id === sedeDestinoId);

  // Rediseño de la Pantalla de Éxito y Código de Rastreo Focal
  if (orderResult) {
    const handleCopyCode = () => {
      if (orderResult.codigoTracking) {
        navigator.clipboard.writeText(orderResult.codigoTracking);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 3000);
      }
    };

    return (
      <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <Badge variant="green" size="md">¡Pago Aprobado y Confirmado Exitosamente!</Badge>
            <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-800">
              Orden #{orderResult.numeroPedido}
            </h1>
            <p className="font-inter text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Tu compra ha sido procesada de forma atómica y se ha generado la encomienda para traslado entre sedes oficiales.
            </p>
          </div>

          {/* Focal Point: Tarjeta Luminosa y Corporativa del Código de Rastreo */}
          <div className="p-7 sm:p-10 bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden text-center space-y-6">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1A56DB] text-xs font-bold uppercase tracking-wider font-inter border border-blue-100">
                <Truck className="w-4 h-4 text-[#1A56DB]" />
                <span>Código de Rastreo Oficial NicaLogistics</span>
              </div>
              <p className="text-xs text-slate-500 font-inter max-w-md mx-auto leading-relaxed">
                Guarda este identificador de encomienda. Es obligatorio presentarlo físicamente junto a tu documento en ventanilla.
              </p>
            </div>

            {/* Código Gigante y Llamativo en una sola línea horizontal (Tema Luminoso) */}
            <div className="relative z-10 py-5 px-6 sm:px-8 bg-slate-50 rounded-2xl border border-slate-200/90 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="text-center sm:text-left min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block font-inter">Tracking ID Oficial</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#1A56DB] tracking-tight whitespace-nowrap select-all block mt-0.5">
                  {orderResult.codigoTracking || 'NL-2026-GENERADO'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1A56DB] border border-blue-200 text-xs font-bold font-inter transition-all active:scale-95 shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
                title="Copiar código al portapapeles"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#1A56DB]" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Trazabilidad y Sedes Oficiales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter text-left relative z-10 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold text-[11px]">Sede Origen (Despacho):</span>
                <p className="font-bold text-slate-800 text-sm">{orderResult.sedeOrigenNombre}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{orderResult.sedeOrigenDireccion}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-bold block mb-1 text-[11px]">Sede de Retiro Final (Pickup Oficial):</span>
                <p className="font-bold text-emerald-950 text-sm">{orderResult.sedeDestinoNombre}</p>
                <p className="text-emerald-800 text-[11px] mt-0.5">{orderResult.sedeDestinoDireccion}</p>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 relative z-10">
              <div className="flex items-center gap-2 text-xs text-slate-600 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Presenta tu cédula o pasaporte físico en ventanilla para el retiro oficial.</span>
              </div>
              <Link href={`/rastreo?code=${orderResult.codigoTracking}`}>
                <Button variant="primary" size="md" icon={Truck} className="shadow-md font-montserrat font-bold cursor-pointer">
                  Rastrear Encomienda Ahora
                </Button>
              </Link>
            </div>
          </div>

          {/* Items Summary Card */}
          <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-montserrat font-bold text-base text-slate-800 border-b border-slate-100 pb-2">
              Detalle de Productos Facturados
            </h3>
            <div className="divide-y divide-slate-100">
              {orderResult.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-montserrat font-semibold text-sm text-slate-800">{item.productoNombre}</p>
                    <p className="text-xs text-slate-400 font-inter">SKU: {item.productoSku} • Cant: {item.cantidad}</p>
                  </div>
                  <span className="font-montserrat font-bold text-sm text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 font-inter text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal de Mercancía:</span>
                <span className="font-semibold text-slate-800">
                  ${(orderResult.total - (orderResult.costoEnvio || 0)).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Flete Logístico ({orderResult.modalidadEnvio || 'Terrestre'} • {orderResult.pesoTotalLibras || 0} lbs):
                </span>
                <span className={`font-semibold ${(orderResult.costoEnvio || 0) === 0 ? 'text-emerald-600' : 'text-primary-blue'}`}>
                  {(orderResult.costoEnvio || 0) === 0 ? 'GRATIS ($0.00 USD)' : `+${(orderResult.costoEnvio || 0).toFixed(2)} USD`}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-montserrat font-bold text-base text-slate-900">Total Facturado</span>
              <span className="font-montserrat font-extrabold text-2xl text-primary-blue">
                ${orderResult.total.toFixed(2)} USD
              </span>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Link href="/catalogo">
              <Button variant="outline" icon={ArrowLeft}>
                Volver al Catálogo
              </Button>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-blue mb-1 font-inter">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout Oficial Sede a Sede</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
              Confirmación de Pedido y Retiro
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Selecciona las sucursales oficiales para despacho y retiro presencial en ventanilla.
            </p>
          </div>

          <Link href="/carrito">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Volver al Carrito
            </Button>
          </Link>
        </div>

        {error && (
          <Alert type="error" title="Atención">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (2/3): Branch Selection & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Branch Selection */}
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 overflow-visible relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary-blue flex items-center justify-center font-montserrat font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-lg text-slate-900">
                      Ruta Logística Bilateral (Pickup en Ventanilla)
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Cero envíos a domicilio. Todo flujo opera estrictamente entre sedes autorizadas.
                    </p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">Sede a Sede</Badge>
              </div>

              {isLoadingSedes ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-blue mb-2" />
                  <span>Cargando red de sedes oficiales...</span>
                </div>
              ) : (
                <div className="space-y-5 overflow-visible relative">
                  
                  {/* Sede Origen */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
                      Sede de Origen (Bodega de Despacho) <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      value={sedeOrigenId}
                      onChange={(val) => setSedeOrigenId(val)}
                      options={sedes.map(s => ({
                        value: s.id,
                        label: `${s.nombre} (${s.ciudad}, ${s.pais})`,
                        description: `Ventanilla: ${s.direccionVentanilla}`
                      }))}
                      placeholder="Selecciona Sede de Origen"
                      icon={Building2}
                      required
                    />

                    {selectedSedeOrigen && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-inter space-y-1">
                        <p className="font-semibold text-slate-800">Dirección: {selectedSedeOrigen.direccionVentanilla}</p>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedSedeOrigen.telefonoContacto || 'Contacto directo en ventanilla'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sede Destino */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
                      Sede de Destino (Ventanilla de Retiro Oficial) <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      value={sedeDestinoId}
                      onChange={(val) => setSedeDestinoId(val)}
                      options={sedes.map(s => ({
                        value: s.id,
                        label: `${s.nombre} (${s.ciudad}, ${s.pais})`,
                        description: `Retiro: ${s.direccionVentanilla}`
                      }))}
                      placeholder="Selecciona Sede de Destino"
                      icon={MapPin}
                      required
                    />

                    {selectedSedeDestino && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-inter space-y-1">
                        <p className="font-semibold text-emerald-950">Ventanilla de Retiro: {selectedSedeDestino.direccionVentanilla}</p>
                        <p className="text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedSedeDestino.horarioAtencion || 'Lun - Sáb 8:00 AM - 5:00 PM'}
                        </p>
                      </div>
                    )}

                    {/* Modalidades de Envío Dinámicas según Ruta y Peso */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
                          Modalidad de Envío y Flete Oficial
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Scale className="w-3.5 h-3.5 text-primary-blue" />
                          Peso de Orden: {totalWeight.toFixed(1)} lbs
                        </span>
                      </div>

                      {isLoadingShipping ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto text-primary-blue mb-1" />
                          <span>Calculando tarifas de flete según peso y circuito...</span>
                        </div>
                      ) : shippingOptions.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                          Selecciona la Sede de Origen y Sede de Destino para calcular el flete.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {shippingOptions.map((opt) => {
                            const isSelected = selectedShippingOption?.codigo === opt.codigo;
                            const isAereo = opt.codigo.includes('AEREO');
                            const isMaritimo = opt.codigo.includes('MARITIMO');
                            const isLocal = opt.codigo.includes('LOCAL');

                            return (
                              <div
                                key={opt.codigo}
                                onClick={() => setSelectedShippingOption(opt)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                                  isSelected 
                                    ? 'border-primary-blue bg-blue-50/50 shadow-md ring-2 ring-primary-blue/20' 
                                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      isAereo ? 'bg-sky-100 text-sky-600' : isMaritimo ? 'bg-blue-100 text-primary-blue' : isLocal ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                      {isAereo ? <Plane className="w-4 h-4" /> : isMaritimo ? <Ship className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                      <h4 className="font-montserrat font-bold text-xs text-slate-900 leading-tight">{opt.modalidad}</h4>
                                      <span className="text-[10px] text-slate-400 font-inter flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {opt.tiempoEstimado}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className={`font-montserrat font-extrabold text-sm ${opt.costo === 0 ? 'text-emerald-600' : 'text-primary-blue'}`}>
                                      {opt.costo === 0 ? 'GRATIS' : `${opt.costo.toFixed(2)}`}
                                    </span>
                                    {opt.costo > 0 && <span className="text-[10px] text-slate-400 block">USD</span>}
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 font-inter leading-relaxed line-clamp-2">
                                  {opt.descripcion}
                                </p>
                                {opt.costo > 0 && (
                                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-inter">
                                    <span>Fórmula: ${Number(opt.tarifaBase || (isAereo ? 20 : isMaritimo ? 10 : 3)).toFixed(2)} base + ${Number(opt.tarifaPorLibra || (isAereo ? 4.5 : isMaritimo ? 1.85 : 0.75)).toFixed(2)}/lb</span>
                                    <span className="text-primary-blue font-bold">${opt.costo.toFixed(2)} USD</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </Card>

            {/* Step 2: Contact Details for Pickup */}
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 overflow-visible relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-montserrat font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-lg text-slate-900">
                      Datos de Contacto para Retiro en Ventanilla
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Llegada de paquetería y notificaciones oficiales por WhatsApp o llamada.
                    </p>
                  </div>
                </div>
                <Badge variant="emerald" size="sm">Validación Bilateral</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre de Quien Retira"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ej. Juan Pérez Morales"
                  required
                />
                <PhoneInput
                  label="Teléfono / WhatsApp de Notificación"
                  value={contactoTelefono}
                  onChange={(val) => setContactoTelefono(val)}
                  required
                  helperText="Nicaragua (+505, 8 dígitos) o Estados Unidos (+1, 10 dígitos)."
                />
              </div>
            </Card>

            {/* Step 3: Payment Method */}
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-50 text-accent-magenta flex items-center justify-center font-montserrat font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-lg text-slate-900">
                      Método de Pago Seguro
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Pasarela desacoplada con cobro seguro SSL y registro atómico.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stripe 256-bit</span>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodoPago('TARJETA')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    metodoPago === 'TARJETA'
                      ? 'border-primary-blue bg-blue-50/50 text-primary-blue shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-2 text-primary-blue" />
                  <p className="font-montserrat font-bold text-xs">Tarjeta (Stripe Sandbox)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, Amex</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('TRANSFERENCIA')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    metodoPago === 'TRANSFERENCIA'
                      ? 'border-primary-blue bg-blue-50/50 text-primary-blue shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-2 text-accent-magenta" />
                  <p className="font-montserrat font-bold text-xs">Transferencia Bancaria</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">BAC, Banpro, Lafise</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('VENTANILLA')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    metodoPago === 'VENTANILLA'
                      ? 'border-primary-blue bg-blue-50/50 text-primary-blue shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <MapPin className="w-5 h-5 mb-2 text-amber-500" />
                  <p className="font-montserrat font-bold text-xs">Pago en Ventanilla</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Efectivo al retirar</p>
                </button>
              </div>

              {/* Stripe Card Element */}
              {metodoPago === 'TARJETA' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <Input
                      label="Nombre del Titular"
                      placeholder="Ej. Juan Pérez"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter mb-1.5">
                      Datos de Tarjeta Bancaria (Stripe Sandbox) <span className="text-rose-500">*</span>
                    </label>
                    <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs hover:border-primary-blue focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20 transition-all">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '14px',
                              color: '#0f172a',
                              fontFamily: 'Inter, system-ui, sans-serif',
                              '::placeholder': {
                                color: '#94a3b8',
                              },
                            },
                            invalid: {
                              color: '#ef4444',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-primary-blue font-inter flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Modo Sandbox Activo (Stripe.net):</p>
                      <p className="text-slate-600 mt-0.5">
                        Puedes probar con la tarjeta <span className="font-mono font-bold text-primary-blue">4242 4242 4242 4242</span>, cualquier fecha futura (ej. <span className="font-mono font-bold">12/28</span>) y CVC <span className="font-mono font-bold">123</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === 'TRANSFERENCIA' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-inter space-y-2">
                  <p className="font-bold text-slate-800">Cuentas Bancarias Oficiales NicaLogistics:</p>
                  <p>• BAC Credomatic USD: 362-98471-0</p>
                  <p>• Banco LAFISE USD: 104-58291-3</p>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    Tu encomienda será preparada de inmediato en sede de origen tras la orden.
                  </p>
                </div>
              )}

              {metodoPago === 'VENTANILLA' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-primary-blue font-inter">
                  <p className="font-semibold">Pagarás el total exacto en ventanilla de la sede destino al retirar tu paquete con tu código de tracking.</p>
                </div>
              )}
            </Card>

          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="space-y-6">
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-montserrat font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3">
                Resumen del Pedido
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-xs font-inter">
                    <div>
                      <p className="font-bold text-slate-800">{item.nombre}</p>
                      <p className="text-slate-400">Cant: {item.quantity} x ${item.precio.toFixed(2)}</p>
                    </div>
                    <span className="font-montserrat font-bold text-slate-900">
                      ${(item.precio * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 font-inter text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal de Mercancía</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">
                    Flete ({selectedShippingOption?.modalidad || (sedeOrigenId === sedeDestinoId ? 'Pickup Local' : 'Calculando...')})
                  </span>
                  <span className={`font-semibold shrink-0 ${shippingCost === 0 ? 'text-emerald-600' : 'text-primary-blue'}`}>
                    {shippingCost === 0 ? 'GRATIS ($0.00)' : `+${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Peso acumulado:</span>
                  <span className="font-medium text-slate-600">{totalWeight.toFixed(1)} lbs</span>
                </div>
                {shippingCost > 0 && selectedShippingOption && (
                  <div className="text-[10px] text-slate-500 font-inter bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block">Fórmula de Flete Oficial:</span>
                    <span>${Number(selectedShippingOption.tarifaBase || (selectedShippingOption.codigo?.includes('AEREO') ? 20 : selectedShippingOption.codigo?.includes('MARITIMO') ? 10 : 3)).toFixed(2)} base + {totalWeight.toFixed(1)} lbs × ${Number(selectedShippingOption.tarifaPorLibra || (selectedShippingOption.codigo?.includes('AEREO') ? 4.5 : selectedShippingOption.codigo?.includes('MARITIMO') ? 1.85 : 0.75)).toFixed(2)}/lb = ${shippingCost.toFixed(2)} USD</span>
                  </div>
                )}
                {sedeOrigenId === sedeDestinoId && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Misma Sede: Retiro sin costo de flete.</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="font-montserrat font-bold text-base text-slate-900 block">Total a Pagar</span>
                  <span className="text-[10px] text-slate-400 font-inter">Dólares Estadounidenses (USD)</span>
                </div>
                <span className="font-montserrat font-extrabold text-2xl text-primary-blue">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-lg font-montserrat font-bold tracking-wide"
                isLoading={isSubmitting}
              >
                <span>Confirmar Pedido y Retiro</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 font-inter">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garantía de entrega en sede oficial</span>
              </div>
            </Card>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
