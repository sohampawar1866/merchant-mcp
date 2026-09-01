'use client';

import React, { useState } from 'react';
import { Sparkles, Megaphone, TrendingUp, CheckCircle, Tag, Plus, ArrowUpRight } from 'lucide-react';

export function CampaignsTab({ merchantId }: { merchantId: string }) {
  const [campaigns, setCampaigns] = useState([
    {
      id: 'cmp_festive_01',
      name: 'Festive Developer Setup Bundle',
      discount_percent: 15,
      target_category: 'Desk Accessories',
      min_bundle_items: 2,
      status: 'active',
      impressions: 48,
      conversions: 12,
      incremental_gmv_inr: '₹14,250.00',
    },
    {
      id: 'cmp_audio_02',
      name: 'Audiophile Cross-Sell Power Duo',
      discount_percent: 10,
      target_category: 'Audio',
      min_bundle_items: 2,
      status: 'active',
      impressions: 34,
      conversions: 8,
      incremental_gmv_inr: '₹22,400.00',
    },
  ]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 rounded-[32px] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AI Growth & Upsell Orchestrator
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Autonomous Campaign Studio
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Dynamically inject promotional bundle incentives and category discounts into autonomous AI buyer negotiations while mathematically guaranteeing floor margins.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-sm text-center">
              <div className="text-xs text-zinc-500 font-mono uppercase">Campaign AOV Lift</div>
              <div className="text-2xl font-bold text-amber-600">+28.4%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200 shadow-sm text-center">
              <div className="text-xs text-zinc-500 font-mono uppercase">Total Bundle GMV</div>
              <div className="text-2xl font-bold text-zinc-900">₹36,650</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-[28px] bg-white border border-zinc-200 hover:border-amber-300 transition-all shadow-sm space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase">
                    {c.status}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">ID: {c.id}</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{c.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-center">
              <div>
                <div className="text-xs text-zinc-500">Discount</div>
                <div className="text-base font-bold text-zinc-900">{c.discount_percent}% OFF</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Min Items</div>
                <div className="text-base font-bold text-zinc-900">{c.min_bundle_items} Products</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Category</div>
                <div className="text-base font-bold text-zinc-900">{c.target_category}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-sm">
              <div className="text-zinc-500">
                Conversions: <strong className="text-zinc-900">{c.conversions}</strong> / {c.impressions} ({Math.round((c.conversions / c.impressions) * 100)}%)
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Incremental GMV</div>
                <div className="font-bold text-emerald-600">{c.incremental_gmv_inr}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
