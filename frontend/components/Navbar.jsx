'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, Menu, X, MapPin, Search, LogOut, 
  ShoppingBag, LayoutDashboard, Users, Building2, 
  Package, Layers, AlertTriangle, Truck, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, isInternal, isAdmin, isVendedor, isLogistica, isCliente, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Cargar contador de carrito solo para clientes o invitados
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('nicalogistics_cart') || '[]');
        const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart);

    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  // Helper para clases activas en enlaces
  const getLinkClass = (href) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return `transition-colors flex items-center gap-1.5 py-1 ${
      isActive 
        ? 'text-primary-blue font-bold border-b-2 border-primary-blue' 
        : 'text-slate-600 hover:text-primary-blue font-medium'
    }`;
  };

  // Badge de rol estilizado con colores corporativos
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
      {/* Top Banner Informativo Sede a Sede */}
      <div className="bg-primary-blue text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
        <span>Comercio Bilateral y Transporte Miami Hub ⇄ Sede Central Managua • Retiro Exclusivo en Ventanilla</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* 1. Logotipo e Identidad (Izquierda) */}
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
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 font-inter text-sm">
            
            {/* Caso A: Administrador (Solo módulos de administración integral) */}
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
                  <span>Supervisión Logística</span>
                </Link>
                <Link href="/rastreo" className={getLinkClass('/rastreo')}>
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Rastreo Global</span>
                </Link>
              </>
            )}

            {/* Caso B: Vendedor (Módulos comerciales y catálogo) */}
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

            {/* Caso C: Logística (Tablero operativo y rastreo de envíos) */}
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

            {/* Caso D: Cliente Autenticado */}
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

            {/* Caso E: Invitado (Público no logueado) */}
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
            
            {/* Carrito de Compras: OCULTO ESTRICTAMENTE PARA TODO EL PERSONAL INTERNO (Admin, Vendedor, Logística) */}
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
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 font-montserrat tracking-tight max-w-[150px] truncate" title={user.nombreCompleto}>
                    {user.nombreCompleto}
                  </span>
                  <div className="mt-0.5">
                    {renderRoleBadge()}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all shadow-xs"
                  title="Cerrar Sesión Activa"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 font-montserrat truncate max-w-[200px]">
                  {user.nombreCompleto}
                </p>
                <div className="mt-1">
                  {renderRoleBadge()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}

          {/* Enlaces Móviles para Administrador */}
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
                Supervisión Logística
              </Link>
              <Link href="/rastreo" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-primary-blue">
                Rastreo Global
              </Link>
            </>
          )}

          {/* Enlaces Móviles para Vendedor */}
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

          {/* Enlaces Móviles para Logística */}
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

          {/* Enlaces Móviles para Cliente */}
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

          {/* Enlaces Móviles para Invitado */}
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
