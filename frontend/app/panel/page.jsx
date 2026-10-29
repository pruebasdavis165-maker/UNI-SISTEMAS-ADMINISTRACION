'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Layers, Package, AlertTriangle, Truck, 
  ArrowRight, ShieldCheck, Building2, Search, BarChart3, 
  TrendingUp, Clock, CheckCircle2, RefreshCw, AlertCircle 
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
  const [recentShipments, setRecentShipments] = useState([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState([]);
  const [usersDistribution, setUsersDistribution] = useState({ admin: 0, vendedor: 0, logistica: 0, cliente: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const user = getUser();

  const fetchGlobalAnalytics = async () => {
    setIsLoading(true);
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
      const dist = { admin: 0, vendedor: 0, logistica: 0, cliente: 0 };

      if (resUsers && resUsers.ok) {
        const usersData = await resUsers.json();
        uCount = usersData.length || 0;
        usersData.forEach(u => {
          const r = (u.rol || '').toLowerCase();
          if (r.includes('admin')) dist.admin++;
          else if (r.includes('vendedor')) dist.vendedor++;
          else if (r.includes('logistica')) dist.logistica++;
          else dist.cliente++;
        });
        setUsersDistribution(dist);
      }

      if (resProducts && resProducts.ok) {
        const prodData = await resProducts.json();
        pCount = prodData.length || 0;
        const lowStockItems = prodData.filter(p => (p.stockActual || 0) <= (p.stockMinimo || 5));
        lowStock = lowStockItems.length;
        setCriticalStockProducts(lowStockItems.slice(0, 5));
      }

      if (resShipments && resShipments.ok) {
        const shipData = await resShipments.json();
        sCount = shipData.length || 0;
        setRecentShipments(shipData.slice(0, 5));
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

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'REGISTRADA':
        return <Badge variant="blue" size="sm">Registrada</Badge>;
      case 'EN_TRANSITO':
        return <Badge variant="amber" size="sm">En Tránsito</Badge>;
      case 'LISTA_PARA_RETIRO':
        return <Badge variant="green" size="sm">Lista Pickup</Badge>;
      case 'ENTREGADA':
        return <Badge variant="blue" size="sm">Entregada</Badge>;
      default:
        return <Badge size="sm">{estado || 'Pendiente'}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Corporativo del Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-white bg-primary-blue px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ADMINISTRADOR
            </span>
            <span className="text-xs text-slate-500 font-inter">NicaLogistics Enterprise • Supervisión Global</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Dashboard General de Control
          </h1>
          <p className="font-inter text-xs sm:text-sm text-slate-500">
            Métricas ejecutivas de operación bilateral, inventario centralizado y trazabilidad Sede a Sede.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            icon={RefreshCw} 
            onClick={fetchGlobalAnalytics} 
            isLoading={isLoading}
          >
            Actualizar KPIs
          </Button>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas Ejecutivas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Usuarios */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Usuarios Registrados</p>
            <p className="text-2xl font-montserrat font-extrabold text-slate-900 mt-1">
              {isLoading ? '...' : stats.usersCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cuentas y roles activos</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-primary-blue border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Sedes Oficiales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Sedes Oficiales</p>
            <p className="text-2xl font-montserrat font-extrabold text-accent-magenta mt-1">
              {stats.activeSedesCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Miami Hub ⇄ Managua Central</p>
          </div>
          <div className="p-3 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Alertas de Stock */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Alertas de Stock</p>
            <p className="text-2xl font-montserrat font-extrabold text-amber-600 mt-1">
              {isLoading ? '...' : stats.lowStockCount}
            </p>
            <p className="text-[11px] text-alert-amber font-semibold mt-0.5">Productos en nivel crítico</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-alert-amber border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Encomiendas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Total Encomiendas</p>
            <p className="text-2xl font-montserrat font-extrabold text-emerald-600 mt-1">
              {isLoading ? '...' : stats.shipmentsCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Paquetes documentados</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Truck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Grid de Dashboards Operativos: Encomiendas Recientes y Alertas de Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (2/3): Encomiendas Recientes en Tránsito y Retiro */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-primary-blue rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-base text-slate-900">
                  Supervisión de Encomiendas Recientes
                </h3>
                <p className="text-xs text-slate-500">Últimos paquetes procesados en el circuito bilateral</p>
              </div>
            </div>
            <Link 
              href="/panel/logistica" 
              className="text-xs font-semibold text-primary-blue hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentShipments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No hay encomiendas registradas recientemente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Tracking</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Ruta Sede</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-primary-blue">
                        {s.codigoTracking}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {s.clienteNombre || 'Cliente Registrado'}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <span className="truncate max-w-[120px] inline-block">{s.sedeOrigenNombre || 'Miami Hub'}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="truncate max-w-[120px] inline-block font-semibold text-slate-800">{s.sedeDestinoNombre || 'Managua Central'}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(s.estado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Columna Derecha (1/3): Alertas de Stock Crítico */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-alert-amber rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-base text-slate-900">
                  Alertas de Stock
                </h3>
                <p className="text-xs text-slate-500">Productos con existencia crítica</p>
              </div>
            </div>
            <Link 
              href="/panel/inventario" 
              className="text-xs font-semibold text-alert-amber hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              <span>Kardex</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {criticalStockProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>Inventario en niveles óptimos. Sin alertas pendientes.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalStockProducts.map((p) => (
                <div 
                  key={p.id}
                  className="p-3 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{p.nombre}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Mínimo sugerido: {p.stockMinimo || 5} unid.</p>
                  </div>
                  <span className="shrink-0 font-extrabold px-2.5 py-1 rounded-full text-xs bg-amber-500 text-white font-mono">
                    {p.stockActual} disp.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Fila Inferior: Composición de Personal y Estado de Red Física */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta: Distribución de Roles */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-primary-blue" />
            <h3 className="font-montserrat font-bold text-base text-slate-900">
              Distribución de Usuarios por Rol
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold uppercase text-primary-blue block">Admin</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{usersDistribution.admin}</span>
            </div>
            <div className="p-3 bg-fuchsia-50/60 rounded-xl border border-fuchsia-100">
              <span className="text-[10px] font-bold uppercase text-accent-magenta block">Vendedor</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{usersDistribution.vendedor}</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-600 block">Logística</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{usersDistribution.logistica}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Clientes</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{usersDistribution.cliente}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Red Oficial de Sedes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-accent-magenta" />
              <h3 className="font-montserrat font-bold text-base text-slate-900">
                Red Física Autorizada (Pickup Exclusivo)
              </h3>
            </div>
            <Link 
              href="/panel/sedes" 
              className="text-xs font-semibold text-accent-magenta hover:text-fuchsia-700 flex items-center gap-1 transition-colors"
            >
              <span>Gestionar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-slate-900">Sede Miami Hub (USA)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">8400 NW 25th St, Doral, FL</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">● Operando 100% Ventanilla</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-slate-900">Sede Central Managua (NIC)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Km 4.5 Carretera Norte</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">● Operando 100% Ventanilla</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
