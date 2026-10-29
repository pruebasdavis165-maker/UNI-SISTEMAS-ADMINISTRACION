'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Package, AlertTriangle, ArrowDownRight, ArrowUpRight, 
  RotateCcw, Search, Filter, PlusCircle, History, RefreshCw, 
  CheckCircle2, AlertOctagon, TrendingDown 
} from 'lucide-react';
import { 
  Button, Input, Select, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Alert, Toast 
} from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'kardex' | 'alertas'
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Movement Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [moveType, setMoveType] = useState('ENTRADA');
  const [moveQuantity, setMoveQuantity] = useState('1');
  const [moveReason, setMoveReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resProd, resMovs, resAlerts] = await Promise.all([
        fetch(`${API_BASE_URL}/api/inventario`, { headers }),
        fetch(`${API_BASE_URL}/api/inventario/movimientos`, { headers }),
        fetch(`${API_BASE_URL}/api/inventario/alertas`, { headers })
      ]);

      if (!resProd.ok) throw new Error('Error al cargar inventario general.');
      const dataProd = await resProd.json();
      setProducts(dataProd);

      if (resMovs.ok) {
        const dataMovs = await resMovs.json();
        setMovements(dataMovs);
      }

      if (resAlerts.ok) {
        const dataAlerts = await resAlerts.json();
        setAlerts(dataAlerts);
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servicio de inventario.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/inventario/movimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productoId: selectedProduct.id,
          tipoMovimiento: moveType,
          cantidad: parseInt(moveQuantity),
          motivo: moveReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar movimiento.');

      setSuccessMsg(`Movimiento de ${moveType} (${data.cantidad} unid.) registrado correctamente.`);
      setIsMoveModalOpen(false);
      setMoveReason('');
      setMoveQuantity('1');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMoveModal = (product) => {
    setSelectedProduct(product);
    setMoveType('ENTRADA');
    setMoveQuantity('1');
    setMoveReason('');
    setIsMoveModalOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigoSku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor', 'Logística']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
              Inventario y Alertas de Stock
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Supervisión en tiempo real de existencias en bodega, registro de movimientos y detección de quiebres de stock.
            </p>
          </div>

          <Button variant="outline" icon={RefreshCw} onClick={fetchData} isLoading={isLoading}>
            Actualizar Datos
          </Button>
        </div>

        {/* 4 Cards de Métricas con Colores Corporativos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Total Artículos</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">{products.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">En catálogo oficial</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-primary-blue border border-blue-100">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Existencias Globales</p>
              <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">
                {products.reduce((acc, p) => acc + (p.stockActual || 0), 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Unidades disponibles</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Alertas de Stock</p>
              <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">{alerts.length}</p>
              <p className="text-[11px] text-alert-amber font-semibold mt-0.5">Umbral mínimo o agotado</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-alert-amber border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Kardex Histórico</p>
              <p className="text-2xl font-montserrat font-extrabold text-accent-magenta mt-1">{movements.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Transacciones registradas</p>
            </div>
            <div className="p-3 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-100">
              <History className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ALERTA VISUAL DESTACADA EN ALERT-AMBER */}
        {alerts.length > 0 && (
          <div className="bg-amber-500/10 border-2 border-alert-amber rounded-2xl p-5 shadow-soft-sm">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-alert-amber text-white shrink-0 shadow-md">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-montserrat font-bold text-base text-amber-900">
                  ¡Atención Requerida! {alerts.length} Producto(s) en Umbral Crítico o Agotados
                </h4>
                <p className="font-inter text-xs text-amber-800 leading-relaxed">
                  Los siguientes artículos han alcanzado o descendido del stock mínimo de seguridad. 
                  Genera una orden de reabastecimiento para evitar retrasos en el despacho a ventanilla.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {alerts.map(a => (
                    <div 
                      key={a.productoId}
                      className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-inter font-semibold text-amber-900 shadow-sm"
                    >
                      <span className="font-mono text-primary-blue">{a.codigoSku}</span>
                      <span>{a.nombre}</span>
                      <span className="bg-alert-amber text-white px-2 py-0.5 rounded-md font-bold">
                        {a.stockActual} en stock (Mín: {a.stockMinimo})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Floating Toast (Top Right 10s auto-dismiss) */}
        <Toast
          message={successMsg}
          title="Operación Exitosa"
          type="success"
          duration={10000}
          onClose={() => setSuccessMsg('')}
        />

        {/* Alerts and messages */}
        {error && <Alert type="error" title="Error">{error}</Alert>}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 font-montserrat font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Existencias Generales ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('kardex')}
            className={`pb-3 font-montserrat font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'kardex'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Kardex de Movimientos ({movements.length})
          </button>
        </div>

        {/* TAB 1: STOCK & ALERTS */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar en inventario por nombre o SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-inter focus:outline-none focus:border-primary-blue"
                />
              </div>
            </div>

            <Card hover={false} className="border border-slate-200 overflow-hidden rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-inter text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Producto & SKU</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Stock Actual</th>
                      <th className="px-6 py-4">Stock Mínimo</th>
                      <th className="px-6 py-4">Estado de Alerta</th>
                      <th className="px-6 py-4 text-right">Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map(p => {
                      const isLow = p.stockActual <= p.stockMinimo;
                      return (
                        <tr 
                          key={p.id} 
                          className={`transition-colors ${
                            isLow ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{p.nombre}</div>
                            <span className="text-xs font-mono font-bold text-primary-blue bg-blue-50 px-1.5 py-0.5 rounded">
                              {p.codigoSku}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{p.categoriaNombre}</td>
                          <td className="px-6 py-4 font-montserrat font-extrabold text-base">
                            {p.stockActual} unid.
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                            {p.stockMinimo} unid.
                          </td>
                          <td className="px-6 py-4">
                            {p.stockActual === 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full">
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                                Agotado
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-alert-amber/20 border-2 border-alert-amber px-3 py-1 rounded-full">
                                <AlertTriangle className="w-3.5 h-3.5 text-alert-amber animate-bounce" />
                                Bajo Stock (alert-amber)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                                Abastecido
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="primary"
                              size="sm"
                              icon={PlusCircle}
                              onClick={() => openMoveModal(p)}
                            >
                              Movimiento
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: KARDEX MOVEMENTS */}
        {activeTab === 'kardex' && (
          <Card hover={false} className="border border-slate-200 overflow-hidden rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Fecha & Hora</th>
                    <th className="px-6 py-4">Producto (SKU)</th>
                    <th className="px-6 py-4">Tipo Movimiento</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Stock (Ant ➔ Nuevo)</th>
                    <th className="px-6 py-4">Motivo / Causa</th>
                    <th className="px-6 py-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        No hay movimientos de inventario registrados.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const isEntry = m.tipoMovimiento === 'ENTRADA' || m.tipoMovimiento === 'CANCELACION';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(m.fecha).toLocaleString('es-NI')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{m.productoNombre}</div>
                            <span className="text-[11px] font-mono text-slate-500">{m.codigoSku}</span>
                          </td>
                          <td className="px-6 py-4">
                            {isEntry ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <ArrowDownRight className="w-3.5 h-3.5 text-success-green" />
                                {m.tipoMovimiento}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                <ArrowUpRight className="w-3.5 h-3.5 text-primary-blue" />
                                {m.tipoMovimiento}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-montserrat font-bold">
                            {isEntry ? `+${m.cantidad}` : `-${m.cantidad}`}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                            {m.stockAnterior} ➔ <strong className="text-slate-900">{m.stockNuevo}</strong>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                            {m.motivo || '—'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                            {m.usuarioNombre}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal: Registrar Movimiento con Select Estilizado */}
        <Modal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          title="Registrar Movimiento de Kardex"
          description={`Ajuste de inventario para ${selectedProduct?.nombre} (${selectedProduct?.codigoSku})`}
        >
          <form onSubmit={handleRegisterMovement} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>Stock Actual en Bodega: <strong className="text-slate-900">{selectedProduct?.stockActual} unidades</strong></div>
              <div>Stock Mínimo de Alerta: <strong className="text-alert-amber">{selectedProduct?.stockMinimo} unidades</strong></div>
            </div>

            <Select
              label="Tipo de Movimiento"
              value={moveType}
              onChange={(e) => setMoveType(e.target.value)}
            >
              <option value="ENTRADA">ENTRADA (Reabastecimiento o recepción desde Miami Hub)</option>
              <option value="SALIDA">SALIDA (Merma, daño o ajuste negativo)</option>
              <option value="AJUSTE">AJUSTE (Conteo físico directo)</option>
            </Select>

            <Input
              label={moveType === 'AJUSTE' ? 'Nuevo Conteo Físico Total' : 'Cantidad a Mover'}
              type="number"
              min="1"
              value={moveQuantity}
              onChange={(e) => setMoveQuantity(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Motivo / Justificación (Obligatorio RF-07)
              </label>
              <textarea
                rows="3"
                placeholder="Ej. Ingreso de embarque marítimo contenedor #482 o conteo cíclico"
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Confirmar en Kardex
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
