'use client';

import React from 'react';
import {
  TrendingUp,
  CreditCard,
  Percent,
  Bot,
  Package,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface OverviewProps {
  metrics: any;
  error?: string;
  loading: boolean;
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ metrics, error, loading, onNavigate }: OverviewProps) {
  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white">Database Gateway Connection Error</h3>
            <p className="text-sm text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#071324] border border-rose-900/60 font-mono text-xs space-y-2 text-slate-300">
          <div className="text-sky-400 font-semibold">Troubleshooting Steps:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Ensure PostgreSQL is running: <span className="text-white">docker compose up -d postgres</span></li>
            <li>Verify DATABASE_URL credentials in <span className="text-white">.env</span> or <span className="text-white">.env.local</span></li>
            <li>Check database migrations status with <span className="text-white">go run server/cmd/main.go</span></li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mr-3"></div>
        Loading live metrics from gateway...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total AI Revenue (GMV)',
      value: `₹${metrics.revenue?.formatted_rupees || '0.00'}`,
      subtitle: `${metrics.orders?.paid || 0} settled orders`,
      icon: TrendingUp,
      accent: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    },
    {
      title: 'Agent Checkouts',
      value: metrics.orders?.total || 0,
      subtitle: `${metrics.orders?.paid || 0} paid (${metrics.orders?.total > 0 ? Math.round((metrics.orders.paid / metrics.orders.total) * 100) : 100}% conversion)`,
      icon: CreditCard,
      accent: 'border-sky-500/30 bg-sky-950/20 text-sky-400',
    },
    {
      title: 'Negotiation Win Rate',
      value: `${metrics.negotiations?.success_rate_percent || 100}%`,
      subtitle: `${metrics.negotiations?.approved || 0} approved / ${metrics.negotiations?.rejected || 0} rejected`,
      icon: Percent,
      accent: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400',
    },
    {
      title: 'Agent Invocations',
      value: metrics.agent_activity?.total_tool_calls || 0,
      subtitle: `Avg response: ${metrics.agent_activity?.avg_latency_ms || 0}ms`,
      icon: Bot,
      accent: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c2340] via-[#0f2e54] to-[#0c2340] border border-sky-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MCP Gateway Live
            </span>
            <span className="text-xs text-slate-400 font-mono">mark3labs/mcp-go 2024-11-05</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AgenticCheckout Command Center</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time control plane for autonomous buyer agents. Evaluates pure-logic pricing, safeguards profit margins, and manages Razorpay payment links with zero financial hallucination risk.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('audit')}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition shadow-sm flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" /> View Audit Trail
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-[#0e1e36] border border-slate-800 shadow-md hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-lg border ${card.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="text-xs text-slate-400 mt-1">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety & Rule Properties Card */}
        <div className="p-6 rounded-xl bg-[#0e1e36] border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              Active Merchant Guardrails & Security
            </h3>
            <span className="text-xs text-slate-400 font-mono">100% Deterministic</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-lg bg-[#071324] border border-slate-800/80">
              <div className="text-xs font-semibold text-sky-400 mb-1">Zero Margin Leakage</div>
              <p className="text-xs text-slate-300">
                Floor prices and discount ladder positions are strictly omitted from all MCP tool responses.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#071324] border border-slate-800/80">
              <div className="text-xs font-semibold text-emerald-400 mb-1">LLM Never Decides Money</div>
              <p className="text-xs text-slate-300">
                Prices and discounts are evaluated by pure Go integer arithmetic in paise.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#071324] border border-slate-800/80">
              <div className="text-xs font-semibold text-amber-400 mb-1">Idempotency Guaranteed</div>
              <p className="text-xs text-slate-300">
                Redis and PostgreSQL unique constraints prevent double charging on agent retry.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#071324] border border-slate-800/80">
              <div className="text-xs font-semibold text-purple-400 mb-1">HMAC-SHA256 Verified</div>
              <p className="text-xs text-slate-300">
                Constant-time webhook signature verification confirms legitimate Razorpay bank captures.
              </p>
            </div>
          </div>
        </div>

        {/* Catalog Quick Stats */}
        <div className="p-6 rounded-xl bg-[#0e1e36] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Catalog Summary
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Products Listed</span>
              <span className="font-semibold text-white">{metrics.catalog?.total_products || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Units In Stock</span>
              <span className="font-semibold text-white">{metrics.catalog?.total_stock || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Active Categories</span>
              <span className="font-semibold text-sky-400">Audio, Wearables, Computing, Smart Home</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="w-full mt-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            Manage Catalog Products <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
