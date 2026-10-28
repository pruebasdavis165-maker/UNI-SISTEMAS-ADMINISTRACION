'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Users, Search, RefreshCw, ShoppingBag, Truck, DollarSign, 
  Calendar, Phone, Mail, CheckCircle2, XCircle, ArrowRight, 
  Eye, Package, MapPin, Clock, ShieldCheck
} from 'lucide-react';
import { 
  Button, Input, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Alert 
} from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function ClientesCRMPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState('pedidos'); // 'pedidos' | 'encomiendas'

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar la cartera de clientes.');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDetail = async (customer) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    setSelectedCustomer(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/clientes/${customer.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo cargar el historial del cliente.');
      const detail = await res.json();
      setSelectedCustomer(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return c.nombreCompleto.toLowerCase().includes(term) ||
           c.email.toLowerCase().includes(term) ||
           (c.telefono && c.telefono.includes(term));
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalGastado || 0), 0);
  const totalOrdersAll = customers.reduce((acc, c) => acc + (c.totalPedidos || 0), 0);
  const totalShipmentsAll = customers.reduce((acc, c) => acc + (c.totalEncomiendas || 0), 0);

  const getOrderStatusBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PAGADO':
      case 'COMPLETADO':
        return <Badge variant="green" size="sm">{estado}</Badge>;
      case 'PENDIENTE':
        return <Badge variant="amber" size="sm">{estado}</Badge>;
      case 'CANCELADO':
        return <Badge variant="rose" size="sm">{estado}</Badge>;
      default:
        return <Badge variant="slate" size="sm">{estado}</Badge>;
    }
  };

  const getTrackingStatusBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ENTREGADA':
        return <Badge variant="green" size="sm">Entregada en Ventanilla</Badge>;
      case 'LISTA_PARA_RETIRO':
        return <Badge variant="green" size="sm">Lista para Retiro</Badge>;
      case 'EN_TRANSITO':
        return <Badge variant="amber" size="sm">En Tránsito a Sede</Badge>;
      case 'REGISTRADA':
      default:
        return <Badge variant="blue" size="sm">Registrada</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="magenta" size="sm">CRM & Fidelización</Badge>
              <span className="text-xs text-slate-400 font-inter">Módulo de Clientes (RF-04)</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Cartera de Clientes
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Consulta perfiles, historial de pedidos e encomiendas con retiro exclusivo en sedes oficiales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchCustomers}
              isLoading={isLoading}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" title="Atención">{error}</Alert>}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Total Clientes</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">{customers.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Usuarios registrados</p>
            </div>
            <div className="p-3 bg-blue-50 text-primary-blue rounded-xl border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Facturación Clientes</p>
              <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">
                ${totalSpentAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Compras confirmadas USD</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Total Compras</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">{totalOrdersAll}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Órdenes procesadas</p>
            </div>
            <div className="p-3 bg-fuchsia-50 text-accent-magenta rounded-xl border border-fuchsia-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Encomiendas</p>
              <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">{totalShipmentsAll}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Retiro en ventanilla</p>
            </div>
            <div className="p-3 bg-amber-50 text-alert-amber rounded-xl border border-amber-100">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter / Search Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-96">
                <Input
                  icon={Search}
                  placeholder="Buscar por cliente, correo o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="text-xs text-slate-500 font-inter self-end md:self-center">
                Mostrando <strong className="text-slate-800">{filteredCustomers.length}</strong> clientes de {customers.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-montserrat">
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-center">Pedidos</th>
                  <th className="py-3 px-4 text-right">Total Gastado</th>
                  <th className="py-3 px-4 text-center">Encomiendas</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-inter">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-primary-blue" />
                        <span>Cargando clientes de NicaLogistics...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No se encontraron clientes registrados</p>
                      <p className="text-xs text-slate-400 mt-1">Los clientes aparecerán automáticamente tras registrarse o completar su primera compra.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{customer.nombreCompleto}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {customer.telefono ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {customer.telefono}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No registrado</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        <span className="px-2 py-0.5 bg-blue-50 text-primary-blue rounded-md text-xs font-bold">
                          {customer.totalPedidos}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-montserrat font-bold text-slate-900">
                        ${customer.totalGastado.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-fuchsia-50 text-accent-magenta rounded-md text-xs font-bold">
                          {customer.totalEncomiendas}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {customer.activo ? (
                          <Badge variant="green" size="sm">Activo</Badge>
                        ) : (
                          <Badge variant="rose" size="sm">Suspendido</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(customer.fechaRegistro).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpenDetail(customer)}
                        >
                          Historial
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Customer Detail & CRM 360 Modal */}
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Historial de Cliente y Envíos"
          size="2xl"
        >
          {isLoadingDetail || !selectedCustomer ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-blue mb-2" />
              <p className="text-sm">Cargando expediente 360 del cliente...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-montserrat font-bold text-lg text-slate-900">
                      {selectedCustomer.nombreCompleto}
                    </h3>
                    {selectedCustomer.activo ? (
                      <Badge variant="green" size="sm">Activo</Badge>
                    ) : (
                      <Badge variant="rose" size="sm">Inactivo</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-inter">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCustomer.email}
                    </span>
                    {selectedCustomer.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedCustomer.telefono}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Cliente desde: {new Date(selectedCustomer.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right bg-white px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gasto Total Acumulado</span>
                  <div className="text-xl font-montserrat font-extrabold text-primary-blue">
                    ${selectedCustomer.totalGastado.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Strict Notice: Sede a Sede */}
              <div className="bg-blue-50/60 border border-blue-200/60 rounded-lg p-3 flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-primary-blue shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 font-inter">
                  <strong>Política Operativa:</strong> Todos los pedidos y encomiendas de este cliente se entregan exclusivamente en ventanilla de sedes oficiales (Pickup). No aplican entregas domiciliarias.
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 flex gap-4">
                <button
                  type="button"
                  onClick={() => setDetailTab('pedidos')}
                  className={`pb-2.5 text-sm font-semibold transition-all relative ${
                    detailTab === 'pedidos'
                      ? 'text-primary-blue border-b-2 border-primary-blue'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Pedidos de Compra ({selectedCustomer.pedidos?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('encomiendas')}
                  className={`pb-2.5 text-sm font-semibold transition-all relative ${
                    detailTab === 'encomiendas'
                      ? 'text-accent-magenta border-b-2 border-accent-magenta'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Encomiendas y Retiros ({selectedCustomer.encomiendas?.length || 0})
                </button>
              </div>

              {/* Tab Contents: Pedidos */}
              {detailTab === 'pedidos' && (
                <div className="space-y-3">
                  {selectedCustomer.pedidos?.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      Este cliente aún no ha generado pedidos en la tienda.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {selectedCustomer.pedidos.map(p => (
                        <div key={p.id} className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-montserrat font-bold text-sm text-slate-900">{p.numeroPedido}</span>
                              {getOrderStatusBadge(p.estado)}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span>{p.sedeOrigen}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold text-slate-700">{p.sedeDestino} (Retiro)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-montserrat font-bold text-base text-slate-900">
                              ${p.total.toFixed(2)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(p.fecha).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Contents: Encomiendas */}
              {detailTab === 'encomiendas' && (
                <div className="space-y-3">
                  {selectedCustomer.encomiendas?.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      No hay encomiendas vinculadas para este cliente.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {selectedCustomer.encomiendas.map(e => (
                        <div key={e.id} className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-montserrat font-bold text-sm text-primary-blue">{e.codigoTracking}</span>
                              {getTrackingStatusBadge(e.estado)}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span>Origen: {e.sedeOrigen}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold text-slate-700">Destino: {e.sedeDestino}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              Registrada: {new Date(e.fechaRegistro).toLocaleDateString()}
                            </div>
                            {e.fechaEntrega && (
                              <div className="text-[11px] text-emerald-600 font-medium">
                                Entregada: {new Date(e.fechaEntrega).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                  Cerrar Expediente
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
