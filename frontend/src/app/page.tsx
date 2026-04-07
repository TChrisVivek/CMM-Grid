"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import {
  IndianRupee, Package, FolderKanban, AlertTriangle,
  Warehouse, ArrowLeftRight, TrendingUp, Clock, RefreshCw,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

interface Metrics {
  totalStockValue: number;
  totalSkus: number;
  activeProjects: number;
  lowStockCount: number;
  warehouseQtyTotal: number;
  allocatedQtyTotal: number;
  completedProjects: number;
  totalProjects: number;
  totalAllocations: number;
}

interface Allocation {
  id: number;
  productName: string;
  productSku: string;
  productUnit: string;
  projectName: string;
  quantity: number;
  allocatedDate: string;
}

interface Project {
  id: number;
  name: string;
  siteAddress: string;
  status: string;
}

const EMPTY: Metrics = {
  totalStockValue: 0, totalSkus: 0, activeProjects: 0,
  lowStockCount: 0, warehouseQtyTotal: 0, allocatedQtyTotal: 0,
  completedProjects: 0, totalProjects: 0, totalAllocations: 0,
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [mRes, aRes, pRes] = await Promise.all([
        fetch("/api/dashboard/metrics"),
        fetch("/api/allocations"),
        fetch("/api/projects"),
      ]);
      const mData = await mRes.json();
      const aData = await aRes.json();
      const pData = await pRes.json();
      // Guard against offline error objects instead of arrays
      if (!mData.error) setMetrics(mData);
      setAllocations(Array.isArray(aData) ? aData : []);
      setProjects(Array.isArray(pData) ? pData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const recentAllocations = [...allocations].reverse().slice(0, 5);
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const warehousePct = metrics.warehouseQtyTotal + metrics.allocatedQtyTotal > 0
    ? Math.round((metrics.warehouseQtyTotal / (metrics.warehouseQtyTotal + metrics.allocatedQtyTotal)) * 100)
    : 0;

  const Skeleton = () => <div className="h-5 bg-space-blue-light rounded animate-pulse" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest">CMM Electricals</span>
            <span className="text-glass-border">|</span>
            <span className="text-xs text-text-secondary font-mono">EOD Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Operations Dashboard</h1>
          <p className="text-text-secondary mt-1 text-sm">Real-time overview of warehouse stock and active project allocations.</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg glass glass-hover text-text-secondary hover:text-cyan-glow transition-all" title="Refresh">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Stock Value" value={loading ? "—" : formatCurrency(metrics.totalStockValue)} subtitle="Warehouse goods (at unit price)" icon={IndianRupee} variant="cyan" />
        <MetricCard title="Active Projects" value={loading ? "—" : String(metrics.activeProjects)} subtitle="Sites receiving materials" icon={FolderKanban} variant="purple" />
        <MetricCard title="Total SKUs" value={loading ? "—" : formatNumber(metrics.totalSkus)} subtitle={loading ? "" : `${formatNumber(metrics.warehouseQtyTotal)} units in warehouse`} icon={Package} variant="success" />
        <MetricCard title="Low Stock Alerts" value={loading ? "—" : String(metrics.lowStockCount)} subtitle="Items below threshold" icon={AlertTriangle} variant="warning" />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass glass-hover rounded-2xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Warehouse size={18} className="text-cyan-glow" />
            <span className="text-sm font-semibold text-text-primary">Warehouse Stock</span>
          </div>
          {loading ? <Skeleton /> : <p className="text-2xl font-bold text-text-primary tabular-nums">{formatNumber(metrics.warehouseQtyTotal)}</p>}
          <p className="text-xs text-text-secondary mt-1">Total units available</p>
          <div className="mt-3 h-1.5 rounded-full bg-space-blue-light overflow-hidden">
            <div className="h-full rounded-full bg-cyan-glow-grad transition-all duration-700" style={{ width: `${warehousePct}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-1.5">vs {formatNumber(metrics.allocatedQtyTotal)} allocated to sites</p>
        </div>

        <div className="glass glass-hover rounded-2xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <ArrowLeftRight size={18} className="text-purple-soft" />
            <span className="text-sm font-semibold text-text-primary">Allocated to Sites</span>
          </div>
          {loading ? <Skeleton /> : <p className="text-2xl font-bold text-text-primary tabular-nums">{formatNumber(metrics.allocatedQtyTotal)}</p>}
          <p className="text-xs text-text-secondary mt-1">Units dispatched in total</p>
          <div className="mt-3 h-1.5 rounded-full bg-space-blue-light overflow-hidden">
            <div className="h-full rounded-full bg-purple-glow-grad transition-all duration-700" style={{ width: `${100 - warehousePct}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-1.5">{metrics.totalAllocations} allocation entries</p>
        </div>

        <div className="glass glass-hover rounded-2xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={18} className="text-success" />
            <span className="text-sm font-semibold text-text-primary">Completion Rate</span>
          </div>
          {loading ? <Skeleton /> : (
            <p className="text-2xl font-bold text-text-primary">
              {metrics.totalProjects > 0 ? Math.round((metrics.completedProjects / metrics.totalProjects) * 100) : 0}%
            </p>
          )}
          <p className="text-xs text-text-secondary mt-1">Projects completed</p>
          <div className="mt-3 h-1.5 rounded-full bg-space-blue-light overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-success to-cyan-glow transition-all duration-700"
              style={{ width: metrics.totalProjects > 0 ? `${Math.round((metrics.completedProjects / metrics.totalProjects) * 100)}%` : "0%" }} />
          </div>
          <p className="text-xs text-text-secondary mt-1.5">{metrics.completedProjects} of {metrics.totalProjects} projects done</p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Allocations */}
        <div className="glass rounded-2xl overflow-hidden shadow-card animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
            <div className="flex items-center gap-2"><Clock size={15} className="text-cyan-glow" /><h2 className="text-sm font-semibold text-text-primary">Recent Allocations</h2></div>
            <Link href="/allocations" className="text-xs text-cyan-glow hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="divide-y divide-glass-border/50">{[...Array(4)].map((_, i) => <div key={i} className="px-5 py-3.5"><Skeleton /></div>)}</div>
          ) : recentAllocations.length === 0 ? (
            <div className="px-5 py-10 text-center text-text-secondary text-sm">No allocations yet — <Link href="/allocations" className="text-cyan-glow hover:underline">add one</Link></div>
          ) : (
            <div className="divide-y divide-glass-border/50">
              {recentAllocations.map((a) => (
                <div key={a.id} className="flex items-start justify-between px-5 py-3.5 table-row-hover">
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">{a.productName}</p>
                    <p className="text-xs text-text-secondary truncate mt-0.5">{a.projectName}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-mono font-semibold text-purple-soft">×{a.quantity}</p>
                    <p className="text-xs text-text-secondary">{a.productUnit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="glass rounded-2xl overflow-hidden shadow-card animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
            <div className="flex items-center gap-2"><FolderKanban size={15} className="text-purple-soft" /><h2 className="text-sm font-semibold text-text-primary">Active Project Sites</h2></div>
            <Link href="/projects" className="text-xs text-cyan-glow hover:underline">Manage</Link>
          </div>
          {loading ? (
            <div className="space-y-2 p-5">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-space-blue-light rounded-xl animate-pulse" />)}</div>
          ) : activeProjects.length === 0 ? (
            <div className="px-5 py-10 text-center text-text-secondary text-sm">No active projects — <Link href="/projects" className="text-cyan-glow hover:underline">add one</Link></div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4">
              {activeProjects.map((p) => (
                <div key={p.id} className="glass-hover rounded-xl p-3.5 border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
                    <span className="text-xs font-semibold text-success uppercase tracking-wide">Active</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                  {p.siteAddress && <p className="text-xs text-text-secondary mt-0.5">{p.siteAddress}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
