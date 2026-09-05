'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Megaphone,
  TrendingUp,
  CheckCircle,
  Tag,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  X,
  Percent,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export function CampaignsTab({ merchantId }: { merchantId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    discount_percent: 15,
    target_category: 'Audio',
    min_bundle_items: 2,
  });

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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          name: formData.name.trim(),
          discount_percent: Number(formData.discount_percent),
          target_category: formData.target_category,
          min_bundle_items: Number(formData.min_bundle_items),
          status: 'active',
        }),
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || 'Failed to create campaign');

      setNotification(`Campaign "${formData.name}" launched successfully!`);
      setIsModalOpen(false);
      setFormData({
        name: '',
        discount_percent: 15,
        target_category: 'Audio',
        min_bundle_items: 2,
      });
      await fetchCampaigns();
      setTimeout(() => setNotification(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Figma Signature Story Section: Lilac Color-Block Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
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
          <div className="pt-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-figma-primary text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Campaign</span>
            </button>
          </div>
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
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-figma-canvas">
          <div>
            <h3 className="font-bold text-base text-figma-ink">PostgreSQL Dynamic Promotional Bundles</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Live records from merchant_campaigns table evaluated by get_upsell_bundle</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-figma-primary text-white text-xs font-mono font-semibold hover:bg-zinc-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </button>
            <button
              onClick={fetchCampaigns}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-figma-surfaceSoft hover:bg-zinc-100 text-xs font-mono border border-figma-hairline transition"
              title="Sync Campaigns with PostgreSQL"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
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

      {/* Modal: Create New Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/15 shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-figma-ink">Create New AI Growth Campaign</h3>
                  <p className="text-xs text-gray-500 font-mono">Incentivize AI buyers to add higher-margin bundles</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-mono">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Tech Duo: Earbuds + Fast Charger"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-black font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-mono">
                    Target Category
                  </label>
                  <select
                    value={formData.target_category}
                    onChange={(e) => setFormData({ ...formData, target_category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-black bg-white"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Computing">Computing</option>
                    <option value="Desk Accessories">Desk Accessories</option>
                    <option value="Gourmet Snacks">Gourmet Snacks</option>
                    <option value="Specialty Coffee">Specialty Coffee</option>
                    <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                    <option value="Skincare & Beauty">Skincare & Beauty</option>
                    <option value="General">General / Cross-Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-mono">
                    Min Bundle Items
                  </label>
                  <select
                    value={formData.min_bundle_items}
                    onChange={(e) => setFormData({ ...formData, min_bundle_items: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-black bg-white"
                  >
                    <option value={2}>2 Items</option>
                    <option value={3}>3 Items</option>
                    <option value={4}>4+ Items</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-mono">
                  Bundle Discount Percentage ({formData.discount_percent}%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                    className="flex-1 accent-purple-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="w-14 text-center font-mono font-bold text-sm bg-purple-50 text-purple-700 py-1 rounded-lg border border-purple-200">
                    {formData.discount_percent}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  Discount applies proportionally across line items without crossing floor margins.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 leading-snug">
                ⚡ <strong>AI Growth Engine Rule:</strong> When an AI buyer calls <code className="font-mono bg-white px-1 py-0.5 rounded text-purple-700">get_upsell_bundle</code>, this rule will automatically recommend combo products to raise the cart value.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-figma-primary text-white text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Launching...' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
