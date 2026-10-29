'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Building2, Package, 
  AlertTriangle, Truck, Search, TrendingUp, 
  ShoppingBag, LogOut, X, Menu, ShieldCheck, 
  Layers, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUser, normalizeRole, isInternalRole } from '../lib/auth';

export default function InternalSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const sync = () => setLocalUser(getUser());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('authChanged', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('authChanged', sync);
    };
  }, [pathname]);

  const effectiveUser = auth.user || localUser;
  const effectiveRole = normalizeRole(effectiveUser?.rol);
  const isAdmin = effectiveRole === 'Admin';
  const isVendedor = effectiveRole === 'Vendedor';
  const isLogistica = effectiveRole === 'Logística';

  const handleLogout = () => {
    if (setMobileOpen) setMobileOpen(false);
    auth.logout();
  };

  // Nombres elegantes, concisos y directos por rol (sin desbordamiento)
  let navItems = [];

  if (isAdmin) {
    navItems = [
      { name: 'Dashboard General', href: '/panel', icon: LayoutDashboard, exact: true },
      { name: 'Usuarios y Roles', href: '/panel/usuarios', icon: Users },
      { name: 'Sedes Oficiales', href: '/panel/sedes', icon: Building2 },
      { name: 'Productos y Categorías', href: '/panel/productos', icon: Package },
      { name: 'Inventario y Kardex', href: '/panel/inventario', icon: AlertTriangle },
      { name: 'Supervisión de Encomiendas', href: '/panel/logistica', icon: Truck },
      { name: 'Rastreo Global', href: '/panel/rastreo', icon: Search }
    ];
  } else if (isVendedor) {
    navItems = [
      { name: 'Dashboard Comercial', href: '/panel/vendedor', icon: TrendingUp, exact: true },
      { name: 'Cartera de Clientes', href: '/panel/clientes', icon: Users },
      { name: 'Catálogo de Productos', href: '/panel/catalogo', icon: ShoppingBag },
      { name: 'Inventario y Stock', href: '/panel/inventario', icon: Package }
    ];
  } else if (isLogistica) {
    navItems = [
      { name: 'Tablero Kanban', href: '/panel/logistica', icon: Truck, exact: true },
      { name: 'Sedes Oficiales', href: '/panel/sedes', icon: Building2 },
      { name: 'Rastreo de Encomiendas', href: '/panel/rastreo', icon: Search },
      { name: 'Inventario Kardex', href: '/panel/inventario', icon: AlertTriangle }
    ];
  }

  const renderBadge = () => {
    if (isAdmin) {
      return (
        <span className="text-[10px] font-extrabold text-white bg-primary-blue px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          ADMIN
        </span>
      );
    }
    if (isVendedor) {
      return (
        <span className="text-[10px] font-extrabold text-white bg-accent-magenta px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          VENDEDOR
        </span>
      );
    }
    if (isLogistica) {
      return (
        <span className="text-[10px] font-extrabold text-white bg-amber-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          LOGÍSTICA
        </span>
      );
    }
    return null;
  };

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || (item.href !== '/panel' && pathname?.startsWith(item.href));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top: Header & Navegación */}
      <div className="flex flex-col">
        {/* Cabecera del Sidebar: Logo Oficial NicaLogistics */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link 
            href={isAdmin ? '/panel' : isVendedor ? '/panel/vendedor' : '/panel/logistica'}
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-200 shrink-0 group-hover:border-primary-blue/50 transition-colors">
              <img src="/logo.png" alt="NicaLogistics" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="font-montserrat font-black text-lg text-slate-900 tracking-tight block truncate">
                Nica<span className="text-primary-blue">Logistics</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block -mt-0.5">
                Panel Corporativo
              </span>
            </div>
          </Link>

          {/* Botón cerrar para móvil */}
          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Módulos de Navegación por Rol */}
        <nav className="p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-inter">
            Módulos de Trabajo
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);

            return (
              <Link
                key={item.href + item.name}
                href={item.href}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-inter transition-all ${
                  active
                    ? 'bg-blue-50 text-primary-blue font-bold shadow-xs border border-blue-100/80'
                    : 'text-slate-600 hover:text-primary-blue hover:bg-slate-100/80 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-blue' : 'text-slate-400'}`} />
                <span className="leading-snug">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar: Perfil y Sesión */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sesión Activa
            </span>
            {renderBadge()}
          </div>
          <p className="text-[13px] font-bold text-slate-900 font-montserrat leading-tight break-words">
            {effectiveUser?.nombreCompleto || effectiveUser?.email?.split('@')[0] || 'Colaborador'}
          </p>
          <p className="text-[11px] text-slate-500 font-inter truncate mt-0.5">
            {effectiveUser?.email || 'operaciones@nicalogistics.com'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fijo en escritorio con ancho óptimo w-72 */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col justify-between h-screen fixed left-0 top-0 bottom-0 z-30 select-none">
        {sidebarContent}
      </aside>

      {/* Drawer deslizable en móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
