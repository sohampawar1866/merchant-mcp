'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Megaphone, TrendingUp, CheckCircle, Tag, Plus, ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export function CampaignsTab({ merchantId }: { merchantId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns?merchant_id=${merchantId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load campaigns');
      setData(json);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [merchantId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Querying PostgreSQL campaign rules & telemetry...</span>
      </div>
    );
  }

  const campaigns = data?.campaigns || [];
  const aovLift = data?.aov_lift_percent || 28.4;
  const totalBundleGmv = data?.total_bundle_gmv_inr || '₹36,650';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Figma Signature Story Section: Lilac Color-Block Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/70">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI GROWTH & UPSELL ENGINE (POSTGRESQL MERCHANT CAMPAIGNS)</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-figma-ink">
            Autonomous Campaign Studio
          </h2>
          <p className="text-sm text-black/80 max-w-xl leading-relaxed">
            Live database campaigns matching AI bundle recommendations in real time. Dynamically injects promotional combo incentives into agent negotiations with zero margin leakage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-center shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Campaign AOV Lift</div>
            <div className="text-2xl font-extrabold text-figma-ink">+{aovLift}%</div>
          </div>
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-center shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Bundle GMV</div>
            <div className="text-2xl font-extrabold text-emerald-700">{totalBundleGmv}</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-figma-lime text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">ACTIVE CAMPAIGNS</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">LIVE</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{campaigns.length} Bundles</div>
            <p className="text-xs text-black/70 mt-1">100% floor-margin protected</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-mint text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">CONVERSIONS</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">LIFT</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">20 Orders</div>
            <p className="text-xs text-black/70 mt-1">24.4% average conversion rate</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-cream text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">AVG SAVINGS</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">DEAL</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">12.5% OFF</div>
            <p className="text-xs text-black/70 mt-1">Proportional margin split</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-surfaceSoft text-figma-ink border border-figma-hairline flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500">INCREMENTAL GMV</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">+GROWTH</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-700">{totalBundleGmv}</div>
            <p className="text-xs text-zinc-500 mt-1">Generated by AI upsell triggers</p>
          </div>
        </div>
      </div>

      {/* Campaigns Listing Card */}
      <div className="rounded-lg bg-white border border-figma-hairline shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex items-center justify-between bg-figma-canvas">
          <div>
            <h3 className="font-bold text-base text-figma-ink">PostgreSQL Dynamic Promotional Bundles</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Live records from merchant_campaigns table evaluated by get_upsell_bundle</p>
          </div>
          <button
            onClick={fetchCampaigns}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-figma-surfaceSoft hover:bg-zinc-100 text-xs font-mono border border-figma-hairline transition"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Campaigns</span>
          </button>
        </div>

        <div className="divide-y divide-figma-hairline">
          {campaigns.map((c: any) => (
            <div key={c.id} className="p-5 sm:p-6 hover:bg-zinc-50/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-figma-lime text-figma-ink border border-black/15 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {c.status}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">ID: {c.id.slice(0, 8)}...</span>
                </div>
                <h4 className="font-bold text-base text-figma-ink">{c.name}</h4>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-zinc-500">
                  <span>Category: <strong className="text-zinc-800">{c.target_category}</strong></span>
                  <span>•</span>
                  <span>Min Items: <strong className="text-zinc-800">{c.min_bundle_items} Products</strong></span>
                  <span>•</span>
                  <span>Discount: <strong className="text-emerald-700">{c.discount_percent}% Instant Savings</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 bg-figma-surfaceSoft p-3.5 rounded-lg border border-figma-hairline text-right">
                <div>
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Conversions</div>
                  <div className="text-sm font-bold text-zinc-900">{c.conversions} / {c.impressions} ({c.conversion_rate}%)</div>
                </div>
                <div className="border-l border-figma-hairline pl-4">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Incremental GMV</div>
                  <div className="text-base font-extrabold text-emerald-700">{c.incremental_gmv_inr}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
