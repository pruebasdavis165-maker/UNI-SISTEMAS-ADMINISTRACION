'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Building2, MapPin, Phone, Clock, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertCircle, Edit3, Save, X, Navigation
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
        const merged = defaultSedes.map(ds => {
          const remote = data.find(r => r.codigo === ds.codigo);
          return remote ? { ...ds, ...remote } : ds;
        });
        setSedes(merged);
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

  const startEdit = (sede) => {
    setEditingSede(sede);
    setEditDireccion(sede.direccionVentanilla);
    setEditTelefono(sede.telefonoContacto || '');
    setEditHorario(sede.horarioAtencion || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSede) return;

    setSedes(prev => prev.map(s => {
      if (s.codigo === editingSede.codigo) {
        return {
          ...s,
          direccionVentanilla: editDireccion,
          telefonoContacto: editTelefono,
          horarioAtencion: editHorario
        };
      }
      return s;
    }));

    setSuccessMsg(`Información de ${editingSede.nombre} actualizada correctamente.`);
    setEditingSede(null);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Control Corporativo</Badge>
              <span className="text-xs text-slate-500 font-inter">Red Oficial Sede a Sede</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Control de Sedes Oficiales
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Supervisión de ventanillas autorizadas, horarios y direcciones operativas del circuito Miami ⇄ Managua.
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
            <Card key={sede.codigo} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-primary-blue/30 transition-all">
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
                    Operativa
                  </span>
                </div>

                {/* Formulario de edición rápida o visualización */}
                {editingSede?.codigo === sede.codigo ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4 pt-2 border-t border-slate-100">
                    <Input
                      label="Dirección de Ventanilla"
                      value={editDireccion}
                      onChange={(e) => setEditDireccion(e.target.value)}
                      required
                    />
                    <Input
                      label="Teléfono / PBX de Contacto"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      required
                    />
                    <Input
                      label="Horario de Atención"
                      value={editHorario}
                      onChange={(e) => setEditHorario(e.target.value)}
                      required
                    />
                    <div className="flex items-center gap-2 pt-2">
                      <Button type="submit" variant="primary" size="sm" icon={Save}>
                        Guardar Cambios
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingSede(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-xs font-inter text-slate-600">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <MapPin className="w-5 h-5 text-primary-blue shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900 font-montserrat text-xs uppercase mb-0.5">Ventanilla de Retiro Oficial</strong>
                        <p className="text-slate-700 leading-relaxed">{sede.direccionVentanilla}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <Phone className="w-4 h-4 text-accent-magenta shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">PBX Oficial</span>
                          <span className="font-semibold text-slate-900">{sede.telefonoContacto}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">Horario</span>
                          <span className="font-semibold text-slate-900">{sede.horarioAtencion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[11px] text-slate-700">
                      <span><strong>Capacidad Almacén:</strong> {sede.capacidad}</span>
                      <span className="text-primary-blue font-semibold">{sede.personalAsignado}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de modificación */}
              {editingSede?.codigo !== sede.codigo && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => startEdit(sede)}
                  >
                    Modificar Parámetros de Sede
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

      </div>
    </ProtectedRoute>
  );
}
