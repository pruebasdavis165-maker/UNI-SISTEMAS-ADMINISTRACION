'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, 
  Package, ShieldCheck, MapPin, AlertCircle, ArrowLeft,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, ConfirmModal } from '../../components/ui';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from '../../lib/cart';
import { getUser, clearSession, isInternalRole } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stockNotice, setStockNotice] = useState('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const refreshCart = () => {
    const items = getCart();
    setCartItems(items);
    setIsLoaded(true);
  };

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser && (isInternalRole(currentUser.rol) || (currentUser.rolId && currentUser.rolId !== 4))) {
      alert('Los roles administrativos o internos no pueden realizar compras de clientes.');
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChanged'));
      }
      router.push('/login');
      return;
    }
    refreshCart();

    const handleStorage = () => refreshCart();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cartUpdated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cartUpdated', handleStorage);
    };
  }, []);

  const handleQuantityChange = (item, newQty) => {
    if (newQty > item.stockActual) {
      setStockNotice(`El stock máximo disponible para ${item.nombre} es de ${item.stockActual} unidades.`);
      setTimeout(() => setStockNotice(''), 4000);
      return;
    }
    if (newQty < 1) return;
    setStockNotice('');
    updateCartItemQuantity(item.id, newQty, item.stockActual);
    refreshCart();
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    refreshCart();
  };

  const handleClear = () => {
    setIsClearConfirmOpen(true);
  };

  const executeClearCart = () => {
    setIsClearConfirmOpen(false);
    clearCart();
    refreshCart();
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + ((item.pesoLibras || 1.0) * item.quantity), 0);

  const handleProceedToCheckout = (e) => {
    const currentUser = getUser();
    if (currentUser && (isInternalRole(currentUser.rol) || (currentUser.rolId && currentUser.rolId !== 4))) {
      e.preventDefault();
      alert('Los roles administrativos o internos no pueden realizar compras de clientes.');
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChanged'));
      }
      router.push('/login');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">E-commerce Logístico</Badge>
              <span className="text-xs text-slate-400 font-inter">Venta con Retiro en Sucursal</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1 flex items-center gap-2.5">
              <ShoppingCart className="w-8 h-8 text-primary-blue" />
              Tu Carrito de Compras
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Verifica las cantidades antes de seleccionar tu sede de retiro en ventanilla.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/catalogo">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Continuar Comprando
              </Button>
            </Link>
            {cartItems.length > 0 && (
              <Button variant="secondary" size="sm" icon={Trash2} onClick={handleClear}>
                Vaciar Carrito
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Stock Warning Notice */}
        {stockNotice && (
          <Alert type="warning" title="Límite de Stock (RF-05)">
            {stockNotice}
          </Alert>
        )}

        {/* Content Body */}
        {!isLoaded ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-sm font-inter">Cargando tu carrito...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="font-montserrat font-extrabold text-xl text-slate-900">
              Tu carrito está vacío
            </h2>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Explora nuestro catálogo con equipos tecnológicos y suministros disponibles para retiro en ventanilla en sedes autorizadas.
            </p>
            <div className="mt-6">
              <Link href="/catalogo">
                <Button variant="primary" icon={Package}>
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Products List (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const isMax = item.quantity >= item.stockActual;

                return (
                  <Card 
                    key={item.id} 
                    className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                        {item.imagenUrl ? (
                          <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">
                            SKU: {item.sku && item.sku !== "undefined" ? item.sku : (item.codigoSku || "N/A")}
                          </span>
                          {item.categoriaNombre && (
                            <Badge variant="blue" size="sm">{item.categoriaNombre}</Badge>
                          )}
                        </div>
                        <h3 className="font-montserrat font-bold text-base text-slate-800">
                          {item.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-inter">
                          <MapPin className="w-3.5 h-3.5 text-accent-magenta" />
                          <span>Retiro en Ventanilla Sede</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">Stock: {item.stockActual} disp.</span>
                          <span>•</span>
                          <span className="text-primary-blue font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Peso: {((item.pesoLibras || 1.0) * item.quantity).toFixed(1)} lbs ({(item.pesoLibras || 1.0).toFixed(1)} lb/u)</span>
                        </div>
                      </div>

                      {/* Quantity Controls with Strict Stock Enforcing */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            title="Disminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1 font-montserrat font-bold text-sm text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            disabled={isMax}
                            className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            title={isMax ? 'Stock máximo alcanzado' : 'Aumentar'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="text-right">
                          <div className="font-montserrat font-extrabold text-base text-slate-900">
                            ${(item.precio * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-inter">
                            ${item.precio.toFixed(2)} c/u
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {isMax && (
                      <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 font-inter">
                        <AlertTriangle className="w-3.5 h-3.5 text-alert-amber shrink-0" />
                        <span>Has alcanzado el límite máximo en existencia ({item.stockActual} unidades disponibles).</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Order Summary & Sede Policy (Right 1 col) */}
            <div className="space-y-6">
              
              {/* Order Summary Card */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="font-montserrat font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3">
                  Resumen de la Orden
                </h3>

                <div className="space-y-3 font-inter text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Productos seleccionados</span>
                    <span className="font-semibold text-slate-900">{totalItemsCount} unid.</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Peso total estimado</span>
                    <span className="font-semibold text-primary-blue">{totalWeight.toFixed(1)} lbs</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal de mercancía</span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 items-center">
                    <span className="flex items-center gap-1">
                      Pickup Local (Misma Sede)
                      <Badge variant="green" size="sm">GRATIS</Badge>
                    </span>
                    <span className="font-semibold text-emerald-600">$0.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="font-montserrat font-bold text-base text-slate-900 block">Total a Pagar</span>
                    <span className="text-[11px] text-slate-400 font-inter">Precios en dólares estadounidenses</span>
                  </div>
                  <span className="font-montserrat font-extrabold text-2xl text-primary-blue">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <Link href="/checkout" onClick={handleProceedToCheckout} className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center shadow-lg font-montserrat font-bold tracking-wide"
                  >
                    <span>Proceder al Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>

              {/* Sede a Sede Policy Card */}
              <Card className="p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-primary-blue font-montserrat font-bold text-sm">
                  <MapPin className="w-4 h-4 text-accent-magenta" />
                  <span>Retiro Oficial en Ventanilla</span>
                </div>
                <p className="text-xs text-slate-600 font-inter leading-relaxed">
                  En el siguiente paso deberás seleccionar la <strong>Sede de Origen</strong> y la <strong>Sede de Destino</strong> donde retirarás tus artículos presentando tu identificación oficial.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Garantía de entrega protegida y sin cargos ocultos.</span>
                </div>
              </Card>

            </div>

          </div>
        )}

        {/* Modal de Confirmación Corporativo */}
        <ConfirmModal
          isOpen={isClearConfirmOpen}
          onClose={() => setIsClearConfirmOpen(false)}
          onConfirm={executeClearCart}
          title="¿Vaciar Carrito de Compras?"
          message="¿Estás seguro de que deseas eliminar todos los productos seleccionados? Esta acción reiniciará tu lista de compra actual."
          confirmText="Sí, Vaciar Carrito"
          variant="danger"
        />

      </div>
    </div>
  );
}
