'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  Users, Layers, Package, AlertTriangle, Truck, 
  ArrowRight, ShieldCheck, ShoppingCart, TrendingUp 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../components/ui';

export default function PanelDashboardPage() {
  const modules = [
    {
      title: 'Gestión de Usuarios',
      desc: 'Administración de roles (Admin, Vendedor, Logística, Cliente), altas y suspensiones.',
      href: '/panel/usuarios',
      icon: Users,
      color: 'bg-blue-50 text-primary-blue border-primary-blue/30',
      badge: 'Admin',
      badgeVariant: 'blue'
    },
    {
      title: 'Categorías',
      desc: 'Clasificación de productos disponibles para retiro en sucursales autorizadas.',
      href: '/panel/categorias',
      icon: Layers,
      color: 'bg-fuchsia-50 text-accent-magenta border-accent-magenta/30',
      badge: 'Admin/Vendedor',
      badgeVariant: 'magenta'
    },
    {
      title: 'Catálogo de Productos',
      desc: 'Alta de productos, subida de imágenes a volumen persistente y precios en USD.',
      href: '/panel/productos',
      icon: Package,
      color: 'bg-emerald-50 text-success-green border-success-green/30',
      badge: 'Admin/Vendedor',
      badgeVariant: 'green'
    },
    {
      title: 'Control de Inventario',
      desc: 'Kardex de movimientos de stock, auditoría y alertas visuales de umbral crítico.',
      href: '/panel/inventario',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-alert-amber border-alert-amber/30',
      badge: 'Operaciones',
      badgeVariant: 'amber'
    },
    {
      title: 'Cartera de Clientes (CRM)',
      desc: 'Historial de compras, perfiles de clientes y seguimiento de encomiendas Sede a Sede.',
      href: '/panel/clientes',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'CRM',
      badgeVariant: 'blue'
    },
    {
      title: 'Módulo Logístico & Encomiendas',
      desc: 'Gestión de paquetes en tránsito y entregas finales en ventanilla oficial.',
      href: '/panel/logistica',
      icon: Truck,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: 'Logística',
      badgeVariant: 'amber'
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
              <span className="text-xs text-slate-400 font-inter">Panel de Control Operativo</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Centro de Gestión Interna
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Bienvenido al sistema unificado de administración e-commerce y logística de ventanilla.
            </p>
          </div>
        </div>

        {/* Operational Notice */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              Modelo Sede a Sede
            </span>
            <h2 className="text-xl sm:text-2xl font-montserrat font-extrabold mb-2">
              Operaciones Centralizadas en Sucursales
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-inter leading-relaxed">
              Todos los pedidos facturados y encomiendas se reciben y retiran en las sedes oficiales (Miami Hub, Managua, León, Estelí). La plataforma no procesa entregas a domicilio.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <Truck className="w-56 h-56" />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link 
                key={m.href} 
                href={m.href}
                className="group block"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-slate-200 group-hover:border-primary-blue/40 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl border ${m.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant={m.badgeVariant} size="sm">{m.badge}</Badge>
                    </div>
                    <h3 className="font-montserrat font-bold text-lg text-slate-900 group-hover:text-primary-blue transition-colors">
                      {m.title}
                    </h3>
                    <p className="font-inter text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary-blue group-hover:translate-x-0.5 transition-transform">
                    <span>Acceder al módulo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
