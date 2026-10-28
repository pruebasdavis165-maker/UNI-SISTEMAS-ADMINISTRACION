'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Building2, MapPin, Phone, Clock, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertCircle, Edit3, Save, X, Navigation, 
  Truck, Package, Ban 
} from 'lucide-react';
import { Button, Card, Badge, Alert, Input } from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function SedesManagementPage() {
  const [sedes, setSedes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingSede, setEditingSede] = useState(null);

  // Form edit state
  const [editDireccion, setEditDireccion] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editHorario, setEditHorario] = useState('');

  const defaultSedes = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      codigo: 'MGA-01',
      nombre: 'Sede Central Managua',
      pais: 'Nicaragua',
      ciudad: 'Managua',
      direccionVentanilla: 'Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)',
      telefonoContacto: '+505 2249-0100',
      horarioAtencion: 'Lun - Sáb: 8:00 AM - 6:00 PM',
      activo: true,
      tipo: 'Ventanilla Principal de Retiro & Despacho',
      capacidad: 'Almacén de 1,200 paquetes',
      personalAsignado: '4 Operadores de Ventanilla'
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      codigo: 'MIA-01',
      nombre: 'Sede Miami Hub',
      pais: 'Estados Unidos',
      ciudad: 'Miami, Florida',
      direccionVentanilla: '8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)',
      telefonoContacto: '+1 (305) 555-0199',
      horarioAtencion: 'Lun - Vie: 8:00 AM - 5:00 PM',
      activo: true,
      tipo: 'Hub de Consolidación y Recepción USA',
      capacidad: 'Almacén de 3,500 paquetes',
      personalAsignado: '6 Operadores Logísticos'
    }
  ];

  const fetchSedes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/sedes`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const merged = defaultSedes.map((def) => {
            const apiMatch = data.find((d) => d.codigo === def.codigo);
            return apiMatch ? { ...def, ...apiMatch } : def;
          });
          setSedes(merged);
        } else {
          setSedes(defaultSedes);
        }
      } else {
        setSedes(defaultSedes);
      }
    } catch {
      setSedes(defaultSedes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleStartEdit = (sede) => {
    setEditingSede(sede.codigo);
    setEditDireccion(sede.direccionVentanilla);
    setEditTelefono(sede.telefonoContacto);
    setEditHorario(sede.horarioAtencion);
    setSuccessMsg('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingSede(null);
  };

  const handleSaveSede = async (sede) => {
    setError('');
    setSuccessMsg('');
    try {
      const token = getToken();
      const updated = {
        ...sede,
        direccionVentanilla: editDireccion,
        telefonoContacto: editTelefono,
        horarioAtencion: editHorario
      };

      const res = await fetch(`${API_BASE_URL}/api/sedes/${sede.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          codigo: updated.codigo,
          nombre: updated.nombre,
          pais: updated.pais,
          ciudad: updated.ciudad,
          direccionVentanilla: updated.direccionVentanilla,
          telefonoContacto: updated.telefonoContacto,
          horarioAtencion: updated.horarioAtencion,
          activo: true
        })
      });

      setSedes((prev) =>
        prev.map((s) => (s.codigo === sede.codigo ? updated : s))
      );
      setEditingSede(null);
      setSuccessMsg(`Información de ${sede.nombre} actualizada correctamente.`);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Infraestructura Corporativa</Badge>
              <span className="text-xs text-slate-500 font-inter">Control de Sedes Oficiales Sede a Sede</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1 flex items-center gap-2.5">
              <Building2 className="w-8 h-8 text-primary-blue" />
              Sedes Oficiales NicaLogistics
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Parametrización y control de las sucursales autorizadas: Sede Central Managua y Sede Miami Hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchSedes}
              isLoading={isLoading}
            >
              Actualizar Sedes
            </Button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <Alert type="error" title="Atención">
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert type="success" title="Operación exitosa">
            {successMsg}
          </Alert>
        )}

        {/* 4 Cards de Métricas Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Sedes Oficiales</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">2 Sedes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Operación binacional activa</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-primary-blue border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Ruta Bilateral</p>
              <p className="text-2xl font-montserrat font-extrabold text-accent-magenta mt-1">Miami ⇄ MGA</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Carga consolidada directa</p>
            </div>
            <div className="p-3 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-100">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Retiro en Ventanilla</p>
              <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">100% Pickup</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Contra documento de identidad</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Entregas Domicilio</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-700 mt-1">0 Envíos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Regla: cero extravíos</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200">
              <Ban className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Resumen de Infraestructura Sede a Sede */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-soft-sm">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-primary-blue text-xs font-bold font-montserrat uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-magenta" />
              <span>Infraestructura Certificada Sede a Sede</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-montserrat font-extrabold text-slate-900">
              Circuito Comercial Exclusivo en Ventanilla
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-inter leading-relaxed">
              Por regla de negocio estricta, NicaLogistics opera únicamente entre la <strong>Sede Central Managua</strong> y la <strong>Sede Miami Hub</strong>. Se prohíbe el despacho a domicilios residenciales para garantizar cero pérdidas y máxima seguridad contra documento de identidad.
            </p>
          </div>
        </div>

        {/* Listado de las 2 Sedes Oficiales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sedes.map((sede) => (
            <Card key={sede.codigo} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:border-primary-blue/30 transition-all">
              <div className="space-y-6">
                
                {/* Header Sede */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent-magenta font-montserrat">
                      Código Oficial: {sede.codigo}
                    </span>
                    <h3 className="font-montserrat font-extrabold text-2xl text-slate-900 mt-1">
                      {sede.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 font-inter">{sede.ciudad}, {sede.pais}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                    <span>Operativa</span>
                  </span>
                </div>

                {/* Form or Info View */}
                {editingSede === sede.codigo ? (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <Input
                      label="Dirección de Ventanilla Oficial"
                      value={editDireccion}
                      onChange={(e) => setEditDireccion(e.target.value)}
                    />
                    <Input
                      label="Teléfono PBX / Atención"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                    />
                    <Input
                      label="Horario Oficial de Ventanilla"
                      value={editHorario}
                      onChange={(e) => setEditHorario(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-2 border-t border-slate-100 font-inter text-xs text-slate-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900 text-xs font-semibold font-montserrat">Ventanilla de Retiro:</strong>
                        <p className="text-slate-600 mt-0.5">{sede.direccionVentanilla}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="text-slate-900 font-semibold font-montserrat">PBX Oficial: </strong>
                        <span className="text-slate-600">{sede.telefonoContacto}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-alert-amber shrink-0" />
                      <div>
                        <strong className="text-slate-900 font-semibold font-montserrat">Horario: </strong>
                        <span className="text-slate-600">{sede.horarioAtencion}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mt-2">
                      <span className="text-slate-500 font-medium">{sede.tipo}</span>
                      <span className="font-bold text-primary-blue">{sede.capacidad}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Botones de Acción */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                {editingSede === sede.codigo ? (
                  <>
                    <Button variant="outline" size="sm" icon={X} onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button variant="primary" size="sm" icon={Save} onClick={() => handleSaveSede(sede)}>
                      Guardar Cambios
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" icon={Edit3} onClick={() => handleStartEdit(sede)}>
                    Modificar Parámetros
                  </Button>
                )}
              </div>

            </Card>
          ))}
        </div>

      </div>
    </ProtectedRoute>
  );
}
