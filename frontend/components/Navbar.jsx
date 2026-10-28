'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart, User, Menu, X, MapPin, Search, LogOut, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Check local storage for session and cart count
    const storedUser = localStorage.getItem('nicalogistics_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('nicalogistics_cart') || '[]');
      const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(count);
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
    localStorage.removeItem('nicalogistics_token');
    localStorage.removeItem('nicalogistics_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm">
      {/* Top Banner Informativo Sede a Sede */}
      <div className="bg-primary-blue text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
        <span>Comercio Bilateral y Transporte de Carga Miami Hub ⇄ Sede Central Managua • Retiro Oficial en Ventanilla</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Corporativo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-soft-md border border-slate-100 flex items-center justify-center bg-white p-1">
              <img 
                src="/logo.png" 
                alt="NicaLogistics Logo" 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <span className="font-montserrat font-extrabold text-2xl tracking-tight text-slate-900 flex items-center">
                Nica<span className="text-primary-blue">Logistics</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-accent-magenta">
                Comercio Bilateral & Logística Miami ⇄ Managua
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 font-inter font-medium text-sm text-slate-600">
            <Link href="/" className="hover:text-primary-blue transition-colors">
              Inicio
            </Link>
            <Link href="/catalogo" className="hover:text-primary-blue transition-colors">
              Catálogo
            </Link>
            <Link href="/rastreo" className="hover:text-primary-blue transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-primary-blue" />
              Rastreo
            </Link>
            <Link href="/sedes" className="hover:text-primary-blue transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent-magenta" />
              Sedes
            </Link>
            {user && (
              <Link href="/mis-pedidos" className="hover:text-primary-blue transition-colors flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-primary-blue" />
                Mis Pedidos
              </Link>
            )}
            {user && (user.rol === 'Admin' || user.rol === 'Vendedor' || user.rol === 'Logística') && (
              <Link href="/panel" className="text-primary-blue font-semibold hover:underline">
                Panel Interno
              </Link>
            )}
          </div>

          {/* User & Cart Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Carrito */}
            <Link 
              href="/carrito" 
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-primary-blue hover:border-primary-blue/30 hover:bg-slate-50 transition-all"
              title="Ver Carrito de Compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent-magenta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{user.nombreCompleto}</p>
                  <span className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full bg-primary-blue uppercase">
                    {user.rol}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              href="/carrito" 
              className="relative p-2 text-slate-700"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-magenta text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 font-inter shadow-lg">
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
            Catálogo
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
            Sedes de Retiro en Ventanilla
          </Link>

          {user && (
            <Link 
              href="/mis-pedidos" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-blue font-semibold"
            >
              Mis Pedidos y Encomiendas
            </Link>
          )}

          {user && (user.rol === 'Admin' || user.rol === 'Vendedor' || user.rol === 'Logística') && (
            <Link 
              href="/panel" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-blue font-bold"
            >
              Panel Administrativo
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{user.nombreCompleto}</p>
                  <p className="text-xs text-slate-500">{user.email} ({user.rol})</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold border border-slate-200 rounded-xl"
                >
                  Ingresar
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
