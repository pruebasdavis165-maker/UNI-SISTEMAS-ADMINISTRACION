'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, Menu, X, MapPin, Search, LogOut, 
  ShoppingBag, LayoutDashboard, Users, Building2, 
  Package, Layers, AlertTriangle, Truck, UserCheck, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUser, normalizeRole, isInternalRole } from '../lib/auth';

// Función para formatear el nombre del cliente (Primer Nombre y Primer Apellido, sin paréntesis)
function formatDisplayName(fullName) {
  if (!fullName) return 'Cliente';
  const cleaned = fullName.split(' (')[0].trim();
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length <= 2) return cleaned;
  return parts.slice(0, 2).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();
  const auth = useAuth();
  
  // Respaldo de sincronización inmediata con localStorage para evitar desfasaje en montaje
  const [localUser, setLocalUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const syncImmediate = () => {
      const u = getUser();
      setLocalUser(u);
    };

    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('nicalogistics_cart') || '[]');
        const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    syncImmediate();
    updateCart();

    window.addEventListener('storage', syncImmediate);
    window.addEventListener('storage', updateCart);
    window.addEventListener('authChanged', syncImmediate);
    window.addEventListener('cartUpdated', updateCart);

    return () => {
      window.removeEventListener('storage', syncImmediate);
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('authChanged', syncImmediate);
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, [pathname]);

  // Usuario efectivo: prioridad al estado de context, con fallback a localStorage
  const effectiveUser = auth.user || localUser;
  const effectiveRole = normalizeRole(effectiveUser?.rol);
  const isAuthenticated = !!effectiveUser;
  const isInternal = isAuthenticated && isInternalRole(effectiveRole);
  const isAdmin = isAuthenticated && effectiveRole === 'Admin';
  const isVendedor = isAuthenticated && effectiveRole === 'Vendedor';
  const isLogistica = isAuthenticated && effectiveRole === 'Logística';
  const isCliente = isAuthenticated && effectiveRole === 'Cliente';

  const handleLogout = () => {
    setIsOpen(false);
    auth.logout();
  };

  const isPanelRoute = pathname?.startsWith('/panel') || pathname?.startsWith('/admin');

  // Supresión absoluta de la Navbar superior pública para personal interno o rutas de panel/admin
  if (isInternal || isPanelRoute) {
    return null;
  }

  // Helper para clases de enlace activo
  const getLinkClass = (href) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return `transition-colors flex items-center gap-1.5 py-1 text-sm font-inter ${
      isActive 
        ? 'text-primary-blue font-bold border-b-2 border-primary-blue' 
        : 'text-slate-600 hover:text-primary-blue font-medium'
    }`;
  };

  const renderRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-block text-[10px] font-bold text-white bg-primary-blue px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          ADMIN
        </span>
      );
    }
    if (isVendedor) {
      return (
        <span className="inline-block text-[10px] font-bold text-white bg-accent-magenta px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          VENDEDOR
        </span>
      );
    }
    if (isLogistica) {
      return (
        <span className="inline-block text-[10px] font-bold text-white bg-alert-amber px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          LOGÍSTICA
        </span>
      );
    }
    return (
      <span className="inline-block text-[10px] font-bold text-white bg-success-green px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
        CLIENTE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm">
      {/* Top Banner Informativo: Solo en vistas públicas para clientes, NUNCA en paneles corporativos */}
      {!isInternal && !isPanelRoute && (
        <div className="bg-primary-blue text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
          <span>Comercio Bilateral y Transporte Miami Hub ⇄ Sede Central Managua • Retiro Exclusivo en Ventanilla</span>
        </div>
      )}

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* 1. Logotipo Corporativo */}
          <Link 
            href={isInternal ? (isAdmin ? '/panel' : isVendedor ? '/panel/vendedor' : '/panel/logistica') : '/'} 
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-soft-sm border border-slate-200 flex items-center justify-center bg-white p-1 group-hover:scale-105 transition-transform">
              <img 
                src="/logo.png" 
                alt="NicaLogistics Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-montserrat font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                Nica<span className="text-primary-blue">Logistics</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-accent-magenta leading-tight mt-1 whitespace-nowrap">
                Miami Hub ⇄ Managua
              </span>
            </div>
          </Link>

          {/* 2. Enlaces Centrales Simplificados y Segregados por Rol */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            
            {/* ROL: ADMINISTRADOR (Exclusivamente módulos de gestión corporativa) */}
            {isAdmin && (
              <>
                <Link href="/panel" className={getLinkClass('/panel')}>
                  <LayoutDashboard className="w-4 h-4 text-primary-blue" />
                  <span>Panel General</span>
                </Link>
                <Link href="/panel/usuarios" className={getLinkClass('/panel/usuarios')}>
                  <Users className="w-4 h-4 text-primary-blue" />
                  <span>Usuarios</span>
                </Link>
                <Link href="/panel/sedes" className={getLinkClass('/panel/sedes')}>
                  <Building2 className="w-4 h-4 text-accent-magenta" />
                  <span>Sedes</span>
                </Link>
                <Link href="/panel/productos" className={getLinkClass('/panel/productos')}>
                  <Package className="w-4 h-4 text-success-green" />
                  <span>Productos</span>
                </Link>
                <Link href="/panel/inventario" className={getLinkClass('/panel/inventario')}>
                  <AlertTriangle className="w-4 h-4 text-alert-amber" />
                  <span>Inventario</span>
                </Link>
                <Link href="/panel/logistica" className={getLinkClass('/panel/logistica')}>
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Supervisión Encomiendas</span>
                </Link>
                <Link href="/rastreo" className={getLinkClass('/rastreo')}>
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Rastreo Global</span>
                </Link>
              </>
            )}

            {/* ROL: VENDEDOR (Módulos de ventas y catálogo comercial) */}
            {isVendedor && (
              <>
                <Link href="/panel/vendedor" className={getLinkClass('/panel/vendedor')}>
                  <LayoutDashboard className="w-4 h-4 text-accent-magenta" />
                  <span>Panel Comercial</span>
                </Link>
                <Link href="/panel/clientes" className={getLinkClass('/panel/clientes')}>
                  <Users className="w-4 h-4 text-primary-blue" />
                  <span>Clientes CRM</span>
                </Link>
                <Link href="/catalogo" className={getLinkClass('/catalogo')}>
                  <Package className="w-4 h-4 text-success-green" />
                  <span>Catálogo de Productos</span>
                </Link>
                <Link href="/panel/inventario" className={getLinkClass('/panel/inventario')}>
                  <AlertTriangle className="w-4 h-4 text-alert-amber" />
                  <span>Inventario & Stock</span>
                </Link>
              </>
            )}

            {/* ROL: LOGÍSTICA (Operaciones de ventanilla y control de rutas) */}
            {isLogistica && (
              <>
                <Link href="/panel/logistica" className={getLinkClass('/panel/logistica')}>
                  <Truck className="w-4 h-4 text-primary-blue" />
                  <span>Tablero Operativo</span>
                </Link>
                <Link href="/sedes" className={getLinkClass('/sedes')}>
                  <MapPin className="w-4 h-4 text-accent-magenta" />
                  <span>Sedes Oficiales</span>
                </Link>
                <Link href="/rastreo" className={getLinkClass('/rastreo')}>
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Rastreo de Encomiendas</span>
                </Link>
                <Link href="/panel/inventario" className={getLinkClass('/panel/inventario')}>
                  <AlertTriangle className="w-4 h-4 text-alert-amber" />
                  <span>Inventario Kardex</span>
                </Link>
              </>
            )}

            {/* ROL: CLIENTE AUTENTICADO */}
            {isCliente && (
              <>
                <Link href="/" className={getLinkClass('/')}>
                  Inicio
                </Link>
                <Link href="/catalogo" className={getLinkClass('/catalogo')}>
                  Catálogo
                </Link>
                <Link href="/rastreo" className={getLinkClass('/rastreo')}>
                  <Search className="w-4 h-4 text-primary-blue" />
                  <span>Rastreo</span>
                </Link>
                <Link href="/sedes" className={getLinkClass('/sedes')}>
                  <MapPin className="w-4 h-4 text-accent-magenta" />
                  <span>Sedes</span>
                </Link>
                <Link href="/mis-pedidos" className={getLinkClass('/mis-pedidos')}>
                  <ShoppingBag className="w-4 h-4 text-primary-blue" />
                  <span>Mis Pedidos</span>
                </Link>
              </>
            )}

            {/* INVITADO (Público no logueado) */}
            {!isAuthenticated && (
              <>
                <Link href="/" className={getLinkClass('/')}>
                  Inicio
                </Link>
                <Link href="/catalogo" className={getLinkClass('/catalogo')}>
                  Catálogo
                </Link>
                <Link href="/rastreo" className={getLinkClass('/rastreo')}>
                  <Search className="w-4 h-4 text-primary-blue" />
                  <span>Rastreo</span>
                </Link>
                <Link href="/sedes" className={getLinkClass('/sedes')}>
                  <MapPin className="w-4 h-4 text-accent-magenta" />
                  <span>Sedes</span>
                </Link>
              </>
            )}

          </div>

          {/* 3. Acciones de Usuario y Sesión (Derecha) */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* Carrito de Compras: OCULTO POR COMPLETO A TODO EL PERSONAL INTERNO (Admin, Vendedor, Logística) */}
            {!isInternal && (
              <Link 
                href="/carrito" 
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-primary-blue hover:border-primary-blue/30 hover:bg-slate-50 transition-all shadow-xs"
                title="Ver Carrito de Compras"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent-magenta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Bloque de Sesión Activa */}
            {isAuthenticated && effectiveUser ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800 font-montserrat tracking-tight whitespace-nowrap" title={effectiveUser.nombreCompleto}>
                    {formatDisplayName(effectiveUser.nombreCompleto)}
                  </span>
                  <div className="mt-0.5">
                    {renderRoleBadge()}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer"
                  title="Cerrar Sesión Activa"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-blue transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-blue hover:bg-blue-700 rounded-xl shadow-soft-sm hover:shadow-soft-md transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <div className="lg:hidden flex items-center gap-2">
            {!isInternal && (
              <Link 
                href="/carrito" 
                className="relative p-2 text-slate-700 border border-slate-200 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-magenta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Abrir Menú"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 font-inter shadow-lg">
          {isAuthenticated && effectiveUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 font-montserrat">
                  {formatDisplayName(effectiveUser.nombreCompleto)}
                </p>
                <div className="mt-1">
                  {renderRoleBadge()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}

          {/* Móvil: Administrador */}
          {isAdmin && (
            <>
              <Link href="/panel" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Panel General
              </Link>
              <Link href="/panel/usuarios" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Gestión de Usuarios
              </Link>
              <Link href="/panel/sedes" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Control de Sedes
              </Link>
              <Link href="/panel/productos" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Productos
              </Link>
              <Link href="/panel/inventario" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Inventario & Kardex
              </Link>
              <Link href="/panel/logistica" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Supervisión Encomiendas
              </Link>
              <Link href="/rastreo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Rastreo Global
              </Link>
            </>
          )}

          {/* Móvil: Vendedor */}
          {isVendedor && (
            <>
              <Link href="/panel/vendedor" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-accent-magenta">
                Panel Comercial
              </Link>
              <Link href="/panel/clientes" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-accent-magenta">
                Clientes CRM
              </Link>
              <Link href="/catalogo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-accent-magenta">
                Catálogo de Productos
              </Link>
              <Link href="/panel/inventario" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-accent-magenta">
                Inventario & Stock
              </Link>
            </>
          )}

          {/* Móvil: Logística */}
          {isLogistica && (
            <>
              <Link href="/panel/logistica" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Tablero Operativo
              </Link>
              <Link href="/sedes" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Sedes Oficiales
              </Link>
              <Link href="/rastreo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Rastreo de Encomiendas
              </Link>
              <Link href="/panel/inventario" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Inventario Kardex
              </Link>
            </>
          )}

          {/* Móvil: Cliente */}
          {isCliente && (
            <>
              <Link href="/" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Inicio
              </Link>
              <Link href="/catalogo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Catálogo de Productos
              </Link>
              <Link href="/rastreo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Rastreo de Encomiendas
              </Link>
              <Link href="/sedes" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Directorio de Sedes
              </Link>
              <Link href="/mis-pedidos" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Mis Pedidos
              </Link>
            </>
          )}

          {/* Móvil: Invitado */}
          {!isAuthenticated && (
            <>
              <Link href="/" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Inicio
              </Link>
              <Link href="/catalogo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Catálogo de Productos
              </Link>
              <Link href="/rastreo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Rastreo de Encomiendas
              </Link>
              <Link href="/sedes" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Directorio de Sedes
              </Link>
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-primary-blue hover:bg-blue-700 rounded-xl shadow-soft-sm"
                >
                  Registrarse
                </Link>
              </div>
            </>
          )}

        </div>
      )}
    </header>
  );
}
