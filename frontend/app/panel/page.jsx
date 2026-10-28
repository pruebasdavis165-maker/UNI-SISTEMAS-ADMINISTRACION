'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  Users, Layers, Package, AlertTriangle, Truck, 
  ArrowRight, ShieldCheck, Building2, Search, BarChart3, 
  TrendingUp, Clock, CheckCircle2 
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { getToken, API_BASE_URL, getUser } from '../../lib/auth';

export default function PanelDashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    shipmentsCount: 0,
    activeSedesCount: 2
  });
  const [isLoading, setIsLoading] = useState(true);

  const user = getUser();

  useEffect(() => {
    const fetchGlobalAnalytics = async () => {
      try {
        const token = getToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [resUsers, resProducts, resShipments] = await Promise.all([
          fetch(`${API_BASE_URL}/api/usuarios`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/productos`).catch(() => null),
          fetch(`${API_BASE_URL}/api/encomiendas`, { headers }).catch(() => null)
        ]);

        let uCount = 0;
        let pCount = 0;
        let lowStock = 0;
        let sCount = 0;

        if (resUsers && resUsers.ok) {
          const usersData = await resUsers.json();
          uCount = usersData.length || 0;
        }

        if (resProducts && resProducts.ok) {
          const prodData = await resProducts.json();
          pCount = prodData.length || 0;
          lowStock = prodData.filter(p => (p.stockActual || 0) <= (p.stockMinimo || 5)).length;
        }

        if (resShipments && resShipments.ok) {
          const shipData = await resShipments.json();
          sCount = shipData.length || 0;
        }

        setStats({
          usersCount: uCount,
          productsCount: pCount,
          lowStockCount: lowStock,
          shipmentsCount: sCount,
          activeSedesCount: 2
        });
      } catch (e) {
        console.warn('Error cargando analíticas globales:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalAnalytics();
  }, []);

  const modules = [
    {
      title: 'Gestión Integral de Usuarios',
      desc: 'Control de cuentas, roles (Admin, Vendedor, Logística, Cliente), altas y suspensiones (Soft Delete).',
      href: '/panel/usuarios',
      icon: Users,
      color: 'bg-blue-50 text-primary-blue border-blue-200',
      badge: 'Admin',
      badgeVariant: 'blue'
    },
    {
      title: 'Configuración de Sedes Oficiales',
      desc: 'Supervisión y control de parámetros de Sede Central Managua y Sede Miami Hub (Pickup en ventanilla).',
      href: '/panel/sedes',
      icon: Building2,
      color: 'bg-fuchsia-50 text-accent-magenta border-fuchsia-200',
      badge: 'Admin',
      badgeVariant: 'magenta'
    },
    {
      title: 'Gestión de Productos & Precios',
      desc: 'Catálogo oficial, parametrización de precios USD e imágenes en almacenamiento Docker.',
      href: '/panel/productos',
      icon: Package,
      color: 'bg-emerald-50 text-success-green border-emerald-200',
      badge: 'Admin / Comercial',
      badgeVariant: 'green'
    },
    {
      title: 'Categorías del Catálogo',
      desc: 'Clasificación estructurada de productos disponibles para retiro en ventanillas autorizadas.',
      href: '/panel/categorias',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'Catálogo',
      badgeVariant: 'blue'
    },
    {
      title: 'Inventario & Kardex (Stock)',
      desc: 'Auditoría de existencias con alertas visuales en alert-amber ante stock bajo y movimientos.',
      href: '/panel/inventario',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-alert-amber border-amber-200',
      badge: 'Stock & Alertas',
      badgeVariant: 'amber'
    },
    {
      title: 'Supervisión de Encomiendas',
      desc: 'Supervisión global de todos los viajes de encomiendas de clientes y entregas contra documento de identidad.',
      href: '/panel/logistica',
      icon: Truck,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: 'Logística Total',
      badgeVariant: 'blue'
    },
    {
      title: 'Cartera de Clientes (CRM 360)',
      desc: 'Expedientes comerciales, histórico de compras y trazabilidad de pedidos de clientes.',
      href: '/panel/clientes',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'CRM 360',
      badgeVariant: 'magenta'
    },
    {
      title: 'Consulta Global de Rastreo',
      desc: 'Trazabilidad y verificación en tiempo real de estados de paquetes para operadores y clientes.',
      href: '/rastreo',
      icon: Search,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      badge: 'Trazabilidad',
      badgeVariant: 'green'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Vendedor', 'Logística']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">NicaLogistics Enterprise</Badge>
              <span className="text-xs text-slate-500 font-inter">Panel de Control Total • Administrador</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Centro de Gestión y Control Corporativo
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Supervisión integral de usuarios, sedes oficiales, inventario y todos los viajes de encomiendas.
            </p>
          </div>
        </div>

        {/* Global Statistics Cards (Accents: #1A56DB, #D946EF, #F59E0B, emerald) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Usuarios del Sistema</p>
              <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">
                {isLoading ? '...' : stats.usersCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cuentas y roles registrados</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-primary-blue border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Sedes Oficiales</p>
              <p className="text-2xl font-montserrat font-extrabold text-accent-magenta mt-1">
                {stats.activeSedesCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Miami Hub ⇄ Managua</p>
            </div>
            <div className="p-3 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Alertas de Stock</p>
              <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">
                {isLoading ? '...' : stats.lowStockCount}
              </p>
              <p className="text-[11px] text-alert-amber font-semibold mt-0.5">Productos con stock bajo</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-alert-amber border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Total Encomiendas</p>
              <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">
                {isLoading ? '...' : stats.shipmentsCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Viajes y despachos de clientes</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Truck className="w-6 h-6" />
            </div>
          </div>

        </div>


        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link 
                key={m.href} 
                href={m.href}
                className="group block"
              >
                <div className="h-full bg-white border border-slate-200 hover:border-primary-blue/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl border ${m.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant={m.badgeVariant} size="sm">{m.badge}</Badge>
                    </div>
                    <h3 className="font-montserrat font-bold text-base text-slate-900 group-hover:text-primary-blue transition-colors">
                      {m.title}
                    </h3>
                    <p className="font-inter text-xs text-slate-500 mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary-blue group-hover:translate-x-0.5 transition-transform">
                    <span>Acceder al módulo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
