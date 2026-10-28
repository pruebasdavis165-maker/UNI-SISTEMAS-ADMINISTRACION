'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  Users, Layers, Package, AlertTriangle, Truck, 
  ArrowRight, ShieldCheck, Building2, Search, BarChart3, TrendingUp 
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';

export default function PanelDashboardPage() {
  const modules = [
    {
      title: 'Gestión de Usuarios y Roles',
      desc: 'Administración de roles (Admin, Vendedor, Logística, Cliente), altas de cuentas y suspensiones (Soft Delete).',
      href: '/panel/usuarios',
      icon: Users,
      color: 'bg-blue-50 text-primary-blue border-blue-200',
      badge: 'Admin',
      badgeVariant: 'blue'
    },
    {
      title: 'Control de Sedes Oficiales',
      desc: 'Supervisión, alta y modificación de parámetros de Sede Central Managua y Sede Miami Hub.',
      href: '/panel/sedes',
      icon: Building2,
      color: 'bg-fuchsia-50 text-accent-magenta border-fuchsia-200',
      badge: 'Admin',
      badgeVariant: 'magenta'
    },
    {
      title: 'Gestión Integral de Productos',
      desc: 'Alta de productos, subida persistente de imágenes en volumen Docker y parametrización de precios USD.',
      href: '/panel/productos',
      icon: Package,
      color: 'bg-emerald-50 text-success-green border-emerald-200',
      badge: 'Admin / Vendedor',
      badgeVariant: 'green'
    },
    {
      title: 'Categorías del Catálogo',
      desc: 'Clasificación de productos disponibles para retiro en ventanillas autorizadas.',
      href: '/panel/categorias',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'Admin / Vendedor',
      badgeVariant: 'blue'
    },
    {
      title: 'Reportes e Inventario (Kardex)',
      desc: 'Kardex de entradas/salidas, auditoría de existencias y alertas visuales en alert-amber ante stock bajo.',
      href: '/panel/inventario',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-alert-amber border-amber-200',
      badge: 'Operaciones',
      badgeVariant: 'amber'
    },
    {
      title: 'Supervisión de Encomiendas',
      desc: 'Control y seguimiento de todos los viajes de encomiendas de clientes, tránsito y entregas con documento de identidad.',
      href: '/panel/logistica',
      icon: Truck,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: 'Logística / Admin',
      badgeVariant: 'blue'
    },
    {
      title: 'Cartera de Clientes (CRM)',
      desc: 'Historial de compras, perfiles de clientes y seguimiento de transacciones comerciales.',
      href: '/panel/clientes',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Comercial CRM',
      badgeVariant: 'magenta'
    },
    {
      title: 'Consulta Global de Rastreo',
      desc: 'Herramienta de búsqueda directa y trazabilidad en tiempo real de códigos de tracking de paquetes.',
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
              <span className="text-xs text-slate-500 font-inter">Panel de Control Operativo</span>
            </div>
            <h1 className="font-montserrat font-extrabold text-3xl text-slate-900 mt-1">
              Centro de Gestión y Control Corporativo
            </h1>
            <p className="font-inter text-xs sm:text-sm text-slate-500">
              Bienvenido al sistema unificado de administración e-commerce, inventario y logística de ventanilla.
            </p>
          </div>
        </div>

        {/* Operational Notice LUMINOSA (Sin fondos negros ni oscuros) */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white text-slate-800 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-soft-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-blue-100 text-primary-blue text-xs font-bold rounded-full uppercase tracking-wider mb-2 font-montserrat">
              Modelo Sede a Sede Oficial
            </span>
            <h2 className="text-xl sm:text-2xl font-montserrat font-extrabold text-slate-900 mb-2">
              Operaciones Centralizadas en Sucursales Autorizadas
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-inter leading-relaxed">
              Todos los pedidos facturados y encomiendas se reciben y retiran en las sedes oficiales (Sede Central Managua y Sede Miami Hub). La plataforma opera bajo el modelo oficial de retiro exclusivo en ventanilla física para máxima seguridad y trazabilidad.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none text-primary-blue">
            <Truck className="w-56 h-56" />
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
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-slate-200 bg-white group-hover:border-primary-blue/40 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div className="p-6">
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
                  <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary-blue group-hover:translate-x-0.5 transition-transform">
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
