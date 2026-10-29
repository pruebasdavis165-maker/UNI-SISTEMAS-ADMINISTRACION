'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { 
  Package, Plus, Search, Filter, Edit3, Trash2, RefreshCw, 
  AlertTriangle, CheckCircle2, Image as ImageIcon, Upload, DollarSign, UploadCloud, X 
} from 'lucide-react';
import { 
  Button, Input, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Alert, CustomDropdown, ConfirmModal, Toast 
} from '../../../components/ui';
import { getToken, API_BASE_URL } from '../../../lib/auth';

export default function ProductosPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProd, setCurrentProd] = useState(null);

  // Form fields
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formCatId, setFormCatId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File input refs
  const fileInputRefCreate = useRef(null);
  const fileInputRefEdit = useRef(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    onConfirm: () => {}
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/productos`);
      if (!res.ok) throw new Error('Error al cargar catálogo de productos.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categorias?activeOnly=true`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !formCatId) {
          setFormCatId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/productos/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir imagen.');

      setFormImageUrl(data.imageUrl);
      setSelectedFileName(file.name);
      setSuccessMsg(`Imagen "${file.name}" cargada correctamente al volumen persistente.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          codigoSku: formSku,
          nombre: formName,
          descripcion: formDesc,
          precio: parseFloat(formPrice),
          stockActual: parseInt(formStock),
          stockMinimo: parseInt(formMinStock),
          categoriaId: formCatId,
          imagenUrl: formImageUrl || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear producto.');

      setSuccessMsg(`Producto "${data.nombre}" creado exitosamente.`);
      setIsCreateOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!currentProd) return;
    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/productos/${currentProd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formName,
          descripcion: formDesc,
          precio: parseFloat(formPrice),
          stockMinimo: parseInt(formMinStock),
          categoriaId: formCatId,
          imagenUrl: formImageUrl || null,
          activo: formActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar producto.');

      setSuccessMsg(`Producto "${data.nombre}" actualizado.`);
      setIsEditOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (prod) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Desactivar Producto?',
      message: `¿Estás seguro de que deseas desactivar "${prod.nombre}" (${prod.codigoSku})? El artículo dejará de estar visible para compras en el catálogo de clientes.`,
      confirmText: 'Sí, Desactivar',
      variant: 'danger',
      onConfirm: () => executeDelete(prod)
    });
  };

  const executeDelete = async (prod) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/productos/${prod.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al desactivar producto.');
      setSuccessMsg(`Producto "${prod.nombre}" desactivado del catálogo.`);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (prod) => {
    setCurrentProd(prod);
    setFormSku(prod.codigoSku);
    setFormName(prod.nombre);
    setFormDesc(prod.descripcion || '');
    setFormPrice(prod.precio.toString());
    setFormStock(prod.stockActual.toString());
    setFormMinStock(prod.stockMinimo.toString());
    setFormCatId(prod.categoriaId);
    setFormImageUrl(prod.imagenUrl || '');
    setSelectedFileName(prod.imagenUrl ? prod.imagenUrl.split('/').pop() : '');
    setFormActive(prod.activo);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setCurrentProd(null);
    setFormSku('');
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormStock('10');
    setFormMinStock('5');
    setFormImageUrl('');
    setSelectedFileName('');
    setFormActive(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                          p.codigoSku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? p.categoriaId === selectedCat : true;
    return matchesSearch && matchesCat;
  });

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
              Catálogo de Productos
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
              Registra, edita y supervisa existencias de productos para venta con retiro en sede oficial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" icon={RefreshCw} onClick={fetchProducts} isLoading={isLoading}>
              Actualizar
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
            >
              Nuevo Producto
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

        {/* Alerts */}
        {error && <Alert type="error" title="Error">{error}</Alert>}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-inter focus:outline-none focus:border-primary-blue"
            />
          </div>

          <div className="w-full sm:w-64">
            <CustomDropdown
              icon={Filter}
              value={selectedCat}
              onChange={(val) => setSelectedCat(val)}
              placeholder="Todas las Categorías"
              options={[
                { value: '', label: 'Todas las Categorías' },
                ...categories.map((c) => ({ value: c.id, label: c.nombre }))
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <Card hover={false} className="border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio (USD)</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      Cargando productos...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = p.stockActual <= p.stockMinimo;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 align-middle min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.imagenUrl ? (
                                <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm leading-snug whitespace-normal">{p.nombre}</div>
                              <span className="text-[11px] font-mono font-bold text-primary-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100/60 inline-block mt-0.5">
                                {p.codigoSku}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                            {p.categoriaNombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle font-montserrat font-extrabold text-sm text-slate-900 whitespace-nowrap">
                          ${Number(p.precio).toFixed(2)} USD
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-2 h-2 rounded-full bg-alert-amber animate-pulse"></span>
                              {p.stockActual} unid. (Bajo Stock)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
                              {p.stockActual} unid.
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {p.activo ? (
                            <Badge variant="green" size="sm">Activo</Badge>
                          ) : (
                            <Badge variant="slate" size="sm">Inactivo</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-primary-blue hover:border-blue-200 transition-colors flex items-center justify-center shadow-2xs"
                              title="Editar Producto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shadow-2xs ${
                                p.activo
                                  ? 'border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300'
                                  : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                              }`}
                              title={p.activo ? "Desactivar Producto" : "Reactivar Producto"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Crear Producto */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Registrar Nuevo Producto"
          description="Crea un artículo para el catálogo y la bodega de ventanilla"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Código SKU"
                placeholder="SKU-TEC-001"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                required
              />
              <CustomDropdown
                label="Categoría"
                value={formCatId}
                onChange={(val) => setFormCatId(val)}
                options={categories.map((c) => ({ value: c.id, label: c.nombre }))}
                placeholder="Selecciona Categoría..."
                required
              />
            </div>

            <Input
              label="Nombre del Producto"
              placeholder="Ej. Dell XPS 15 32GB RAM"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción
              </label>
              <textarea
                rows="2"
                placeholder="Detalles y especificaciones técnicas..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-inter focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Precio Unitario (USD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
              />
              <Input
                label="Stock Inicial"
                type="number"
                min="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                required
              />
              <Input
                label="Stock Mínimo (Alerta)"
                type="number"
                min="1"
                value={formMinStock}
                onChange={(e) => setFormMinStock(e.target.value)}
                required
              />
            </div>

            {/* Subida de Imagen al Volumen Persistente Docker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700 font-inter">
                Imagen del Producto (Volumen Persistente)
              </label>
              
              <div 
                onClick={() => fileInputRefCreate.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  formImageUrl 
                    ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40' 
                    : 'border-slate-300 hover:border-primary-blue bg-slate-50/60 hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRefCreate}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="py-3 flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-primary-blue animate-spin" />
                    <p className="text-xs font-semibold text-primary-blue font-inter">Subiendo imagen al volumen de Docker (/app/uploads)...</p>
                  </div>
                ) : formImageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                    <img
                      src={formImageUrl}
                      alt="Previsualización"
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Guardada en Docker
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 font-inter truncate">
                        {selectedFileName || formImageUrl.split('/').pop()}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{formImageUrl}</p>
                      <p className="text-[11px] text-primary-blue hover:underline font-semibold mt-1">
                        Haz clic aquí para seleccionar o cambiar la imagen
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center mb-2 border border-blue-100">
                      <UploadCloud className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 font-montserrat">
                      Seleccionar imagen del producto (PNG, JPG, WEBP)
                    </p>
                    <p className="text-[11px] text-slate-400 font-inter mt-0.5">
                      Haz clic para buscar en tu equipo (almacenamiento en volumen persistente /app/uploads)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Producto
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Editar Producto */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Editar Producto"
          description={`Modificando ${currentProd?.nombre} (${currentProd?.codigoSku})`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <Input
              label="Nombre del Producto"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <CustomDropdown
              label="Categoría"
              value={formCatId}
              onChange={(val) => setFormCatId(val)}
              options={categories.map((c) => ({ value: c.id, label: c.nombre }))}
              placeholder="Selecciona Categoría..."
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 font-inter">
                Descripción
              </label>
              <textarea
                rows="2"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-inter focus:outline-none focus:border-primary-blue"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Precio (USD)"
                type="number"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
              />
              <Input
                label="Stock Mínimo (Alerta)"
                type="number"
                min="1"
                value={formMinStock}
                onChange={(e) => setFormMinStock(e.target.value)}
                required
              />
            </div>
            {/* Subida o reemplazo de Imagen al Volumen Persistente Docker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700 font-inter">
                Imagen del Producto (Volumen Persistente)
              </label>
              
              <div 
                onClick={() => fileInputRefEdit.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  formImageUrl 
                    ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40' 
                    : 'border-slate-300 hover:border-primary-blue bg-slate-50/60 hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRefEdit}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="py-3 flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-primary-blue animate-spin" />
                    <p className="text-xs font-semibold text-primary-blue font-inter">Subiendo nueva imagen al volumen Docker...</p>
                  </div>
                ) : formImageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                    <img
                      src={formImageUrl}
                      alt="Previsualización"
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Guardada en Docker
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 font-inter truncate">
                        {selectedFileName || formImageUrl.split('/').pop()}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{formImageUrl}</p>
                      <p className="text-[11px] text-primary-blue hover:underline font-semibold mt-1">
                        Haz clic aquí para seleccionar o cambiar la imagen
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center mb-2 border border-blue-100">
                      <UploadCloud className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 font-montserrat">
                      Seleccionar imagen del producto (PNG, JPG, WEBP)
                    </p>
                    <p className="text-[11px] text-slate-400 font-inter mt-0.5">
                      Haz clic para buscar en tu equipo (almacenamiento en volumen persistente /app/uploads)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="prodActive"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue"
              />
              <label htmlFor="prodActive" className="text-xs font-semibold text-slate-700 font-inter">
                Producto Activo en Catálogo
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
