'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, MapPin, Search, LogOut, ShoppingBag, LayoutDashboard, UserCheck } from 'lucide-react';
import { getUser, clearSession } from '../lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // 1. Cargar usuario inicial
    const syncUser = () => {
      const currentUser = getUser();
      setUser(currentUser);
    };

    // 2. Cargar contador de carrito
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('nicalogistics_cart') || '[]');
        const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    syncUser();
    updateCart();

    window.addEventListener('storage', syncUser);
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('authChanged', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('authChanged', syncUser);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    window.location.href = '/';
  };

  const isAdmin = user?.rol === 'Admin';
  const isEmployee = user && ['Admin', 'Vendedor', 'Logística'].includes(user?.rol);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm">
      {/* Top Banner Informativo Sede a Sede */}
      <div className="bg-primary-blue text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
        <span>Comercio Bilateral y Transporte de Carga Miami Hub ⇄ Sede Central Managua • Retiro Oficial en Ventanilla</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* 1. Logotipo e Identidad (Izquierda) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
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

          {/* 2. Enlaces de Navegación Centrales (Centro) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-inter font-medium text-sm text-slate-600">
            <Link href="/" className="hover:text-primary-blue transition-colors">
              Inicio
            </Link>
            <Link href="/catalogo" className="hover:text-primary-blue transition-colors">
              Catálogo
            </Link>
            <Link href="/rastreo" className="hover:text-primary-blue transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-primary-blue" />
              <span>Rastreo</span>
            </Link>
            <Link href="/sedes" className="hover:text-primary-blue transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent-magenta" />
              <span>Sedes</span>
            </Link>

            {/* Mis Pedidos: Visible para clientes y vendedores logueados, no para Admin */}
            {user && !isAdmin && (
              <Link href="/mis-pedidos" className="hover:text-primary-blue transition-colors flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-primary-blue" />
                <span>Mis Pedidos</span>
              </Link>
            )}

            {/* Acceso directo al Panel para Colaboradores y Admin */}
            {isEmployee && (
              <Link 
                href="/panel" 
                className="flex items-center gap-1.5 text-primary-blue font-bold hover:text-blue-800 transition-colors bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100"
              >
                <LayoutDashboard className="w-4 h-4 text-primary-blue" />
                <span>{isAdmin ? 'Panel Administrador' : 'Panel Interno'}</span>
              </Link>
            )}
          </div>

          {/* 3. Acciones de Usuario y Sesión (Derecha) */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* Carrito de Compras: OCULTO POR COMPLETO AL ADMINISTRADOR */}
            {!isAdmin && (
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
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 font-montserrat tracking-tight max-w-[140px] truncate" title={user.nombreCompleto}>
                    {user.nombreCompleto}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-white bg-primary-blue px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5 shadow-xs">
                    {user.rol}
                  </span>
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
            {!isAdmin && (
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
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-700 font-medium hover:text-primary-blue"
          >
            Inicio
          </Link>
          <Link 
            href="/catalogo" 
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-700 font-medium hover:text-primary-blue"
          >
            Catálogo de Productos
          </Link>
          <Link 
            href="/rastreo" 
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-700 font-medium hover:text-primary-blue"
          >
            Rastreo de Encomiendas
          </Link>
          <Link 
            href="/sedes" 
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-700 font-medium hover:text-primary-blue"
          >
            Directorio de Sedes Oficiales
          </Link>

          {user && !isAdmin && (
            <Link 
              href="/mis-pedidos" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-blue font-semibold"
            >
              Mis Pedidos y Encomiendas
            </Link>
          )}

          {isEmployee && (
            <Link 
              href="/panel" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-blue font-bold"
            >
              {isAdmin ? 'Panel de Control Administrador' : 'Panel Operativo'}
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm font-montserrat">{user.nombreCompleto}</p>
                    <span className="text-[10px] font-bold text-white bg-primary-blue px-2 py-0.5 rounded-full uppercase">
                      {user.rol}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold border border-slate-200 rounded-xl"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-primary-blue rounded-xl"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
