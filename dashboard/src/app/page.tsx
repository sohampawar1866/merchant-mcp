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
} from 'lucide-react';
import { OverviewTab } from '@/components/OverviewTab';
import { AuditTrailTab } from '@/components/AuditTrailTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { CatalogTab } from '@/components/CatalogTab';
import { CampaignsTab } from '@/components/CampaignsTab';
import { WalletTab } from '@/components/WalletTab';
import { SettingsModal } from '@/components/SettingsModal';
import { Sparkles, Wallet as WalletIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// No-Merchant Error Screen
// ─────────────────────────────────────────────────────────────────────────────
function NoMerchantScreen() {
  return (
    <div className="min-h-screen bg-figma-canvas flex flex-col items-center justify-center p-6 text-figma-ink">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-figma-ink">No Store Selected</h1>
          <p className="text-sm text-zinc-500 mt-2">
            This control plane requires a <strong>Merchant ID</strong> to load your store's data.
            You have not passed a <code className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">merchant_id</code> in the URL.
          </p>
        </div>

        {/* Error detail card */}
        <div className="text-left p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 font-mono space-y-1">
          <div className="font-bold uppercase tracking-wider text-xs text-amber-600 mb-2">How to fix</div>
          <div>1. Register a new store at <strong>/onboard</strong></div>
          <div>2. Copy the Merchant ID you receive</div>
          <div>3. Access the dashboard as:</div>
          <div className="mt-1 px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs break-all">
            /?merchant_id=<span className="text-amber-700">your-id-here</span>
          </div>
        </div>

        {/* Action */}
        <a
          href="/onboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-figma-primary text-white font-medium text-sm hover:bg-zinc-800 transition shadow-sm"
        >
          <Store className="w-4 h-4" />
          Register Your Store
          <ArrowRight className="w-4 h-4" />
        </a>

        <p className="text-xs text-zinc-400 font-mono">
          Already have an ID? Add <code>?merchant_id=...</code> to the URL above.
        </p>
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

  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'transactions' | 'catalog' | 'campaigns' | 'wallets'>('overview');
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
    { id: 'wallets', label: 'Autonomous Wallets', shortLabel: 'Wallets', icon: WalletIcon },
  ];

  const merchantName = metrics?.merchant?.name || '';

  return (
    <div className="min-h-screen flex flex-col bg-figma-canvas text-figma-ink pb-16 lg:pb-0 w-full overflow-x-hidden">
      {/* Pinned Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-figma-canvas border-b border-figma-hairline w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Wordmark & Glyph */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-figma-primary text-white flex items-center justify-center p-1.5 select-none">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain filter invert brightness-0" />
            </div>
            <div>
              <h1 className="font-sans text-sm sm:text-base font-semibold text-figma-ink tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                AgenticCheckout
                {merchantName && (
                  <span className="text-zinc-400 font-normal hidden sm:inline"> / {merchantName}</span>
                )}
              </h1>
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

        {/* Mobile & Tablet 6-Column Tab Bar */}
        <div className="xl:hidden border-t border-figma-hairline bg-figma-canvas px-1.5 py-1 w-full overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 min-w-max sm:grid sm:grid-cols-6 sm:min-w-0">
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
        {activeTab === 'wallets' && <WalletTab merchantId={merchantId} />}
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

