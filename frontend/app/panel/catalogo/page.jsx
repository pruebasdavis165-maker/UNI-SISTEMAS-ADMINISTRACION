'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, Search, Filter, ShoppingBag, 
  ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, 
  DollarSign, ChevronDown, Check 
} from 'lucide-react';
import { Button, Input, Select, Badge, Card } from '../../../components/ui';
import { API_BASE_URL, getToken } from '../../../lib/auth';

export default function PanelCatalogoPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('destacados');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    { value: 'nombre-asc', label: 'Alfabético: A - Z' },
    { value: 'nombre-desc', label: 'Alfabético: Z - A' },
    { value: 'stock-desc', label: 'Disponibilidad de Stock' },
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
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900">
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
          {/* Selector de Categoría */}
          <div className="w-full sm:w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              <div className="absolute right-0 mt-1 w-full sm:w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
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
                className="bg-white rounded-xl border border-slate-200 hover:border-primary-blue/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="h-44 bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100 relative">
                    <img
                      src={p.imagenUrl || '/placeholder.png'}
                      alt={p.nombre}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      {isLowStock ? (
                        <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          En Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.categoriaNombre || 'General'}
                    </span>
                    <h3 className="font-montserrat font-bold text-sm text-slate-900 line-clamp-2">
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
    </div>
  );
}
