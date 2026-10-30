'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Truck, Plane, Ship, Plus, Edit3, RefreshCw, 
  CheckCircle2, AlertCircle, DollarSign, Clock, ShieldCheck, 
  MapPin, Scale, ChevronRight 
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal, Input, Alert, Toast, CustomDropdown } from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function EnviosManagementPage() {
  const [formas, setFormas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentForma, setCurrentForma] = useState(null);

  // Edit fields
  const [editNombre, setEditNombre] = useState('');
  const [editTarifaBase, setEditTarifaBase] = useState('0');
  const [editTarifaPorLibra, setEditTarifaPorLibra] = useState('0');
  const [editTiempoEstimado, setEditTiempoEstimado] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create fields
  const [newNombre, setNewNombre] = useState('');
  const [newCodigo, setNewCodigo] = useState('');
  const [newTipoRuta, setNewTipoRuta] = useState('INTERNACIONAL');
  const [newTarifaBase, setNewTarifaBase] = useState('10');
  const [newTarifaPorLibra, setNewTarifaPorLibra] = useState('2.0');
  const [newTiempoEstimado, setNewTiempoEstimado] = useState('3 - 5 días hábiles');
  const [newDescripcion, setNewDescripcion] = useState('');

  // Cotizador de prueba
  const [simWeight, setSimWeight] = useState(10);

  const fetchFormas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/envios/formas`);
      if (!res.ok) throw new Error('Error al cargar formas de envío.');
      const data = await res.json();
      setFormas(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormas();
  }, []);

  const openEditModal = (forma) => {
    setCurrentForma(forma);
    setEditNombre(forma.nombre);
    setEditTarifaBase(String(forma.tarifaBase));
    setEditTarifaPorLibra(String(forma.tarifaPorLibra));
    setEditTiempoEstimado(forma.tiempoEstimado || '');
    setEditDescripcion(forma.descripcion || '');
    setEditActivo(forma.activo);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentForma) return;
    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/envios/formas/${currentForma.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          tarifaBase: parseFloat(editTarifaBase) || 0,
          tarifaPorLibra: parseFloat(editTarifaPorLibra) || 0,
          tiempoEstimado: editTiempoEstimado.trim(),
          descripcion: editDescripcion.trim(),
          activo: editActivo
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar forma de envío.');

      setSuccessMsg(`Modalidad "${editNombre}" actualizada exitosamente.`);
      setIsEditOpen(false);
      fetchFormas();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/envios/formas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: newNombre.trim(),
          codigo: newCodigo.trim().toUpperCase(),
          tipoRuta: newTipoRuta,
          tarifaBase: parseFloat(newTarifaBase) || 0,
          tarifaPorLibra: parseFloat(newTarifaPorLibra) || 0,
          tiempoEstimado: newTiempoEstimado.trim(),
          descripcion: newDescripcion.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar forma de envío.');

      setSuccessMsg(`Nueva forma de envío "${data.nombre}" creada exitosamente.`);
      setIsCreateOpen(false);
      fetchFormas();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (codigo) => {
    const code = (codigo || '').toUpperCase();
    if (code.includes('AEREO')) return <Plane className="w-5 h-5 text-sky-600" />;
    if (code.includes('MARITIMO')) return <Ship className="w-5 h-5 text-primary-blue" />;
    return <Truck className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Logística Multimodal</Badge>
              <span className="text-xs text-slate-400 font-inter">Control de Fletes y Tarifas</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 flex items-center gap-2.5">
              <Truck className="w-8 h-8 text-primary-blue" />
              Gestión de Formas de Envío y Tarifas
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Configura las modalidades logísticas (Terrestre, Marítima, Aérea) y sus tarifas aplicadas dinámicamente en el Checkout según el peso en libras y circuito de sedes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchFormas} isLoading={isLoading}>
              Actualizar
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
              Nueva Modalidad
            </Button>
          </div>
        </div>

        {/* Floating Toast */}
        <Toast
          message={successMsg}
          title="Configuración Guardada"
          type="success"
          duration={8000}
          onClose={() => setSuccessMsg('')}
        />

        {error && <Alert type="error" title="Atención">{error}</Alert>}

        {/* Reglas de Negocio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 font-inter">Regla 1: Pickup Local</span>
                <p className="font-montserrat font-extrabold text-sm text-slate-800">Origen === Destino</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-inter mt-3 leading-relaxed">
              El flete es automáticamente <strong>$0.00 (Gratis)</strong>. La encomienda nace de inmediato en estado <em>Lista para retiro</em>.
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary-blue flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 font-inter">Regla 2: Ruta Nacional</span>
                <p className="font-montserrat font-extrabold text-sm text-slate-800">Nicaragua ➔ Nicaragua</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-inter mt-3 leading-relaxed">
              Exclusivamente modalidad <strong>Terrestre</strong>. Se liquida por peso acumulado de mercancía según la tarifa base y por libra.
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-accent-magenta flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 font-inter">Regla 3: Internacional</span>
                <p className="font-montserrat font-extrabold text-sm text-slate-800">Miami Hub ⇄ Managua</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-inter mt-3 leading-relaxed">
              El cliente elige en el Checkout entre <strong>Marítimo Económico</strong> o <strong>Aéreo Exprés</strong>.
            </p>
          </Card>
        </div>

        {/* Modalidades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formas.map((forma) => {
            const simulatedCost = forma.tarifaBase + (simWeight * forma.tarifaPorLibra);
            return (
              <Card 
                key={forma.id} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  forma.activo ? 'border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100/80 flex items-center justify-center">
                        {getMethodIcon(forma.codigo)}
                      </div>
                      <div>
                        <h3 className="font-montserrat font-bold text-sm text-slate-900">{forma.nombre}</h3>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{forma.codigo}</span>
                      </div>
                    </div>
                    <Badge variant={forma.activo ? 'green' : 'slate'} size="sm">
                      {forma.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs font-inter bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tarifa Base</span>
                        <span className="font-montserrat font-extrabold text-base text-slate-800">
                          ${forma.tarifaBase.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">USD</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tarifa / Libra</span>
                        <span className="font-montserrat font-extrabold text-base text-primary-blue">
                          ${forma.tarifaPorLibra.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">USD/lb</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-inter">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Entrega: <strong>{forma.tiempoEstimado}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Ámbito: <strong>{forma.tipoRuta}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-inter line-clamp-2 leading-relaxed">
                      {forma.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-xs font-inter">
                    <span className="text-[10px] text-slate-400 block">Ej. {simWeight} lbs:</span>
                    <strong className="text-slate-900 font-montserrat">${simulatedCost.toFixed(2)} USD</strong>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => openEditModal(forma)}
                  >
                    Editar Tarifas
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal: Editar Tarifas */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Editar Tarifas: ${editNombre}`}
          description="Ajusta las tarifas por libra y tiempos de entrega que se aplicarán en el Checkout."
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Nombre de la Modalidad"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                  Tarifa Base (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editTarifaBase}
                  onChange={(e) => setEditTarifaBase(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                  Tarifa por Libra (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editTarifaPorLibra}
                  onChange={(e) => setEditTarifaPorLibra(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
                  required
                />
              </div>
            </div>

            <Input
              label="Tiempo Estimado de Entrega"
              value={editTiempoEstimado}
              onChange={(e) => setEditTiempoEstimado(e.target.value)}
              placeholder="Ej. 2 - 4 días hábiles"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción Comercial
              </label>
              <textarea
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
                rows={3}
                className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
                placeholder="Breve explicación de los requisitos o ventajas de este método."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editActivoModal"
                checked={editActivo}
                onChange={(e) => setEditActivo(e.target.checked)}
                className="rounded text-primary-blue focus:ring-primary-blue h-4 w-4"
              />
              <label htmlFor="editActivoModal" className="text-xs text-slate-700 font-inter font-medium cursor-pointer">
                Modalidad Habilitada en el Checkout
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Guardar Tarifas
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Crear Nueva Modalidad */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Nueva Modalidad de Envío"
          description="Registra una nueva opción logística para el cálculo automático en Checkout."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nombre Comercial"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              placeholder="Ej. Aéreo Prioritario Gold"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Código Identificador"
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                placeholder="Ej. AEREO_PRIORITARIO"
                required
              />

              <div>
                <CustomDropdown
                  label="Tipo de Ruta"
                  value={newTipoRuta}
                  onChange={(val) => setNewTipoRuta(val)}
                  options={[
                    { value: 'NACIONAL', label: 'Ruta Nacional (Nicaragua)' },
                    { value: 'INTERNACIONAL', label: 'Ruta Internacional (Miami - Managua)' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                  Tarifa Base (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTarifaBase}
                  onChange={(e) => setNewTarifaBase(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                  Tarifa por Libra (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTarifaPorLibra}
                  onChange={(e) => setNewTarifaPorLibra(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
                  required
                />
              </div>
            </div>

            <Input
              label="Tiempo Estimado"
              value={newTiempoEstimado}
              onChange={(e) => setNewTiempoEstimado(e.target.value)}
              placeholder="Ej. 1 - 2 días hábiles"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción
              </label>
              <textarea
                value={newDescripcion}
                onChange={(e) => setNewDescripcion(e.target.value)}
                rows={2}
                className="w-full bg-white text-slate-900 rounded-xl py-2 px-3 border border-slate-200 text-xs font-inter focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Modalidad
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
