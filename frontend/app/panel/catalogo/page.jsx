'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, Search, Filter, ShoppingBag, 
  ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, 
  DollarSign, ChevronDown, Check, Eye, X, Scale, ShieldCheck 
} from 'lucide-react';
import { Button, Input, Select, CustomDropdown, Badge, Card } from '../../../components/ui';
import { API_BASE_URL, getToken } from '../../../lib/auth';

export default function PanelCatalogoPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('destacados');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [error, setError] = useState('');

  const fetchCatalogData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [resProd, resCat] = await Promise.all([
        fetch(`${API_BASE_URL}/api/productos`),
        fetch(`${API_BASE_URL}/api/categorias`).catch(() => null)
      ]);

      if (!resProd.ok) throw new Error('Error al consultar el catálogo.');
      const dataProd = await resProd.json();
      setProducts(dataProd);

      if (resCat && resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat);
      }
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const sortOptions = [
    { value: 'destacados', label: 'Destacados' },
    { value: 'precio-asc', label: 'Menor Precio' },
    { value: 'precio-desc', label: 'Mayor Precio' },
    { value: 'nombre-asc', label: 'Orden Alfabético (A - Z)' },
    { value: 'nombre-desc', label: 'Orden Alfabético (Z - A)' },
    { value: 'stock-desc', label: 'Mayor Disponibilidad (Stock)' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Destacados';

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = 
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = selectedCategory ? p.categoriaId === selectedCategory : true;
      return matchesSearch && matchesCat;
    });

    switch (sortBy) {
      case 'precio-asc':
        result.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        break;
      case 'precio-desc':
        result.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        break;
      case 'nombre-asc':
        result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      case 'nombre-desc':
        result.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
        break;
      case 'stock-desc':
        result.sort((a, b) => (b.stockActual || 0) - (a.stockActual || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Comercial */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-800">
            Catálogo Corporativo de Productos
          </h1>
          <p className="font-inter text-xs sm:text-sm text-slate-500 mt-1">
            Especificaciones comerciales, precios en USD y disponibilidad para entrega en ventanilla física.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchCatalogData} isLoading={isLoading}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Barra de Filtros y Ordenamiento */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selector de Categoría con Dropdown Personalizado */}
          <div className="w-full sm:w-56">
            <CustomDropdown
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              placeholder="Todas las categorías"
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(c => ({ value: c.id, label: c.nombre }))
              ]}
            />
          </div>

          {/* Combobox de Ordenamiento */}
          <div className="relative w-full sm:w-56">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 font-inter text-xs text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 font-medium">Ordenar:</span>
                <span className="font-semibold text-slate-800">{currentSortLabel}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-full sm:w-56 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] py-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-inter transition-colors ${
                      sortBy === opt.value
                        ? 'bg-blue-50 text-primary-blue font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <Check className="w-4 h-4 text-primary-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Cargando productos...</div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          No se encontraron productos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((p) => {
            const isLowStock = (p.stockActual || 0) <= (p.stockMinimo || 5);
            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div 
                    onClick={() => setQuickViewProduct(p)}
                    className="h-44 bg-slate-50/70 p-4 flex items-center justify-center border-b border-slate-100 relative cursor-pointer overflow-hidden"
                  >
                    <img
                      src={p.imagenUrl || '/placeholder.png'}
                      alt={p.nombre}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      {isLowStock ? (
                        <span className="text-[10px] font-bold text-white bg-amber-500 px-2.5 py-0.5 rounded-full shadow-2xs">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          En Stock
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-primary-blue text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Ficha Técnica
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                      <span>SKU: {p.codigoSku || p.sku || 'N/A'}</span>
                      <span className="font-sans font-semibold text-slate-500">{p.categoriaNombre || 'General'}</span>
                    </div>
                    <h3 
                      onClick={() => setQuickViewProduct(p)}
                      className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2 hover:text-primary-blue transition-colors cursor-pointer"
                    >
                      {p.nombre}
                    </h3>
                    <p className="font-inter text-xs text-slate-500 line-clamp-2">
                      {p.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precio Oficial</span>
                    <span className="font-montserrat font-extrabold text-base text-primary-blue">
                      ${Number(p.precio || 0).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Disponibilidad</span>
                    <span className={`font-mono font-bold text-xs ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                      {p.stockActual || 0} unid.
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    
      {/* Modal Quick View Ficha Técnica para Vendedores */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  {quickViewProduct.categoriaNombre || 'Categoría Oficial'}
                </span>
                <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-slate-900 mt-2">
                  {quickViewProduct.nombre}
                </h2>
                <p className="text-xs font-mono text-slate-400 font-bold mt-1">
                  SKU Oficial: {quickViewProduct.codigoSku || quickViewProduct.sku || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 h-56 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={quickViewProduct.imagenUrl || '/placeholder.png'}
                  alt={quickViewProduct.nombre}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                />
              </div>

              <div className="sm:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs font-inter bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Precio Oficial</span>
                    <span className="font-montserrat font-extrabold text-lg text-primary-blue">
                      ${Number(quickViewProduct.precio || 0).toFixed(2)} USD
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Existencias en Almacén</span>
                    <span className="font-montserrat font-extrabold text-lg text-slate-800">
                      {quickViewProduct.stockActual || 0} unid.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-inter">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-primary-blue font-semibold border border-blue-100">
                    <Scale className="w-4 h-4" />
                    <span>Peso: {quickViewProduct.pesoLibras ? quickViewProduct.pesoLibras.toFixed(1) : '1.0'} lbs</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Retiro en Ventanilla</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-montserrat mb-1">
                    Descripción Técnica
                  </h4>
                  <p className="text-xs text-slate-600 font-inter leading-relaxed max-h-32 overflow-y-auto">
                    {quickViewProduct.descripcion || 'Sin descripción detallada registrada para este artículo.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setQuickViewProduct(null)}>
                Cerrar Ficha Técnica
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
