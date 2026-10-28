'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, MapPin, CreditCard, Building2, 
  ArrowRight, CheckCircle2, AlertTriangle, Package, 
  Clock, Phone, ArrowLeft, RefreshCw, Truck, Lock
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, Input } from '../../components/ui';
import { getCart, clearCart } from '../../lib/cart';
import { getToken, getUser, API_BASE_URL } from '../../lib/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [sedeOrigenId, setSedeOrigenId] = useState('');
  const [sedeDestinoId, setSedeDestinoId] = useState('');
  const [metodoPago, setMetodoPago] = useState('TARJETA');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [isLoadingSedes, setIsLoadingSedes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [user, setUser] = useState(null);

  // Load auth, cart & sedes
  useEffect(() => {
    const currentUser = getUser();
    const token = getToken();

    if (!token || !currentUser) {
      router.push('/login?redirect=/checkout');
      return;
    }
    setUser(currentUser);
    setCardHolder(currentUser.nombreCompleto || '');

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

        // Preselección recomendada: Origen Miami Hub (o primera sede), Destino Managua
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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Strict Sede a Sede Validation
    if (!sedeOrigenId || !sedeDestinoId) {
      setError('Debes seleccionar obligatoriamente una Sede de Origen y una Sede de Destino.');
      return;
    }

    if (sedeOrigenId === sedeDestinoId) {
      setError('La Sede de Origen y la Sede de Destino no pueden ser iguales. La mercancía debe viajar entre dos sucursales oficiales.');
      return;
    }

    if (metodoPago === 'TARJETA') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError('Por favor completa todos los datos de tu tarjeta bancaria.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const payload = {
        sedeOrigenId,
        sedeDestinoId,
        metodoPago,
        referenciaTransaccion: metodoPago === 'TARJETA' 
          ? `VISA-${cardNumber.slice(-4)}-${Date.now()}` 
          : `DEP-${Date.now()}`,
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

      // Success: Clear cart and show confirmation screen
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

  // Success Confirmation Screen
  if (orderResult) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <Badge variant="green" size="md">¡Pedido Pagado y Confirmado Exitosamente!</Badge>
            <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-slate-900">
              Orden #{orderResult.numeroPedido}
            </h1>
            <p className="font-inter text-slate-500 text-sm max-w-md mx-auto">
              Tu pedido ha sido procesado de forma atómica y se ha generado la encomienda para traslado entre sedes.
            </p>
          </div>

          {/* Tracking Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold font-inter">Código de Rastreo Oficial</span>
                <div className="text-2xl sm:text-3xl font-montserrat font-extrabold text-accent-magenta tracking-wide mt-0.5">
                  {orderResult.codigoTracking || 'NL-2026-GENERADO'}
                </div>
              </div>
              <Badge variant="blue" size="md">Estado: Registrada</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block mb-1">Sede Origen (Despacho):</span>
                <p className="font-bold text-white text-sm">{orderResult.sedeOrigenNombre}</p>
                <p className="text-slate-300 mt-0.5">{orderResult.sedeOrigenDireccion}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-emerald-400/30">
                <span className="text-emerald-400 font-semibold block mb-1">Sede de Retiro Final (Pickup):</span>
                <p className="font-bold text-white text-sm">{orderResult.sedeDestinoNombre}</p>
                <p className="text-slate-300 mt-0.5">{orderResult.sedeDestinoDireccion}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-blue-100">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Presenta tu cédula o pasaporte en ventanilla para retirar.</span>
              </div>
              <Link href={`/rastreo?code=${orderResult.codigoTracking}`}>
                <Button variant="magenta" size="sm" icon={Truck}>
                  Rastrear Encomienda
                </Button>
              </Link>
            </div>
          </Card>

          {/* Items Summary Card */}
          <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-montserrat font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
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

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-montserrat font-bold text-base text-slate-900">Total Facturado</span>
              <span className="font-montserrat font-extrabold text-2xl text-primary-blue">
                ${orderResult.total.toFixed(2)}
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
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Checkout Seguro</Badge>
              <span className="text-xs text-slate-400 font-inter">Comercio Bilateral Miami ⇄ Managua</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Confirmación de Pedido y Retiro
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Selecciona tus sedes oficiales para el traslado y retiro en ventanilla.
            </p>
          </div>

          <Link href="/carrito">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Volver al Carrito
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" title="Error en el Checkout">{error}</Alert>}

        {/* Form Grid */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Selectors (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Branch Selectors (STRICT SEDE A SEDE - NO HOME ADDRESSES) */}
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary-blue flex items-center justify-center font-montserrat font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-lg text-slate-900">
                      Ruta Logística Oficial (Miami Hub ⇄ Sede Central Managua)
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Selecciona las sucursales oficiales de origen y retiro en ventanilla.
                    </p>
                  </div>
                </div>
                <Badge variant="magenta" size="sm">Pickup en Ventanilla</Badge>
              </div>

              {/* Strict Notice: No Home Deliveries */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-inter flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-alert-amber shrink-0 mt-0.5" />
                <span>
                  <strong>Política Operativa Estricta:</strong> NicaLogistics no realiza envíos a domicilio particulares. Toda compra debe ser retirada en ventanilla presentando tu documento de identidad.
                </span>
              </div>

              {isLoadingSedes ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-blue mb-2" />
                  <p className="text-xs">Cargando sedes oficiales...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sede Origen */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase tracking-wider">
                      Sede de Origen (Despacho) *
                    </label>
                    <select
                      value={sedeOrigenId}
                      onChange={(e) => setSedeOrigenId(e.target.value)}
                      className="w-full text-sm font-inter py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      required
                    >
                      <option value="">-- Seleccionar Sede Origen --</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.ciudad}, {s.pais})
                        </option>
                      ))}
                    </select>

                    {selectedSedeOrigen && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-inter space-y-1">
                        <p className="font-semibold text-slate-800">{selectedSedeOrigen.direccionVentanilla}</p>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedSedeOrigen.horarioAtencion || 'Lun - Vie 8:00 AM - 5:00 PM'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sede Destino */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase tracking-wider">
                      Sede de Destino (Retiro Cliente) *
                    </label>
                    <select
                      value={sedeDestinoId}
                      onChange={(e) => setSedeDestinoId(e.target.value)}
                      className="w-full text-sm font-inter py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      required
                    >
                      <option value="">-- Seleccionar Sede de Retiro --</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.id === sedeOrigenId}>
                          {s.nombre} ({s.ciudad}, {s.pais}) {s.id === sedeOrigenId ? '(Origen actual)' : ''}
                        </option>
                      ))}
                    </select>

                    {selectedSedeDestino && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-inter space-y-1">
                        <p className="font-semibold text-emerald-950">Ventanilla de Retiro: {selectedSedeDestino.direccionVentanilla}</p>
                        <p className="text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedSedeDestino.horarioAtencion || 'Lun - Sáb 8:00 AM - 5:00 PM'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-50 text-accent-magenta flex items-center justify-center font-montserrat font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-lg text-slate-900">
                      Método de Pago Seguro
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Transacciones cifradas con registro atómico de pago (RF-11).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SSL 256-bit</span>
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
                  <CreditCard className="w-5 h-5 mb-2" />
                  <p className="font-montserrat font-bold text-xs">Tarjeta de Crédito / Débito</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard</p>
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
                  <Building2 className="w-5 h-5 mb-2" />
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
                  <MapPin className="w-5 h-5 mb-2" />
                  <p className="font-montserrat font-bold text-xs">Pago en Ventanilla</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Efectivo al retirar</p>
                </button>
              </div>

              {/* Card Inputs */}
              {metodoPago === 'TARJETA' && (
                <div className="space-y-4 pt-2">
                  <Input
                    label="Nombre en la Tarjeta"
                    placeholder="Ej. Juan Pérez"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />

                  <Input
                    label="Número de Tarjeta"
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiración (MM/AA)"
                      placeholder="12/28"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                    <Input
                      label="Código de Seguridad (CVV)"
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                    />
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
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Flete Pickup Ventanilla</span>
                  <span>GRATIS ($0.00)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="font-montserrat font-bold text-base text-slate-900 block">Total a Pagar</span>
                  <span className="text-[10px] text-slate-400 font-inter">Dólares Estadounidenses (USD)</span>
                </div>
                <span className="font-montserrat font-extrabold text-2xl text-primary-blue">
                  ${subtotal.toFixed(2)}
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
