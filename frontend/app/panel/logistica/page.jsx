'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Truck, Package, Search, Filter, RefreshCw, 
  ArrowRight, CheckCircle2, Clock, MapPin, 
  AlertTriangle, ShieldCheck, UserCheck, Eye, 
  Send, CheckSquare
} from 'lucide-react';
import { Button, Input, Card, Badge, Modal, Alert } from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function PanelLogisticaPage() {
  const [shipments, setShipments] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Transition & Detail Modal
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transitionStatus, setTransitionStatus] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLogisticsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const [resShipments, resSedes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/encomiendas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/sedes`)
      ]);

      if (!resShipments.ok) throw new Error('Error al cargar encomiendas.');
      const dataShipments = await resShipments.json();
      setShipments(dataShipments);

      if (resSedes.ok) {
        const dataSedes = await resSedes.json();
        setSedes(dataSedes);
      }
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const handleOpenAction = (shipment, nextStatus) => {
    setSelectedShipment(shipment);
    setTransitionStatus(nextStatus);
    setTransitionNote('');
    setIsModalOpen(true);
  };

  const handleExecuteStatusChange = async () => {
    if (!selectedShipment || !transitionStatus) return;
    setIsUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = getToken();
      let res;

      if (transitionStatus === 'ENTREGADA') {
        // Endpoint específico de entrega en ventanilla (Issue 5.5)
        res = await fetch(`${API_BASE_URL}/api/encomiendas/${selectedShipment.id}/entregar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notas: transitionNote })
        });
      } else {
        // Actualización estándar de estado (Issue 5.1)
        res = await fetch(`${API_BASE_URL}/api/encomiendas/${selectedShipment.id}/estado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nuevoEstado: transitionStatus,
            comentario: transitionNote || null
          })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cambiar estado.');

      setSuccessMsg(`Encomienda ${selectedShipment.codigoTracking} actualizada a: ${transitionStatus}`);
      setIsModalOpen(false);
      setSelectedShipment(null);
      fetchLogisticsData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter logic
  const filteredShipments = shipments.filter(s => {
    const term = search.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      s.codigoTracking.toLowerCase().includes(term) ||
      s.numeroPedido.toLowerCase().includes(term) ||
      s.clienteNombre.toLowerCase().includes(term);

    const matchesSede = 
      !selectedSedeFilter ||
      s.sedeOrigenId === selectedSedeFilter ||
      s.sedeDestinoId === selectedSedeFilter;

    return matchesSearch && matchesSede;
  });

  // Kanban groups
  const colRegistrada = filteredShipments.filter(s => s.estado === 'REGISTRADA');
  const colTransito = filteredShipments.filter(s => s.estado === 'EN_TRANSITO');
  const colRetiro = filteredShipments.filter(s => s.estado === 'LISTA_PARA_RETIRO');
  const colEntregada = filteredShipments.filter(s => s.estado === 'ENTREGADA');

  const renderKanbanCard = (shipment) => {
    return (
      <div 
        key={shipment.id}
        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-primary-blue/50 shadow-sm hover:shadow-md transition-all space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-montserrat font-extrabold text-sm text-primary-blue">
            {shipment.codigoTracking}
          </span>
          <span className="text-[10px] text-slate-400 font-inter">
            {new Date(shipment.fechaRegistro).toLocaleDateString()}
          </span>
        </div>

        {/* Client & Order */}
        <div className="text-xs font-inter text-slate-700">
          <p className="font-semibold text-slate-900">{shipment.clienteNombre}</p>
          <p className="text-[11px] text-slate-400">Orden: {shipment.numeroPedido}</p>
        </div>

        {/* Route: Sede Origen -> Sede Destino */}
        <div className="p-2 bg-slate-50 rounded-lg text-xs font-inter space-y-1 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500">
            <span className="truncate max-w-[100px]">{shipment.sedeOrigenNombre}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800 truncate max-w-[100px]">{shipment.sedeDestinoNombre}</span>
          </div>
        </div>

        {/* Action Button depending on current state */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {shipment.estado === 'REGISTRADA' && (
            <Button
              variant="outline"
              size="sm"
              icon={Send}
              className="w-full justify-center text-xs"
              onClick={() => handleOpenAction(shipment, 'EN_TRANSITO')}
            >
              Despachar a Tránsito
            </Button>
          )}

          {shipment.estado === 'EN_TRANSITO' && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckSquare}
              className="w-full justify-center text-xs bg-amber-500 hover:bg-amber-600 border-none"
              onClick={() => handleOpenAction(shipment, 'LISTA_PARA_RETIRO')}
            >
              Recibir en Ventanilla
            </Button>
          )}

          {shipment.estado === 'LISTA_PARA_RETIRO' && (
            <Button
              variant="primary"
              size="sm"
              icon={UserCheck}
              className="w-full justify-center text-xs bg-emerald-600 hover:bg-emerald-700 border-none"
              onClick={() => handleOpenAction(shipment, 'ENTREGADA')}
            >
              Entregar al Cliente
            </Button>
          )}

          {shipment.estado === 'ENTREGADA' && (
            <div className="w-full py-1 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Entregado en Sede</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Logística']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">Operaciones Logísticas</Badge>
              <span className="text-xs text-slate-400 font-inter">Control de Ventanilla y Despacho Sede a Sede</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1 flex items-center gap-2.5">
              <Truck className="w-8 h-8 text-alert-amber" />
              Tablero Logístico de Encomiendas
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Monitorea el ciclo de vida de los paquetes desde su registro en Miami Hub hasta su entrega en ventanilla oficial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" icon={RefreshCw} onClick={fetchLogisticsData} isLoading={isLoading}>
              Actualizar
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" title="Error en Operaciones">{error}</Alert>}
        {successMsg && <Alert type="success" title="Completado">{successMsg}</Alert>}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-primary-blue bg-white shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase font-inter">Registradas</p>
            <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">{colRegistrada.length}</p>
            <p className="text-[11px] text-slate-500">En preparación en origen</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-alert-amber bg-white shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase font-inter">En Tránsito</p>
            <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">{colTransito.length}</p>
            <p className="text-[11px] text-slate-500">Traslado inter-sucursales</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500 bg-white shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase font-inter">Listas para Retiro</p>
            <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">{colRetiro.length}</p>
            <p className="text-[11px] text-slate-500">En ventanilla de destino</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-slate-400 bg-white shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase font-inter">Entregadas</p>
            <p className="text-2xl font-montserrat font-extrabold text-slate-700 mt-1">{colEntregada.length}</p>
            <p className="text-[11px] text-slate-500">Ciclo completado con éxito</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <Input
                icon={Search}
                placeholder="Buscar por tracking NL-..., orden o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sede Filter */}
            <div className="w-full md:w-auto flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 font-inter flex items-center gap-1.5 shrink-0">
                <MapPin className="w-4 h-4 text-accent-magenta" />
                Filtrar por Sede:
              </span>
              <select
                value={selectedSedeFilter}
                onChange={(e) => setSelectedSedeFilter(e.target.value)}
                className="text-xs font-inter font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Todas las Sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.ciudad})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Kanban Board (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Column 1: Registrada */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-primary-blue font-montserrat font-bold text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-blue"></span>
                Registrada
              </span>
              <Badge variant="blue" size="sm">{colRegistrada.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {colRegistrada.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Sin paquetes pendientes de despacho
                </div>
              ) : (
                colRegistrada.map(renderKanbanCard)
              )}
            </div>
          </div>

          {/* Column 2: En Tránsito */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-montserrat font-bold text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-alert-amber"></span>
                En Tránsito
              </span>
              <Badge variant="amber" size="sm">{colTransito.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {colTransito.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No hay unidades en ruta
                </div>
              ) : (
                colTransito.map(renderKanbanCard)
              )}
            </div>
          </div>

          {/* Column 3: Lista para Retiro */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-montserrat font-bold text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success-green"></span>
                Lista para Retiro
              </span>
              <Badge variant="green" size="sm">{colRetiro.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {colRetiro.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Ningún paquete en espera de retiro
                </div>
              ) : (
                colRetiro.map(renderKanbanCard)
              )}
            </div>
          </div>

          {/* Column 4: Entregada */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-montserrat font-bold text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                Entregadas en Ventanilla
              </span>
              <Badge variant="slate" size="sm">{colEntregada.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {colEntregada.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Historial vacío
                </div>
              ) : (
                colEntregada.map(renderKanbanCard)
              )}
            </div>
          </div>

        </div>

        {/* Transition Action Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Actualizar Encomienda: ${selectedShipment?.codigoTracking}`}
        >
          {selectedShipment && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-inter space-y-1">
                <p><strong>Cliente:</strong> {selectedShipment.clienteNombre} ({selectedShipment.clienteEmail})</p>
                <p><strong>Ruta:</strong> {selectedShipment.sedeOrigenNombre} ➔ {selectedShipment.sedeDestinoNombre}</p>
                <p><strong>Nuevo Estado Asignado:</strong> <span className="font-bold text-primary-blue">{transitionStatus}</span></p>
              </div>

              {transitionStatus === 'ENTREGADA' ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-inter space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Protocolo de Entrega en Ventanilla (Issue 5.5)
                  </p>
                  <p>Verifica que el titular presente su cédula o pasaporte original y firme el comprobante físico de entrega.</p>
                </div>
              ) : transitionStatus === 'LISTA_PARA_RETIRO' ? (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-primary-blue font-inter">
                  <strong>Notificación Automática (Issue 5.3):</strong> Se emitirá una notificación al correo del cliente ({selectedShipment.clienteEmail}) avisándole que su paquete ya puede ser retirado.
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 font-montserrat uppercase">
                  Observaciones / Nota de Bitácora
                </label>
                <Input
                  placeholder="Ej. Paquete recepcionado en estante A-3 de ventanilla..."
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExecuteStatusChange}
                  isLoading={isUpdating}
                >
                  Confirmar Cambio de Estado
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
