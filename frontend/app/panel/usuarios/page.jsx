'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Users, UserPlus, Search, Filter, ShieldCheck, ShieldAlert, 
  Edit3, UserX, UserCheck, RefreshCw, Mail, Phone, Lock, Eye, AlertTriangle, Truck
} from 'lucide-react';
import { 
  Button, Input, Select, CustomDropdown, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Alert, ConfirmModal, Toast 
} from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    onConfirm: () => {}
  });

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleDropdownOptions = [
    { value: 1, label: 'Administrador', description: 'Control total de la plataforma, usuarios, auditoría y configuraciones.' },
    { value: 2, label: 'Vendedor', description: 'Gestión de pedidos comerciales, catálogo y expedientes de clientes CRM.' },
    { value: 3, label: 'Logística', description: 'Operación en ventanilla física, recepción, traslados y entrega de encomiendas.' },
    { value: 4, label: 'Cliente', description: 'Usuario de compras y retiro presencial de paquetes con identificación.' }
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al cargar la lista de usuarios.');
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/usuarios/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreCompleto: formName,
          email: formEmail,
          password: formPassword,
          telefono: formPhone,
          rolId: parseInt(formRole)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear usuario.');

      setSuccessMsg(`Usuario ${data.nombreCompleto} creado exitosamente.`);
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreCompleto: formName,
          telefono: formPhone,
          rolId: parseInt(formRole),
          newPassword: formPassword || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario.');

      setSuccessMsg(`Usuario ${data.nombreCompleto} actualizado.`);
      setIsEditOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (user) => {
    const isSuspension = user.activo;
    setConfirmModal({
      isOpen: true,
      title: isSuspension ? '¿Suspender Cuenta de Usuario?' : '¿Reactivar Cuenta de Usuario?',
      message: isSuspension 
        ? `¿Deseas suspender la cuenta de "${user.nombreCompleto}"? El usuario quedará inhabilitado temporalmente y no podrá iniciar sesión en la plataforma.` 
        : `¿Deseas reactivar la cuenta de "${user.nombreCompleto}"? El usuario recuperará el acceso inmediato al sistema con su rol correspondiente.`,
      confirmText: isSuspension ? 'Sí, Suspender Cuenta' : 'Sí, Reactivar Cuenta',
      variant: isSuspension ? 'warning' : 'danger',
      onConfirm: () => executeToggleStatus(user)
    });
  };

  const executeToggleStatus = async (user) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al modificar estado de la cuenta.');

      const data = await res.json();
      setSuccessMsg(data.message || `Estado de cuenta para ${user.nombreCompleto} actualizado.`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormName(user.nombreCompleto);
    setFormEmail(user.email);
    setFormPhone(user.telefono || '');
    setFormPassword('');
    setFormRole(user.rolId);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setCurrentUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole(4);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole ? u.rol === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (rol) => {
    switch (rol) {
      case 'Admin': return 'blue';
      case 'Vendedor': return 'magenta';
      case 'Logística': return 'amber';
      default: return 'green';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header con título y acción */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
              Gestión de Usuarios y Roles
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Administración centralizada de cuentas de colaboradores, operadores de ventanilla y clientes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchUsers}
              isLoading={isLoading}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
            >
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Global Floating Toast (Top Right 10s auto-dismiss) */}
        <Toast
          message={successMsg}
          title="Operación Exitosa"
          type="success"
          duration={10000}
          onClose={() => setSuccessMsg('')}
        />

        {/* Feedback Alert for errors */}
        {error && (
          <Alert type="error" title="Error en operación">
            {error}
          </Alert>
        )}

        {/* 4 Cards Superiores de Métricas Rediseñadas (Colores corporativos y sombras suaves) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Cuentas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter block">
                Total Cuentas
              </span>
              <div className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
                {users.length}
              </div>
              <span className="text-[11px] text-slate-400 font-inter">Registradas en el sistema</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-blue shadow-soft-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Administradores */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter block">
                Administradores
              </span>
              <div className="font-montserrat font-extrabold text-3xl text-primary-blue mt-1">
                {users.filter(u => u.rol === 'Admin').length}
              </div>
              <span className="text-[11px] text-primary-blue/80 font-inter font-medium">Control corporativo</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary-blue shadow-soft-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Op. Logística */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter block">
                Op. Logística
              </span>
              <div className="font-montserrat font-extrabold text-3xl text-alert-amber mt-1">
                {users.filter(u => u.rol === 'Logística').length}
              </div>
              <span className="text-[11px] text-amber-700/80 font-inter font-medium">Ventanilla & Bodega</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-alert-amber shadow-soft-sm">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Clientes Activos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter block">
                Clientes Activos
              </span>
              <div className="font-montserrat font-extrabold text-3xl text-success-green mt-1">
                {users.filter(u => u.rol === 'Cliente' && u.activo).length}
              </div>
              <span className="text-[11px] text-emerald-700/80 font-inter font-medium">Compras Sede a Sede</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-success-green shadow-soft-sm">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Filters and Search Bar con Combobox Estilizado */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-inter text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
            />
          </div>

          <div className="w-full sm:w-64">
            <CustomDropdown
              icon={Filter}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder="Todos los Roles"
              options={[
                { value: '', label: 'Todos los Roles' },
                { value: 'Admin', label: 'Administrador' },
                { value: 'Vendedor', label: 'Vendedor' },
                { value: 'Logística', label: 'Logística' },
                { value: 'Cliente', label: 'Cliente' }
              ]}
            />
          </div>
        </div>

        {/* Users Table */}
        <Card hover={false} className="overflow-hidden border border-slate-200 shadow-md rounded-2xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Rol Asignado</th>
                  <th className="px-6 py-4">Estado de Cuenta</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      Cargando listado de usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No se encontraron usuarios coincidentes con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 font-montserrat">{u.nombreCompleto}</div>
                        <div className="text-xs text-slate-500 font-inter">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        {u.telefono || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(u.rol)} size="sm">
                          {u.rol}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Suspendido
                          </span>
                        )}
                      </td>
                      
                      {/* Acciones: Botones compactos con iconos limpios */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-primary-blue hover:border-blue-200 transition-colors flex items-center justify-center shadow-2xs"
                            title="Editar Datos"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shadow-2xs ${
                              u.activo
                                ? 'border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300'
                                : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                            }`}
                            title={u.activo ? "Suspender Cuenta (Soft Delete)" : "Reactivar Cuenta"}
                          >
                            {u.activo ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Crear Usuario */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Crear Nueva Cuenta"
          description="Agrega un nuevo miembro de personal o cliente al sistema"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej. Sofia Martínez"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="sofia@nicalogistics.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña Inicial"
              type="password"
              placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9, @#*)"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required
            />
            <Input
              label="Teléfono / Celular"
              type="tel"
              placeholder="+505 8888-0000"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <CustomDropdown
              label="Rol en el Sistema"
              value={formRole}
              onChange={(val) => setFormRole(Number(val))}
              options={roleDropdownOptions}
              dropUp={true}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Usuario
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Editar Usuario */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Editar Cuenta de Usuario"
          description={`Modificando datos para ${currentUser?.email}`}
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            <Input
              label="Nombre Completo"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label="Teléfono / Celular"
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <CustomDropdown
              label="Rol Asignado"
              value={formRole}
              onChange={(val) => setFormRole(Number(val))}
              options={roleDropdownOptions}
            />

            <Input
              label="Nueva Contraseña (Opcional)"
              type="password"
              placeholder="Dejar en blanco para mantener la actual"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmación Corporativo */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
        />

      </div>
    </ProtectedRoute>
  );
}
