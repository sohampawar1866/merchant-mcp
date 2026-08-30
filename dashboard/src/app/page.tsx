'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Package,
  RefreshCw,
  Zap,
} from 'lucide-react';
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
    { id: 'overview', label: 'Store Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'audit', label: 'Customer Activity', shortLabel: 'Activity', icon: Activity },
    { id: 'transactions', label: 'Orders & Payments', shortLabel: 'Orders', icon: CreditCard },
    { id: 'catalog', label: 'Catalog & Pricing', shortLabel: 'Catalog', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-figma-canvas text-figma-ink pb-16 lg:pb-0">
      {/* Pinned Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-figma-canvas border-b border-figma-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Wordmark & Glyph */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-figma-primary text-white flex items-center justify-center p-1.5 select-none">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain filter invert brightness-0" />
            </div>
            <div>
              <h1 className="font-sans text-base font-semibold text-figma-ink tracking-tight">
                AgenticCheckout
              </h1>
            </div>
          </div>

          {/* Desktop Nav-Pill-Group (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-figma-surfaceSoft border border-figma-hairline">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm transition duration-150 whitespace-nowrap font-medium ${
                    isActive
                      ? 'bg-figma-primary text-figma-onPrimary shadow-xs'
                      : 'text-figma-ink hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-figma-lime text-figma-ink border border-black/15 text-xs font-mono tracking-wider uppercase font-bold select-none">
              <Zap className="w-3 h-3 fill-figma-ink" />
              <span>AGENTIC STORE ONLINE</span>
            </div>

            <button
              onClick={fetchMetrics}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-figma-surfaceSoft hover:bg-figma-hairline text-figma-ink flex items-center justify-center transition border border-figma-hairline"
              title="Refresh store metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Figma Marquee Strip */}
        <div className="bg-figma-inverseCanvas text-figma-inverseInk h-7 px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase select-none">
          <span className="truncate">Autonomous AI Storefront • Protected Floor Pricing • Instant Razorpay Webhook</span>
          <span className="hidden sm:inline-block text-[10px] text-zinc-400">ENGINE v1.0.0</span>
        </div>

        {/* Mobile & Tablet 4-Column Tab Bar */}
        <div className="lg:hidden border-t border-figma-hairline bg-figma-canvas px-2 py-1.5">
          <nav className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-full text-xs transition ${
                    isActive
                      ? 'bg-figma-primary text-figma-onPrimary font-medium'
                      : 'text-figma-ink hover:bg-figma-surfaceSoft'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[11px] leading-tight truncate">
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Floor */}
      <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            metrics={metrics}
            error={metricsError}
            loading={!metrics && !metricsError}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        )}
        {activeTab === 'audit' && <AuditTrailTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'catalog' && <CatalogTab />}
      </main>

      {/* Figma Monochrome Footer */}
      <footer className="mt-auto bg-figma-canvas border-t border-figma-hairline py-6 px-4 sm:px-6 text-xs text-figma-ink flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-[11px] tracking-wider uppercase">
          <span className="font-sans font-bold text-xs text-figma-ink capitalize">AgenticCheckout</span>
          <span>•</span>
          <span>Merchant AI Autonomous Commerce Hub</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono tracking-wider uppercase">
          <span className="flex items-center gap-1.5 text-figma-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-figma-success"></span>
            Razorpay Live
          </span>
          <span className="text-zinc-500">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}





