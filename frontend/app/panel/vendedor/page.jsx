'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  DollarSign, ShoppingBag, Users, Package, Search, 
  ArrowRight, RefreshCw, CheckCircle2, Clock, 
  TrendingUp, MapPin, AlertCircle, ShoppingCart 
} from 'lucide-react';
import { Button, Input, Select, CustomDropdown, Card, Badge, Alert } from '../../../components/ui';
import { getToken, API_BASE_URL, getUser } from '../../../lib/auth';

export default function PanelVendedorPage() {
  const [orders, setOrders] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getUser();

  const fetchCommercialData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resOrders, resCustomers, resProducts] = await Promise.all([
        fetch(`${API_BASE_URL}/api/pedidos`, { headers }),
        fetch(`${API_BASE_URL}/api/clientes`, { headers }),
        fetch(`${API_BASE_URL}/api/productos`)
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
      }

      if (resCustomers.ok) {
        const dataCust = await resCustomers.json();
        setCustomersCount(dataCust.length || 0);
      }

      if (resProducts.ok) {
        const dataProd = await resProducts.json();
        setProductsCount(dataProd.length || 0);
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con los servicios comerciales.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommercialData();
  }, []);

  // Commercial Metrics Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.estado === 'PENDIENTE' || o.estado === 'PAGADO').length;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      (o.numeroPedido && o.numeroPedido.toLowerCase().includes(search.toLowerCase())) ||
      (o.clienteNombre && o.clienteNombre.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter ? o.estado === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['Vendedor', 'Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Comercial */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-8 h-8 text-accent-magenta" />
              Panel Comercial de Ventas
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Seguimiento de pedidos de clientes, atención comercial en ventanilla y control de catálogo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" icon={RefreshCw} onClick={fetchCommercialData} isLoading={isLoading}>
              Actualizar Datos
            </Button>
          </div>
        </div>

        {error && <Alert type="error" title="Error Comercial">{error}</Alert>}

        {/* 4 Cards de Métricas Comerciales Reales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Ventas Totales */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Ventas Totales</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Volumen transaccionado USD</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-primary-blue border border-blue-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pedidos Pendientes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Pedidos en Proceso</p>
              <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">
                {pendingOrders}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pendientes de despacho</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-alert-amber border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Clientes CRM */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Clientes Atendidos</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">
                {customersCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cartera CRM activa</p>
            </div>
            <div className="p-3 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Catálogo Activo */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Productos Activos</p>
              <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">
                {productsCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Disponibles para venta</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Package className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Tabla de Historial Comercial y Pedidos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 p-6 overflow-visible relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
            <div>
              <h2 className="font-montserrat font-bold text-lg text-slate-900">
                Historial de Pedidos Comerciales
              </h2>
              <p className="text-xs text-slate-500 font-inter">
                Registro de órdenes gestionadas para entrega en ventanilla oficial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              <div className="w-full sm:w-64">
                <Input
                  icon={Search}
                  placeholder="Buscar orden o cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-60 relative z-30">
                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Todos los Estados"
                  className="z-[9999]"
                  options={[
                    { value: '', label: 'Todos los Estados' },
                    { value: 'PAGADO', label: 'PAGADO', description: 'Órdenes confirmadas y cobradas' },
                    { value: 'PENDIENTE', label: 'PENDIENTE', description: 'En espera de pago o verificación' },
                    { value: 'CANCELADO', label: 'CANCELADO', description: 'Transacción anulada' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left font-inter text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nº Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Ruta Sede a Sede</th>
                  <th className="py-3 px-4">Total USD</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Cargando historial comercial...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No se encontraron pedidos comerciales registrados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-primary-blue">
                        {o.numeroPedido}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {o.clienteNombre}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {o.sedeOrigenNombre} ➔ {o.sedeDestinoNombre}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${Number(o.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          o.estado === 'PAGADO' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : o.estado === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(o.fechaCreacion).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
