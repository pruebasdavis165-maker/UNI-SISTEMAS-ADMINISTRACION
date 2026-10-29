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
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900">
              Cartera de Clientes
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
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
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(customer)}
                          className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-primary-blue hover:border-primary-blue/30 inline-flex items-center justify-center transition-colors shadow-xs"
                          title="Ver Expediente e Historial"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Customer Detail & CRM 360 Modal Rediseñado */}
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Expediente 360 del Cliente"
          description="Historial integral de compras, facturación y trazabilidad de encomiendas Sede a Sede"
          maxWidth="max-w-4xl"
        >
          {isLoadingDetail || !selectedCustomer ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary-blue mb-3" />
              <p className="text-sm font-inter">Cargando expediente 360 del cliente...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card & Financial Metrics */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary-blue font-bold font-montserrat flex items-center justify-center text-sm shadow-xs">
                      {selectedCustomer.nombreCompleto?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-montserrat font-extrabold text-lg text-slate-900">
                          {selectedCustomer.nombreCompleto}
                        </h3>
                        {selectedCustomer.activo ? (
                          <Badge variant="green" size="sm">Activo</Badge>
                        ) : (
                          <Badge variant="rose" size="sm">Suspendido</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-inter">Expediente Oficial CRM</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-inter pt-1">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      {selectedCustomer.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      {selectedCustomer.telefono || 'Sin teléfono registrado'}
                    </span>
                    <span className="flex items-center gap-1.5 col-span-1 sm:col-span-2 text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      Cliente registrado el {new Date(selectedCustomer.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Financial KPI Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-center text-center md:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-inter">
                    Gasto Total Acumulado
                  </span>
                  <div className="text-2xl font-montserrat font-extrabold text-primary-blue mt-1">
                    ${selectedCustomer.totalGastado.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-inter mt-0.5">
                    {selectedCustomer.pedidos?.length || 0} compras • {selectedCustomer.encomiendas?.length || 0} retiros
                  </div>
                </div>
              </div>

              {/* Strict Notice: Sede a Sede */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-blue shrink-0" />
                <p className="text-xs text-slate-700 font-inter leading-relaxed">
                  <strong className="text-slate-900">Circuito Exclusivo Sede a Sede:</strong> Todas las transacciones y encomiendas asociadas a este cliente corresponden a retiro presencial en ventanillas autorizadas.
                </p>
              </div>

              {/* Tabs Elegantes */}
              <div className="flex border-b border-slate-200 gap-3">
                <button
                  type="button"
                  onClick={() => setDetailTab('pedidos')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-montserrat font-bold transition-all flex items-center gap-2 border-b-2 ${
                    detailTab === 'pedidos'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedidos de Compra</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    detailTab === 'pedidos' ? 'bg-blue-100 text-primary-blue' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCustomer.pedidos?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailTab('encomiendas')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-montserrat font-bold transition-all flex items-center gap-2 border-b-2 ${
                    detailTab === 'encomiendas'
                      ? 'border-accent-magenta text-accent-magenta'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Encomiendas y Retiros</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    detailTab === 'encomiendas' ? 'bg-fuchsia-100 text-accent-magenta' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCustomer.encomiendas?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab Contents: Pedidos de Compra */}
              {detailTab === 'pedidos' && (
                <div className="space-y-3">
                  {selectedCustomer.pedidos?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No hay compras registradas para este cliente aún.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {selectedCustomer.pedidos.map(p => (
                        <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-slate-900">{p.numeroPedido}</span>
                              {getOrderStatusBadge(p.estado)}
                            </div>
                            <div className="text-xs text-slate-500 font-inter flex items-center gap-1.5">
                              <span className="text-slate-600">{p.sedeOrigen}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800">{p.sedeDestino} (Pickup)</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                            <div className="font-montserrat font-extrabold text-base text-slate-900">
                              ${p.total.toFixed(2)}
                            </div>
                            <div className="text-[11px] text-slate-400 font-inter">
                              {new Date(p.fecha).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Contents: Encomiendas y Retiros */}
              {detailTab === 'encomiendas' && (
                <div className="space-y-3">
                  {selectedCustomer.encomiendas?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No hay encomiendas vinculadas para este cliente.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {selectedCustomer.encomiendas.map(e => (
                        <div key={e.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-fuchsia-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-extrabold text-sm text-primary-blue">{e.codigoTracking}</span>
                              {getTrackingStatusBadge(e.estado)}
                            </div>
                            <div className="text-xs text-slate-500 font-inter flex items-center gap-1.5">
                              <span>Origen: {e.sedeOrigen}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800">Retiro: {e.sedeDestino}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end font-inter text-xs">
                            <div className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Reg: {new Date(e.fechaRegistro).toLocaleDateString()}</span>
                            </div>
                            {e.fechaEntrega && (
                              <div className="text-[11px] text-emerald-600 font-bold">
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
