'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  ShoppingBag, Truck, MapPin, ArrowRight, RefreshCw, 
  XCircle, AlertTriangle, CheckCircle2, Calendar, 
  Clock, DollarSign, Package, ShieldCheck
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal, Alert, Input } from '../../components/ui';
import { getToken, API_BASE_URL } from '../../lib/auth';

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/pedidos/mis-pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar tu historial de pedidos.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenCancel = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/pedidos/${selectedOrder.id}/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          motivo: cancelReason || 'Cancelado a solicitud del cliente'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cancelar pedido.');
      }

      setSuccessMsg(`Pedido ${selectedOrder.numeroPedido} cancelado con éxito. Se reingresó el stock al inventario automáticamente (RF-14).`);
      setIsCancelModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const getOrderStatusBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PAGADO':
      case 'COMPLETADO':
        return <Badge variant="green" size="sm">Pagado / Activo</Badge>;
      case 'CANCELADO':
        return <Badge variant="rose" size="sm">Cancelado</Badge>;
      case 'PENDIENTE_PAGO':
        return <Badge variant="amber" size="sm">Pendiente de Pago</Badge>;
      default:
        return <Badge variant="slate" size="sm">{estado}</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Cliente', 'Admin', 'Vendedor', 'Logística']}>
      <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">Gestión de Compras</Badge>
                <span className="text-xs text-slate-400 font-inter">Retiro en Ventanilla (Pickup)</span>
              </div>
              <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1 flex items-center gap-2.5">
                <ShoppingBag className="w-8 h-8 text-primary-blue" />
                Mis Pedidos y Encomiendas
              </h1>
              <p className="font-inter text-xs sm:text-sm text-slate-500">
                Consulta el estado de tus compras, cancelaciones y códigos de seguimiento para retiro en sucursal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOrders} isLoading={isLoading}>
                Actualizar
              </Button>
              <Link href="/catalogo">
                <Button variant="primary" size="sm" icon={Package}>
                  Ir al Catálogo
                </Button>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          {error && <Alert type="error" title="Atención">{error}</Alert>}
          {successMsg && <Alert type="success" title="Operación Exitosa">{successMsg}</Alert>}

          {/* Orders List */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-blue mb-2" />
              <p className="text-sm font-inter">Cargando tus órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <h3 className="font-montserrat font-bold text-lg text-slate-800">No tienes pedidos registrados</h3>
              <p className="text-xs text-slate-500 font-inter mt-1 leading-relaxed">
                Tus compras y pedidos con retiro en sucursal aparecerán aquí con su código de tracking oficial.
              </p>
              <div className="mt-6">
                <Link href="/catalogo">
                  <Button variant="primary" size="sm">
                    Comenzar a Comprar
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const canCancel = order.estado !== 'CANCELADO';

                return (
                  <Card key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-montserrat font-extrabold text-base text-slate-900">
                            {order.numeroPedido}
                          </span>
                          {getOrderStatusBadge(order.estado)}
                        </div>
                        <p className="text-xs text-slate-400 font-inter flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(order.creadoEn).toLocaleDateString()} a las {new Date(order.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>Pago: {order.metodoPago || 'TARJETA'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {order.codigoTracking && (
                          <Link href={`/rastreo?code=${order.codigoTracking}`}>
                            <Button variant="outline" size="sm" icon={Truck}>
                              Rastrear: {order.codigoTracking}
                            </Button>
                          </Link>
                        )}

                        {canCancel && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleOpenCancel(order)}
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Sede a Sede Route */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-inter">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-primary-blue mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Sede de Despacho (Origen)</span>
                            <p className="font-bold text-slate-800">{order.sedeOrigenNombre}</p>
                            <p className="text-slate-500 text-[11px]">{order.sedeOrigenDireccion}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-emerald-700 block font-semibold uppercase text-[10px]">Ventanilla de Retiro (Destino)</span>
                            <p className="font-bold text-slate-800">{order.sedeDestinoNombre}</p>
                            <p className="text-slate-500 text-[11px]">{order.sedeDestinoDireccion}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-4 sm:p-5 divide-y divide-slate-100">
                      {order.items?.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-inter">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {item.imagenUrl ? (
                                <img src={item.imagenUrl} alt={item.productoNombre} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{item.productoNombre}</p>
                              <p className="text-slate-400">SKU: {item.productoSku} • {item.cantidad} unid. x ${item.precioUnitario.toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="font-montserrat font-bold text-sm text-slate-900">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Row */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-inter">
                      <span className="text-slate-500">
                        {order.estado === 'CANCELADO' ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Stock reingresado a inventario por cancelación
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            Listo para retiro en ventanilla presentando cédula
                          </span>
                        )}
                      </span>

                      <div className="text-right">
                        <span className="text-slate-400 mr-2">Total Orden:</span>
                        <span className="font-montserrat font-extrabold text-lg text-primary-blue">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                  </Card>
                );
              })}
            </div>
          )}

          {/* Cancellation Confirmation Modal */}
          <Modal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            title="Confirmar Cancelación de Pedido (RF-14)"
          >
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-inter flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Efectos inmediatos de la cancelación:</p>
                  <p className="mt-1">• Todas las unidades del pedido serán devueltas instantáneamente al stock físico del inventario (Kardex: CANCELACION).</p>
                  <p>• La encomienda logística {selectedOrder?.codigoTracking} cambiará automáticamente a estado "Cancelada".</p>
                  <p>• Se registrará el reembolso financiero de ${selectedOrder?.total.toFixed(2)} USD.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase">
                  Motivo de Cancelación
                </label>
                <Input
                  placeholder="Ej. Cambio de planes en el retiro, error de producto..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
                  No Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmCancel}
                  isLoading={isCancelling}
                  icon={XCircle}
                >
                  Sí, Cancelar Pedido y Reingresar Stock
                </Button>
              </div>
            </div>
          </Modal>

        </div>
      </div>
    </ProtectedRoute>
  );
}
