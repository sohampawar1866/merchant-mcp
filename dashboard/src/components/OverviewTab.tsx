'use client';

import React from 'react';
import {
  TrendingUp,
  CreditCard,
  Percent,
  Package,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Lock,
  ExternalLink,
  Plus,
  Clock,
  Check,
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
      <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-cal-ink">Store Database Connection Notice</h3>
            <p className="text-sm text-rose-300/80 mt-0.5">{error}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-cal-card border border-cal-border text-sm space-y-2 text-cal-muted">
          <div className="text-cal-ink font-semibold">How to reconnect:</div>
          <ul className="list-disc list-inside space-y-1 text-cal-muted">
            <li>Ensure your PostgreSQL database service is active</li>
            <li>Verify database credentials in your configuration</li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-cal-muted gap-3">
        <div className="w-8 h-8 border-2 border-cal-border border-t-cal-ink rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading live store metrics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'TOTAL AI SALES',
      value: `₹${metrics.revenue?.formatted_rupees || '0'}`,
      subtitle: `${metrics.orders?.paid || 0} orders paid & settled`,
      icon: TrendingUp,
      badge: 'REVENUE',
      bgClass: 'bg-figma-lime text-figma-ink',
    },
    {
      title: 'TOTAL ORDERS',
      value: metrics.orders?.total || 0,
      subtitle: `${metrics.orders?.paid || 0} settled (${metrics.orders?.total > 0 ? Math.round((metrics.orders.paid / metrics.orders.total) * 100) : 100}% conversion)`,
      icon: CreditCard,
      badge: 'ORDERS',
      bgClass: 'bg-figma-lilac text-figma-ink',
    },
    {
      title: 'MARGIN DEFENSE',
      value: '100% Defended',
      subtitle: `${metrics.negotiations?.rejected || 0} lowballs deflected • ${metrics.negotiations?.approved || 0} closed`,
      icon: ShieldCheck,
      badge: 'PROTECTED',
      bgClass: 'bg-figma-mint text-figma-ink',
    },
    {
      title: 'LIVE CATALOG',
      value: `${metrics.catalog?.total_products || 0} Products`,
      subtitle: `${metrics.catalog?.total_stock || 0} units in stock`,
      icon: Package,
      badge: 'INVENTORY',
      bgClass: 'bg-figma-cream text-figma-ink',
    },
  ];

  const recentOrders = metrics.recent_orders || [];
  const recentActivity = metrics.recent_activity || [];

  // Transform raw developer telemetry into plain-English merchant stories
  const formatMerchantActivity = (act: any) => {
    const tool = act.tool_name || '';
    const input = act.input || {};
    const output = act.output || {};
    const decision = act.decision || '';

    if (tool === 'webhook_razorpay') {
      return {
        title: 'Payment Confirmed & Settled',
        desc: 'Customer payment verified via Razorpay webhook',
        badge: 'PAID',
        badgeClass: 'bg-figma-mint text-figma-ink border border-black/10',
      };
    }

    if (tool === 'negotiate_offer') {
      const offered = input.offered_price_rupees || (input.offered_price_paise ? Math.round(input.offered_price_paise / 100) : null);
      if (decision === 'approved') {
        return {
          title: 'Discount Bargain Approved',
          desc: offered ? `Accepted customer offer of ₹${offered.toLocaleString('en-IN')} (Above floor price)` : 'Approved discount within safe configured margin rules',
          badge: 'APPROVED',
          badgeClass: 'bg-figma-lime text-figma-ink border border-black/10',
        };
      } else {
        return {
          title: 'Margin Shield Defended',
          desc: offered ? `Blocked lowball ₹${offered.toLocaleString('en-IN')} (Protected private floor price)` : 'Blocked offer below your minimum secret price',
          badge: 'DEFENDED',
          badgeClass: 'bg-figma-coral text-figma-ink border border-black/10',
        };
      }
    }

    if (tool === 'create_checkout') {
      const price = output.amount_rupees || (output.agreed_price ? Math.round(output.agreed_price / 100) : null);
      return {
        title: '1-Click Checkout Link Created',
        desc: price ? `Generated secure Razorpay payment link for ₹${price.toLocaleString('en-IN')}` : 'Generated instant payment link for customer checkout',
        badge: 'CHECKOUT',
        badgeClass: 'bg-figma-lilac text-figma-ink border border-black/10',
      };
    }

    if (tool === 'ai_tagger') {
      const name = input.name || '';
      const cat = output.category || '';
      const tagCount = Array.isArray(output.suggested_tags) ? output.suggested_tags.length : 0;
      return {
        title: 'AI Catalog Auto-Tagger & Taxonomy',
        desc: name ? `Analyzed "${name}" and assigned category "${cat}" with ${tagCount} discovery tags` : 'Analyzed product features and generated semantic discovery tags',
        badge: 'AUTO-TAGGED',
        badgeClass: 'bg-figma-lilac text-figma-ink border border-black/10',
      };
    }

    if (tool === 'find_and_price' || tool === 'search_catalog') {
      const query = input.query || input.search || input.intent || '';
      const budget = input.budget_rupees || (output.parsed_budget_paise ? Math.round(output.parsed_budget_paise / 100) : null);
      return {
        title: 'AI Product Search & Intent Match',
        desc: query ? `Shopper searched "${query}"${budget ? ` (Budget: ₹${budget.toLocaleString('en-IN')})` : ''}` : 'Matched shopper natural language inquiry with store catalog',
        badge: 'DISCOVERY',
        badgeClass: 'bg-figma-cream text-figma-ink border border-black/10',
      };
    }

    if (tool === 'check_order_status') {
      const ref = input.order_id || input.order_ref || input.razorpay_order_id || (act.correlation_id ? act.correlation_id.slice(0, 8) : 'Direct');
      return {
        title: 'Live Order & Payment Status Check',
        desc: `Verified payment capture and delivery state for Ref #${ref}`,
        badge: 'RESOLVED',
        badgeClass: 'bg-figma-surfaceSoft text-figma-ink border border-figma-hairline',
      };
    }

    if (tool === 'get_product_details') {
      return {
        title: 'Product Details & Stock Inquiry',
        desc: 'Retrieved product specifications and real-time inventory count',
        badge: 'INQUIRY',
        badgeClass: 'bg-figma-surfaceSoft text-figma-ink border border-figma-hairline',
      };
    }

    return {
      title: tool.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      desc: act.reason_code ? `Store rule: ${act.reason_code.replace(/_/g, ' ')}` : 'Customer request processed automatically by store rules',
      badge: decision?.toUpperCase() || 'COMPLETED',
      badgeClass: 'bg-figma-surfaceSoft text-figma-ink border border-figma-hairline',
    };
  };

  return (
    <div className="space-y-6">
      {/* Figma Signature Story Section: Lime Color-Block */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lime text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-figma-success"></span> LIVE COMMERCE ENGINE
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-figma-ink leading-tight">
            Store Performance & AI Sales
          </h2>
          <p className="text-sm sm:text-base text-figma-ink/80 mt-1.5 max-w-2xl leading-relaxed">
            Your store is actively serving AI shoppers, negotiating discounts within safe margins, and collecting payments autonomously.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex-1 sm:flex-none h-11 px-6 rounded-full bg-figma-primary text-figma-onPrimary text-sm font-medium transition hover:scale-[1.02] active:scale-[0.98] shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex-1 sm:flex-none h-11 px-5 rounded-full bg-figma-canvas text-figma-ink border border-black text-sm font-medium transition hover:bg-figma-surfaceSoft flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Orders
          </button>
          <button
            onClick={() => onNavigate('audit')}
            className="w-full sm:w-auto h-11 px-5 rounded-full bg-figma-canvas text-figma-ink border border-black text-sm font-medium transition hover:bg-figma-surfaceSoft flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" /> Shopper Logs
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4 Pastel Hand-Cut Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          return (
            <div
              key={i}
              className={`p-5 rounded-lg border border-black/10 flex flex-col justify-between transition hover:-translate-y-0.5 ${card.bgClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-wider uppercase font-semibold">{card.title}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/70 border border-black/10 font-mono tracking-wider font-bold">
                  {card.badge}
                </span>
              </div>
              <div className="mt-4">
                <div className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                  {card.value}
                </div>
                <div className="text-xs text-figma-ink/75 mt-1.5 font-medium leading-snug">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Core Merchant Operations Grid: White Panels on Monochrome Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Recent Customer Orders */}
        <div className="lg:col-span-7 rounded-lg bg-figma-canvas border border-figma-hairline overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-figma-hairline bg-figma-surfaceSoft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">SETTLED PURCHASES</span>
                <h3 className="font-sans text-lg font-bold text-figma-ink flex items-center gap-2">
                  Recent Customer Orders
                </h3>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-semibold text-figma-ink hover:underline flex items-center gap-1 font-mono tracking-wider uppercase"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm text-zinc-500">
                No orders yet. As AI shoppers purchase products, orders will appear here.
              </div>
            ) : (
              <div className="divide-y divide-figma-hairlineSoft">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-figma-surfaceSoft/60 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-figma-surfaceSoft border border-figma-hairline items-center justify-center shrink-0 hidden sm:flex">
                        <ShoppingBag className="w-4 h-4 text-figma-ink" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-figma-ink truncate">
                          {order.product_name || 'Product'}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span>Ref: {order.razorpay_order_id ? order.razorpay_order_id.slice(-8) : order.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-figma-ink">
                          ₹{order.formatted_price}
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono tracking-wider uppercase font-semibold inline-block mt-0.5 ${
                            order.status === 'paid'
                              ? 'bg-figma-mint text-figma-ink border border-black/10'
                              : 'bg-figma-lilac text-figma-ink border border-black/10'
                          }`}
                        >
                          {order.status === 'paid' ? 'PAID & SETTLED' : 'AWAITING PAYMENT'}
                        </span>
                      </div>

                      {order.payment_link && (
                        <a
                          href={order.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full bg-figma-surfaceSoft hover:bg-figma-hairline border border-figma-hairline text-figma-ink flex items-center justify-center transition"
                          title="Open Checkout Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3.5 bg-figma-surfaceSoft border-t border-figma-hairline flex items-center justify-between text-xs text-zinc-600 font-mono tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-figma-success"></span>
              INSTANT RAZORPAY SETTLEMENT
            </span>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-figma-ink font-bold hover:underline flex items-center gap-1"
            >
              Manage Orders <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Live AI Shopper Activity Stream */}
        <div className="lg:col-span-5 rounded-lg bg-figma-canvas border border-figma-hairline overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-figma-hairline bg-figma-surfaceSoft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">TELEMETRY STREAM</span>
                <h3 className="font-sans text-lg font-bold text-figma-ink flex items-center gap-2">
                  Live Shopper Activity
                </h3>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-semibold text-figma-ink hover:underline flex items-center gap-1 font-mono tracking-wider uppercase"
              >
                Full Log <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm text-zinc-500">
                No customer queries yet. Real-time buyer interactions will appear here.
              </div>
            ) : (
              <div className="divide-y divide-figma-hairlineSoft">
                {recentActivity.map((act: any) => {
                  const event = formatMerchantActivity(act);
                  return (
                    <div key={act.id} className="p-3.5 sm:p-4 hover:bg-figma-surfaceSoft/60 transition text-xs sm:text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-figma-ink">
                          {event.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wider uppercase ${event.badgeClass}`}>
                          {event.badge}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-600 truncate">
                        {event.desc}
                      </div>

                      <div className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-between font-mono">
                        <span>{act.duration_ms}ms response</span>
                        <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3.5 bg-figma-surfaceSoft border-t border-figma-hairline flex items-center justify-between text-xs text-zinc-600 font-mono tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-figma-success"></span>
              REAL-TIME ACTIVITY
            </span>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-figma-ink font-bold hover:underline flex items-center gap-1"
            >
              View Activity <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Customer Journey Flow Strip (Pastel Sticky Tiles) */}
      <div className="rounded-lg bg-figma-canvas border border-figma-hairline p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-figma-hairline pb-3">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">HOW IT WORKS</span>
            <h3 className="font-sans text-lg font-bold text-figma-ink">
              How AI Customers Shop & Pay at Your Store
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase hidden sm:inline">
            4-STEP AUTONOMOUS FLOW
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div className="p-4 rounded-md bg-figma-lilac text-figma-ink border border-black/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">1. Smart Match</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-mono font-bold tracking-wider uppercase">Discovery</span>
              </div>
              <p className="text-xs text-figma-ink/80 leading-relaxed font-medium">
                AI shoppers ask in natural words (e.g. <em>"ANC earbuds under ₹2,000"</em>) and instantly get matching items from your catalog.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 text-xs font-mono tracking-wider uppercase font-bold">
              ✓ INSTANT MATCH
            </div>
          </div>

          <div className="p-4 rounded-md bg-figma-lime text-figma-ink border border-black/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">2. Safe Bargaining</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-mono font-bold tracking-wider uppercase">Negotiate</span>
              </div>
              <p className="text-xs text-figma-ink/80 leading-relaxed font-medium">
                If a customer requests a discount, our system offers safe step concessions without ever going below your private floor price.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 text-xs font-mono tracking-wider uppercase font-bold">
              ✓ 100% PROTECTED
            </div>
          </div>

          <div className="p-4 rounded-md bg-figma-mint text-figma-ink border border-black/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">3. 1-Click Checkout</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-mono font-bold tracking-wider uppercase">Checkout</span>
              </div>
              <p className="text-xs text-figma-ink/80 leading-relaxed font-medium">
                When a price is agreed, a secure Razorpay payment link is created instantly. Built-in locking prevents double billing.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 text-xs font-mono tracking-wider uppercase font-bold">
              ✓ LOCK SHIELD
            </div>
          </div>

          <div className="p-4 rounded-md bg-figma-cream text-figma-ink border border-black/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">4. Settlement</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-mono font-bold tracking-wider uppercase">Settlement</span>
              </div>
              <p className="text-xs text-figma-ink/80 leading-relaxed font-medium">
                Real-time bank notifications confirm payment receipt, instantly updating your ledger and marking orders complete.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 text-xs font-mono tracking-wider uppercase font-bold">
              ✓ BANK VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* Figma Signature Story Section: Mint Pastel Color-Block */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-mint text-figma-ink border border-black/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> MERCHANT PEACE OF MIND
            </div>
            <h3 className="font-sans text-2xl font-bold tracking-tight text-figma-ink flex items-center gap-2">
              Active Store Protections & Security
            </h3>
            <p className="text-xs sm:text-sm text-figma-ink/80 font-medium mt-0.5">
              Autonomous commerce safeguards active across your entire catalog and checkout engine.
            </p>
          </div>
          <span className="text-xs text-figma-ink bg-white/90 border border-black/10 px-3.5 py-1.5 rounded-full font-mono font-bold tracking-wider uppercase shrink-0 shadow-xs">
            100% DEFENDED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div className="p-4 rounded-md bg-white border border-black/10 shadow-xs">
            <div className="text-sm font-bold text-figma-ink mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-figma-ink" /> Secret Floor Prices
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              Your bottom-line minimum price is kept 100% private. AI buyers never see your profit margins.
            </p>
          </div>
          <div className="p-4 rounded-md bg-white border border-black/10 shadow-xs">
            <div className="text-sm font-bold text-figma-ink mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-figma-ink" /> Strict Price Rules
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              AI cannot hallucinate unauthorized discounts. Every rupee follows your pre-configured rules.
            </p>
          </div>
          <div className="p-4 rounded-md bg-white border border-black/10 shadow-xs">
            <div className="text-sm font-bold text-figma-ink mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-figma-ink" /> Double Charge Shield
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              Smart checkout locking protects your customers from ever being billed twice on retry.
            </p>
          </div>
          <div className="p-4 rounded-md bg-white border border-black/10 shadow-xs">
            <div className="text-sm font-bold text-figma-ink mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-figma-ink" /> Real-Time Webhook
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              Every payment confirmation is verified directly with Razorpay before updating order status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





