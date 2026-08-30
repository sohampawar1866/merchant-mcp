'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, CreditCard, Package, RefreshCw, Bot, ExternalLink } from 'lucide-react';
import { OverviewTab } from '@/components/OverviewTab';
import { AuditTrailTab } from '@/components/AuditTrailTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { CatalogTab } from '@/components/CatalogTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'transactions' | 'catalog'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsError, setMetricsError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch gateway metrics');
      }
      setMetrics(data);
      setMetricsError('');
    } catch (e: any) {
      console.error('Failed to load metrics:', e);
      setMetricsError(e.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'transactions', label: 'Orders & Transactions', icon: CreditCard },
    { id: 'catalog', label: 'Store Catalog', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#071324]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0c2340]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-md">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">AgenticCheckout</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Razorpay MCP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Merchant Control Plane & Agentic Commerce Gateway</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 bg-[#061220] p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} error={metricsError} loading={!metrics && !metricsError} onNavigate={(tab) => setActiveTab(tab as any)} />
        )}
        {activeTab === 'audit' && <AuditTrailTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'catalog' && <CatalogTab />}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/80 text-center text-xs text-slate-500 flex items-center justify-between px-8 bg-[#091629]">
        <span>AgenticCheckout Gateway • Razorpay AI Buildathon 2026</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            PostgreSQL & Redis Connected
          </span>
          <span className="font-mono text-[11px]">v0.1.0-release</span>
        </div>
      </footer>
    </div>
  );
}
