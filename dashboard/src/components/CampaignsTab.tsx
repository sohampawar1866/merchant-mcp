'use client';

import React, { useState } from 'react';
import { Sparkles, Megaphone, TrendingUp, CheckCircle, Tag, Plus, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function CampaignsTab({ merchantId }: { merchantId: string }) {
  const [campaigns, setCampaigns] = useState([
    {
      id: 'cmp_festive_01',
      name: 'Power Duo: Laptop Stand + RGB Desk Mat',
      discount_percent: 15,
      target_category: 'Desk Gadgets',
      min_bundle_items: 2,
      status: 'active',
      impressions: 48,
      conversions: 12,
      incremental_gmv_inr: '₹14,250.00',
      description: 'Dynamic 15% discount automatically proposed by AI for multi-item workspace orders.',
    },
    {
      id: 'cmp_audio_02',
      name: 'Audiophile Cross-Sell Power Combo',
      discount_percent: 10,
      target_category: 'Audio & Acoustics',
      min_bundle_items: 2,
      status: 'active',
      impressions: 34,
      conversions: 8,
      incremental_gmv_inr: '₹22,400.00',
      description: 'Cross-sell bundle pairing ANC Earbuds with accessory upgrades for higher basket AOV.',
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Figma Signature Story Section: Lilac Color-Block Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/70">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI GROWTH & UPSELL ENGINE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-figma-ink">
            Autonomous Campaign Studio
          </h2>
          <p className="text-sm text-black/80 max-w-xl leading-relaxed">
            Dynamically inject promotional bundle incentives into autonomous AI buyer negotiations while mathematically guaranteeing floor margins.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-center shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Campaign AOV Lift</div>
            <div className="text-2xl font-extrabold text-figma-ink">+28.4%</div>
          </div>
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-center shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Bundle GMV</div>
            <div className="text-2xl font-extrabold text-emerald-700">₹36,650</div>
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
            <div className="text-3xl font-extrabold tracking-tight">2 Bundles</div>
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
            <div className="text-3xl font-extrabold tracking-tight text-emerald-700">₹36,650</div>
            <p className="text-xs text-zinc-500 mt-1">Generated by AI upsell triggers</p>
          </div>
        </div>
      </div>

      {/* Campaigns Listing Card */}
      <div className="rounded-lg bg-white border border-figma-hairline shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex items-center justify-between bg-figma-canvas">
          <div>
            <h3 className="font-bold text-base text-figma-ink">Active Promotional Bundles</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Rules automatically matched by get_upsell_bundle & negotiate_cart_bundle</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">2 campaigns configured</span>
          </div>
        </div>

        <div className="divide-y divide-figma-hairline">
          {campaigns.map((c) => (
            <div key={c.id} className="p-5 sm:p-6 hover:bg-zinc-50/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-figma-lime text-figma-ink border border-black/15 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {c.status}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">ID: {c.id}</span>
                </div>
                <h4 className="font-bold text-base text-figma-ink">{c.name}</h4>
                <p className="text-xs text-zinc-600 max-w-2xl">{c.description}</p>
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
                  <div className="text-sm font-bold text-zinc-900">{c.conversions} / {c.impressions} ({Math.round((c.conversions / c.impressions) * 100)}%)</div>
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
