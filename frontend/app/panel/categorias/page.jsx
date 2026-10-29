'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  FolderPlus, FolderTree, Search, Edit3, Trash2, RefreshCw, 
  Layers, Package, CheckCircle2, XCircle 
} from 'lucide-react';
import { 
  Button, Input, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Alert 
} from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/categorias`);
      if (!res.ok) throw new Error('Error al cargar categorías.');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formName,
          descripcion: formDesc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear categoría.');

      setSuccessMsg(`Categoría "${data.nombre}" creada con éxito.`);
      setIsCreateOpen(false);
      setFormName('');
      setFormDesc('');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!currentCat) return;
    setIsSubmitting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/categorias/${currentCat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formName,
          descripcion: formDesc,
          activo: formActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar categoría.');

      setSuccessMsg(`Categoría "${data.nombre}" actualizada.`);
      setIsEditOpen(false);
      setCurrentCat(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`¿Deseas desactivar la categoría "${cat.nombre}"?`)) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/categorias/${cat.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al desactivar categoría.');
      setSuccessMsg(`Categoría "${cat.nombre}" desactivada.`);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (cat) => {
    setCurrentCat(cat);
    setFormName(cat.nombre);
    setFormDesc(cat.descripcion || '');
    setFormActive(cat.activo);
    setIsEditOpen(true);
  };

  const filteredCategories = categories.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
              Gestión de Categorías
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Administra las familias y clasificaciones de productos disponibles en NicaLogistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" icon={RefreshCw} onClick={fetchCategories} isLoading={isLoading}>
              Actualizar
            </Button>
            <Button
              variant="primary"
              icon={FolderPlus}
              onClick={() => {
                setFormName('');
                setFormDesc('');
                setIsCreateOpen(true);
              }}
            >
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" title="Error">{error}</Alert>}
        {successMsg && <Alert type="success" title="Completado">{successMsg}</Alert>}

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-inter focus:outline-none focus:border-primary-blue"
            />
          </div>
          <span className="text-xs text-slate-500 font-inter">
            Total: <strong>{filteredCategories.length}</strong> categorías
          </span>
        </div>

        {/* Table */}
        <Card hover={false} className="border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Productos Asociados</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      Cargando categorías...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-primary-blue" />
                        {c.nombre}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {c.descripcion || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          {c.totalProductos} productos
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.activo ? (
                          <Badge variant="green" size="sm">Activa</Badge>
                        ) : (
                          <Badge variant="slate" size="sm">Inactiva</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-primary-blue hover:border-blue-200 transition-colors flex items-center justify-center shadow-2xs"
                            title="Editar Categoría"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shadow-2xs ${
                              c.activo
                                ? 'border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300'
                                : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                            }`}
                            title={c.activo ? "Desactivar Categoría" : "Reactivar Categoría"}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Modal: Crear */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Nueva Categoría de Productos"
          description="Define una nueva categoría para organizar el catálogo de NicaLogistics"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nombre de la Categoría"
              placeholder="Ej. Herramientas de Precisión"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción
              </label>
              <textarea
                rows="3"
                placeholder="Breve detalle de la categoría..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-inter focus:outline-none focus:border-primary-blue"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Categoría
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Editar */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Editar Categoría"
          description={`Modificando ${currentCat?.nombre}`}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <Input
              label="Nombre de la Categoría"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción
              </label>
              <textarea
                rows="3"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-inter focus:outline-none focus:border-primary-blue"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="catActive"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue"
              />
              <label htmlFor="catActive" className="text-xs font-semibold text-slate-700 font-inter">
                Categoría Activa (Visible en catálogo)
              </label>
            </div>
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

      </div>
    </ProtectedRoute>
  );
}
