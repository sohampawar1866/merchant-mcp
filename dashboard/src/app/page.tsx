'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Package,
  RefreshCw,
  Zap,
  Sliders,
  Store,
  ArrowRight,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { OverviewTab } from '@/components/OverviewTab';
import { AuditTrailTab } from '@/components/AuditTrailTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { CatalogTab } from '@/components/CatalogTab';
import { CampaignsTab } from '@/components/CampaignsTab';
import { SettingsModal } from '@/components/SettingsModal';
import { Sparkles } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// No-Merchant Error Screen
// ─────────────────────────────────────────────────────────────────────────────
function NoMerchantScreen() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/merchants')
      .then((res) => res.json())
      .then((data) => {
        if (data.merchants) setMerchants(data.merchants);
      })
      .catch((err) => console.error('Failed to load merchants list:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-figma-canvas flex flex-col items-center justify-center p-6 text-figma-ink">
      <div className="max-w-4xl w-full text-center space-y-6">
        {/* Icon & Brand */}
        <div className="w-14 h-14 rounded-2xl bg-figma-primary text-white flex items-center justify-center mx-auto shadow-md">
          <Store className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-figma-ink">
            Select a Merchant Store
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Choose any of the registered merchant stores below to view their live catalog, autonomous pricing policies, orders, and wallet ledger.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-400 font-mono text-xs animate-pulse">
            Loading merchant stores...
          </div>
        ) : merchants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left max-h-[55vh] overflow-y-auto p-2 bg-white rounded-2xl border border-black/10 shadow-xs">
            {merchants.map((m) => (
              <a
                key={m.id}
                href={`/?merchant_id=${m.id}`}
                className="p-3.5 rounded-xl border border-black/10 hover:border-black hover:shadow-md transition bg-zinc-50/70 hover:bg-white flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-figma-ink group-hover:text-black">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-figma-lime text-figma-ink border border-black/15 font-bold uppercase">
                      {m.product_count} items
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 truncate">
                    key: {m.api_key}
                  </div>
                </div>
                <div className="mt-3 text-[11px] font-mono text-blue-600 font-medium flex items-center gap-1">
                  Launch Store <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono text-amber-800">
            No merchants found. Register your first store at /onboard.
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="/onboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-figma-primary text-white font-medium text-xs hover:bg-zinc-800 transition shadow-xs"
          >
            <Store className="w-3.5 h-3.5" />
            Register New Store
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Merchant Not Found Error Screen
// ─────────────────────────────────────────────────────────────────────────────
function MerchantNotFoundScreen({ merchantId }: { merchantId: string }) {
  return (
    <div className="min-h-screen bg-figma-canvas flex flex-col items-center justify-center p-6 text-figma-ink">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-figma-ink">Store Not Found</h1>
          <p className="text-sm text-zinc-500 mt-2">
            No merchant with ID <code className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{merchantId}</code> exists on this platform.
          </p>
        </div>
        <div className="text-left p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800 font-mono">
          <div className="font-bold uppercase tracking-wider text-xs text-red-600 mb-2">Possible Causes</div>
          <div>• The ID was copied incorrectly</div>
          <div>• The merchant was deleted from the platform</div>
          <div>• The wrong database is connected</div>
        </div>
        <a
          href="/onboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-figma-primary text-white font-medium text-sm hover:bg-zinc-800 transition"
        >
          <Store className="w-4 h-4" />
          Register a New Store
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Content
// ─────────────────────────────────────────────────────────────────────────────
function DashboardContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get('merchant_id');

  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'transactions' | 'catalog' | 'campaigns'>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsError, setMetricsError] = useState('');
  const [merchantNotFound, setMerchantNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!merchantId) return;
    try {
      const res = await fetch(`/api/metrics?merchant_id=${merchantId}`);
      const data = await res.json();
      if (res.status === 404) {
        setMerchantNotFound(true);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch gateway metrics');
      }
      setMetrics(data);
      setMetricsError('');
    } catch (e: any) {
      setMetricsError(e.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [merchantId]);

  // ── Gate: no merchant_id in URL ──────────────────────────────────────────
  if (!merchantId) return <NoMerchantScreen />;

  // ── Gate: merchant not found ─────────────────────────────────────────────
  if (merchantNotFound) return <MerchantNotFoundScreen merchantId={merchantId} />;

  const navItems = [
    { id: 'overview', label: 'Store Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'audit', label: 'Customer Activity', shortLabel: 'Activity', icon: Activity },
    { id: 'transactions', label: 'Orders & Payments', shortLabel: 'Orders', icon: CreditCard },
    { id: 'catalog', label: 'Catalog & Pricing', shortLabel: 'Catalog', icon: Package },
    { id: 'campaigns', label: 'AI Growth & Campaigns', shortLabel: 'Campaigns', icon: Sparkles },
  ];

  const [allMerchants, setAllMerchants] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/merchants')
      .then((res) => res.json())
      .then((data) => {
        if (data.merchants) setAllMerchants(data.merchants);
      })
      .catch(() => {});
  }, []);

  const merchantName = metrics?.merchant?.name || '';

  return (
    <div className="min-h-screen flex flex-col bg-figma-canvas text-figma-ink pb-16 lg:pb-0 w-full overflow-x-hidden">
      {/* Pinned Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-figma-canvas border-b border-figma-hairline w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Wordmark & Glyph & Store Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="/" className="w-8 h-8 rounded-lg bg-figma-primary text-white flex items-center justify-center p-1.5 select-none" title="Back to All Stores">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain filter invert brightness-0" />
            </a>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-sm sm:text-base font-semibold text-figma-ink tracking-tight hidden sm:inline">
                AgenticCheckout
              </h1>
              {allMerchants.length > 0 && (
                <select
                  value={merchantId || ''}
                  onChange={(e) => {
                    window.location.href = `/?merchant_id=${e.target.value}`;
                  }}
                  className="text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 border border-black/15 rounded-full px-2.5 py-1 text-figma-ink max-w-[160px] sm:max-w-[220px] truncate cursor-pointer transition"
                  title="Switch Active Store"
                >
                  {allMerchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Desktop Nav-Pill-Group (>= 1024px) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-figma-surfaceSoft border border-figma-hairline shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition duration-150 whitespace-nowrap font-medium ${
                    isActive
                      ? 'bg-figma-primary text-figma-onPrimary shadow-xs'
                      : 'text-figma-ink hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition shadow-sm"
              title="Open Customer UPI Circle Simulator (Port 3002) in a new window for split-screen demo"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer UPI App (:3002)</span>
            </a>

            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-figma-lime text-figma-ink border border-black/15 text-[11px] font-mono tracking-wider uppercase font-bold select-none">
              <Zap className="w-3 h-3 fill-figma-ink" />
              <span>ONLINE</span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-figma-surfaceSoft hover:bg-zinc-100 text-figma-ink flex items-center gap-1.5 transition border border-figma-hairline text-xs font-mono font-bold tracking-wider uppercase"
              title="Configure store guardrails & feature flags live"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Policies</span>
            </button>

            <button
              onClick={fetchMetrics}
              className="w-8 h-8 rounded-full bg-figma-surfaceSoft hover:bg-figma-hairline text-figma-ink flex items-center justify-center transition border border-figma-hairline"
              title="Refresh store metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Figma Marquee Strip */}
        <div className="bg-figma-inverseCanvas text-figma-inverseInk h-7 px-3 sm:px-6 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase select-none w-full overflow-hidden">
          <span className="truncate text-[10px] sm:text-[11px]">Autonomous AI Storefront • Protected Floor Pricing • Instant Razorpay Webhooks</span>
          <span className="hidden md:inline-block text-[10px] text-zinc-400 shrink-0">ENGINE v1.0.0</span>
        </div>

        {/* Mobile & Tablet 5-Column Tab Bar */}
        <div className="xl:hidden border-t border-figma-hairline bg-figma-canvas px-1.5 py-1 w-full overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 min-w-max sm:grid sm:grid-cols-5 sm:min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex flex-col sm:flex-row items-center justify-center py-1.5 px-2 sm:px-1 rounded-full text-xs transition ${
                    isActive
                      ? 'bg-figma-primary text-figma-onPrimary font-medium'
                      : 'text-figma-ink hover:bg-figma-surfaceSoft'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:mr-1 mb-0.5 sm:mb-0" />
                  <span className="text-[10px] sm:text-[11px] leading-tight truncate">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Floor */}
      <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
        {activeTab === 'overview' && (
          <OverviewTab
            merchantId={merchantId}
            metrics={metrics}
            error={metricsError}
            loading={!metrics && !metricsError}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        )}
        {activeTab === 'audit' && <AuditTrailTab merchantId={merchantId} />}
        {activeTab === 'transactions' && <TransactionsTab merchantId={merchantId} />}
        {activeTab === 'catalog' && <CatalogTab merchantId={merchantId} />}
        {activeTab === 'campaigns' && <CampaignsTab merchantId={merchantId} />}
      </main>

      {/* Live Store Guardrails & Settings Modal */}
      <SettingsModal
        merchantId={merchantId}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={fetchMetrics}
      />

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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-figma-canvas flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-figma-primary rounded-full animate-spin"></div>
            Loading store control plane...
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

