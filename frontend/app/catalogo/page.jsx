'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, Filter, ArrowUpDown, Package, ChevronDown, 
  MapPin, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, 
  Check, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../../components/ui';
import { API_BASE_URL, getUser, isInternalRole } from '../../lib/auth';
import { addToCart } from '../../lib/cart';

export default function PublicCatalogPage() {
  const router = useRouter();

  // Redirigir a personal interno al catálogo corporativo dentro del panel con Sidebar
  useEffect(() => {
    const user = getUser();
    if (isInternalRole(user?.rol)) {
      router.replace('/panel/catalogo');
    }
  }, [router]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'featured', label: 'Destacados', icon: Sparkles },
    { value: 'price-asc', label: 'Menor Precio', icon: ArrowUpDown },
    { value: 'price-desc', label: 'Mayor Precio', icon: ArrowUpDown },
    { value: 'name-asc', label: 'Alfabético: A - Z', icon: ArrowUpDown },
    { value: 'name-desc', label: 'Alfabético: Z - A', icon: ArrowUpDown },
    { value: 'stock-desc', label: 'Disponibilidad de Stock', icon: ArrowUpDown },
  ];
  const currentSortOption = sortOptions.find((o) => o.value === sortBy) || sortOptions[0];
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToast, setAddedToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Load catalog data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [resProds, resCats] = await Promise.all([
          fetch(`${API_BASE_URL}/api/productos?activeOnly=true`),
          fetch(`${API_BASE_URL}/api/categorias?activeOnly=true`)
        ]);

        if (!resProds.ok) throw new Error('Error al consultar el catálogo.');
        const dataProds = await resProds.json();
        setProducts(dataProds);

        if (resCats.ok) {
          const dataCats = await resCats.json();
          setCategories(dataCats);
        }
      } catch (err) {
        setError(err.message || 'Error de conexión con el catálogo de NicaLogistics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter & sort logic (instant < 2s response)
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'ALL' || item.categoriaId === selectedCategory;
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          item.nombre.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(term));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.precio || 0) - (b.precio || 0);
        if (sortBy === 'price-desc') return (b.precio || 0) - (a.precio || 0);
        if (sortBy === 'name-asc') return (a.nombre || '').localeCompare(b.nombre || '');
        if (sortBy === 'name-desc') return (b.nombre || '').localeCompare(a.nombre || '');
        if (sortBy === 'stock-desc') return (b.stockActual || 0) - (a.stockActual || 0);
        return 0; // Default featured / server order
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleAddToCart = (product) => {
    const res = addToCart(product, 1);
    if (res.success) {
      setAddedToast({
        title: '¡Producto Agregado!',
        message: `${product.nombre} se sumó a tu carrito de compras.`
      });
      setTimeout(() => setAddedToast(null), 3500);
    } else {
      setAddedToast({
        title: 'Atención',
        message: res.message,
        isError: true
      });
      setTimeout(() => setAddedToast(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Toast Feedback */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
            addedToast.isError 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}>
            <div className={`p-2 rounded-lg ${addedToast.isError ? 'bg-rose-100 text-rose-600' : 'bg-primary-blue text-white'}`}>
              {addedToast.isError ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="text-xs font-montserrat font-bold text-slate-900">{addedToast.title}</p>
              <p className="text-xs text-slate-500 font-inter">{addedToast.message}</p>
            </div>
            <Link 
              href="/carrito" 
              className="ml-2 px-3 py-1.5 bg-primary-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold font-inter transition-colors shadow-sm"
            >
              Ver Carrito
            </Link>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-900 via-primary-blue to-indigo-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent-magenta" />
            <span>Retiro Exclusivo en Ventanilla (Pickup Oficial)</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Catálogo Oficial NicaLogistics
          </h1>
          <p className="font-inter text-blue-100/80 text-sm sm:text-base max-w-2xl leading-relaxed">
            Explora productos tradicionales nicaragüenses (rosquillas, cajetas, quesillo, café de altura y artesanías) y tecnología de alta gama importada desde EE.UU. Retiro en ventanilla oficial en Managua o Miami Hub.
          </p>

          {/* Quick Notice Badge */}
          <div className="pt-2 flex items-center gap-2 text-xs text-blue-200">
            <MapPin className="w-4 h-4 text-accent-magenta shrink-0" />
            <span>Retiro seguro en ventanilla oficial presentando identificación física.</span>
          </div>
        </div>
      </div>

      {/* Filter and Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Search & Sort Card */}
        <Card className="p-4 sm:p-5 shadow-lg border-0 rounded-2xl bg-white mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-96">
              <Input
                icon={Search}
                placeholder="Buscar por producto, marca o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Modern Combobox (Destacados y Criterios) */}
            <div className="relative w-full md:w-auto self-end md:self-center" ref={sortRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 font-inter hidden sm:inline-block">
                  Ordenar por:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-64 h-10 px-3.5 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-primary-blue/50 flex items-center justify-between text-xs font-inter font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all duration-200 group cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                >
                  <div className="flex items-center gap-2 truncate">
                    <currentSortOption.icon className="w-3.5 h-3.5 text-primary-blue shrink-0 group-hover:text-accent-magenta transition-colors" />
                    <span className="truncate">{currentSortOption.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-primary-blue transition-transform duration-200 shrink-0 ${isSortOpen ? 'rotate-180 text-primary-blue' : ''}`} />
                </button>
              </div>

              {/* Dropdown Menu con Sombra Flotante Elegante */}
              {isSortOpen && (
                <div 
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-full sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-[999] max-h-60 overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150"
                  role="listbox"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter border-b border-slate-100 mb-1">
                    Criterio de Orden
                  </div>
                  {sortOptions.map((option) => {
                    const isSelected = sortBy === option.value;
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs font-inter flex items-center justify-between transition-all duration-150 rounded-md my-0.5 text-left ${
                          isSelected
                            ? 'bg-blue-50/90 text-primary-blue font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-primary-blue'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2">
                          <OptionIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-blue' : 'text-slate-400'}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-blue shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoriaId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-primary-blue text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.nombre} ({count})
                </button>
              );
            })}
          </div>
        </Card>

        {/* Catalog Grid Area */}
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary-blue mb-3" />
            <p className="font-montserrat font-bold text-slate-700 text-lg">Cargando catálogo oficial...</p>
            <p className="text-xs text-slate-400 mt-1 font-inter">Conectando con el inventario de NicaLogistics</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 text-alert-amber mx-auto mb-3" />
            <p className="font-montserrat font-bold text-slate-800 text-lg">{error}</p>
            <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="font-montserrat font-bold text-slate-800 text-lg">No encontramos productos</h3>
            <p className="text-xs text-slate-500 mt-1 font-inter leading-relaxed">
              No hay coincidencias con los filtros aplicados. Intenta con otros términos o selecciona otra categoría.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchTerm('');
              }}
            >
              Restablecer Filtros
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 font-inter">
                Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> productos disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockActual <= 0;
                const isLowStock = !isOutOfStock && product.stockActual <= product.stockMinimo;

                return (
                  <Card 
                    key={product.id}
                    className="h-full flex flex-col justify-between group rounded-2xl overflow-hidden border border-slate-200 hover:border-primary-blue/40 hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    {/* Image & Badges Container */}
                    <div 
                      onClick={() => { setQuickViewProduct(product); setQuickViewQty(1); }}
                      className="relative aspect-video sm:aspect-square bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                      title="Haz clic para ver detalles y especificaciones"
                    >
                      {product.imagenUrl ? (
                        <img
                          src={product.imagenUrl}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-slate-300" />
                      )}

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm font-montserrat">
                        {product.categoriaNombre || 'Tecnología'}
                      </span>

                      {/* Stock Warning Badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm font-inter">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-3 right-3 bg-alert-amber text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm font-inter flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          ¡Últimas {product.stockActual}!
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm font-inter">
                          En Stock
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 font-inter uppercase tracking-wider">
                          SKU: {product.sku}
                        </div>
                        <h2 
                          onClick={() => { setQuickViewProduct(product); setQuickViewQty(1); }}
                          className="font-montserrat font-bold text-base text-slate-900 group-hover:text-primary-blue transition-colors line-clamp-2 mt-1 cursor-pointer"
                          title="Ver detalle del producto"
                        >
                          {product.nombre}
                        </h2>
                        {product.descripcion && (
                          <p className="font-inter text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {product.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Sede a Sede Notice */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-inter">
                        <MapPin className="w-3.5 h-3.5 text-accent-magenta shrink-0" />
                        <span>Retiro en Ventanilla (Miami ➔ Sede)</span>
                      </div>

                      {/* Price and Add Button */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-inter uppercase font-semibold">Precio Sede</span>
                          <span className="font-montserrat font-extrabold text-2xl text-slate-900">
                            ${product.precio.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setQuickViewProduct(product); setQuickViewQty(1); }}
                            className="hidden sm:inline-flex text-xs px-2.5"
                            title="Ver ficha completa"
                          >
                            Detalle
                          </Button>
                          <Button
                            variant={isOutOfStock ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={isOutOfStock}
                            icon={ShoppingCart}
                            onClick={() => handleAddToCart(product)}
                            className={isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}
                          >
                            {isOutOfStock ? 'Sin existencias' : 'Agregar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Modal
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          title="Ficha Detallada del Producto"
          description={`Identificador SKU: ${quickViewProduct.sku}`}
          maxWidth="max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
              {quickViewProduct.imagenUrl ? (
                <img
                  src={quickViewProduct.imagenUrl}
                  alt={quickViewProduct.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-20 h-20 text-slate-300" />
              )}
            </div>

            <div className="flex flex-col justify-between space-y-4 font-inter text-xs">
              <div className="space-y-2.5">
                <span className="inline-block bg-blue-50 text-primary-blue font-bold px-2.5 py-1 rounded-lg text-[11px] font-montserrat border border-blue-100">
                  {quickViewProduct.categoriaNombre || 'Categoría Oficial'}
                </span>
                <h3 className="font-montserrat font-extrabold text-lg text-slate-900 leading-snug">
                  {quickViewProduct.nombre}
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {quickViewProduct.descripcion || 'Artículo verificado para logística bilateral Sede a Sede.'}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Existencias Disponibles:</span>
                    <span className={`font-bold ${quickViewProduct.stockActual > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {quickViewProduct.stockActual > 0 ? `${quickViewProduct.stockActual} unidades en bodega` : 'Agotado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-magenta shrink-0" />
                    <span>Retiro físico exclusivo en ventanilla oficial autorizada</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Precio Unitario:</span>
                  <span className="font-montserrat font-extrabold text-2xl text-slate-900">
                    ${quickViewProduct.precio.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 font-bold text-slate-900 font-mono text-xs min-w-[2rem] text-center">
                      {quickViewQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewQty(Math.min(quickViewProduct.stockActual, quickViewQty + 1))}
                      disabled={quickViewQty >= quickViewProduct.stockActual}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={quickViewProduct.stockActual <= 0}
                    icon={ShoppingCart}
                    className="flex-1 justify-center shadow-md font-montserrat font-bold"
                    onClick={() => {
                      const res = addToCart(quickViewProduct, quickViewQty);
                      if (res.success) {
                        setAddedToast({
                          title: '¡Producto Agregado!',
                          message: `${quickViewProduct.nombre} (${quickViewQty}x) se sumó a tu carrito.`
                        });
                        setTimeout(() => setAddedToast(null), 3500);
                        setQuickViewProduct(null);
                      } else {
                        setAddedToast({ title: 'Atención', message: res.message, isError: true });
                        setTimeout(() => setAddedToast(null), 3500);
                      }
                    }}
                  >
                    {quickViewProduct.stockActual <= 0 ? 'Sin existencias' : 'Agregar al Carrito'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
