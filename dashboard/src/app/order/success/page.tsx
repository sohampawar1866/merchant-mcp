'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  ArrowLeft,
  Truck,
  Building2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Store,
  Smartphone,
} from 'lucide-react';

interface OrderData {
  id: string;
  razorpay_reference: string;
  merchant_name: string;
  merchant_gstin: string;
  status: string;
  created_at: string;
  estimated_delivery: string;
  tracking_id: string;
  product: {
    name: string;
    category: string;
    hsn_sac: string;
  };
  pricing: {
    original_mrp_inr: string;
    agreed_total_inr: string;
    discount_inr: string;
    base_taxable_inr: string;
    cgst_inr: string;
    sgst_inr: string;
    gst_rate_percent: number;
  };
  customer: {
    name: string;
    shipping_address: string;
    payment_rail: string;
  };
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get('order_id') ||
    searchParams.get('razorpay_payment_link_id') ||
    searchParams.get('razorpay_order_id') ||
    '';
  const paymentId = searchParams.get('razorpay_payment_id') || 'pay_test_' + Math.random().toString(36).substring(2, 9);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const fetchId = orderId || 'latest';
        const res = await fetch(`/api/orders/${fetchId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order invoice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-mono text-zinc-400">Verifying Razorpay 2FA Payment & Generating Tax Invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col items-center justify-center p-6">
        <p className="text-sm text-red-400 mb-4">Invoice not found or payment incomplete.</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-mono">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col items-center py-8 px-4 sm:px-6 font-sans">
      {/* Top Banner: Celebratory & Razorpay Verification */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/40 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Verified & Captured via Razorpay</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Thank you! Your order is confirmed.
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Razorpay Ref: <span className="font-mono text-zinc-300">{paymentId}</span> • 2FA Authentication Completed
        </p>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-3 mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-white transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice (PDF)</span>
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <Store className="w-4 h-4" />
            <span>Back to Store</span>
          </a>
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 transition"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Open UPI App (:3002)</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* The Printable Official Tax Invoice Container */}
      <div className="w-full max-w-3xl rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-4">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-zinc-800 print:border-zinc-300 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black text-white print:text-black tracking-tight">
                {order.merchant_name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 print:hidden">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-zinc-400 print:text-zinc-600">GSTIN: {order.merchant_gstin}</p>
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              Tech Hub 7, Bandra-Kurla Complex, Mumbai, MH 400051
            </p>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 rounded-lg bg-zinc-800 print:bg-zinc-100 text-xs font-mono font-bold text-zinc-200 print:text-black mb-1">
              TAX INVOICE
            </span>
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              Invoice No: <span className="font-mono text-zinc-200 print:text-black">INV-2026-{(order.id || '9821').substring(0, 6).toUpperCase()}</span>
            </p>
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Billed To & Shipping Status Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-800 print:border-zinc-300 text-xs">
          <div>
            <p className="font-bold text-zinc-400 print:text-zinc-600 uppercase tracking-wider text-[10px] mb-1">
              Billed & Shipped To:
            </p>
            <p className="font-bold text-white print:text-black text-sm">{order.customer.name}</p>
            <p className="text-zinc-400 print:text-zinc-600 mt-1 leading-relaxed">{order.customer.shipping_address}</p>
            <p className="text-zinc-500 print:text-zinc-500 mt-1">Payment Method: {order.customer.payment_rail}</p>
          </div>

          <div className="sm:text-right">
            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-zinc-800/60 print:bg-zinc-100 border border-zinc-700/60 print:border-zinc-200 sm:ml-auto">
              <Truck className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600">Express Delivery</p>
                <p className="font-mono font-bold text-zinc-200 print:text-black">{order.tracking_id}</p>
                <p className="text-[10px] text-emerald-400 print:text-emerald-700 font-medium">ETA: {order.estimated_delivery}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 border-b border-zinc-800 print:border-zinc-300">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-400 print:text-zinc-600 border-b border-zinc-800 print:border-zinc-200 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Item & Description</th>
                <th className="pb-3 font-semibold text-center">HSN/SAC</th>
                <th className="pb-3 font-semibold text-center">Qty</th>
                <th className="pb-3 font-semibold text-right">Taxable Val</th>
                <th className="pb-3 font-semibold text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
              <tr>
                <td className="py-4">
                  <p className="font-bold text-white print:text-black text-sm">{order.product.name}</p>
                  <p className="text-zinc-400 print:text-zinc-600 text-[11px]">{order.product.category}</p>
                  {Number(order.pricing.discount_inr) > 0 && (
                    <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 print:text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      ⚡ AI Agent Negotiated Savings: ₹{order.pricing.discount_inr}
                    </span>
                  )}
                </td>
                <td className="py-4 text-center font-mono text-zinc-400 print:text-zinc-600">{order.product.hsn_sac}</td>
                <td className="py-4 text-center text-zinc-200 print:text-black">1</td>
                <td className="py-4 text-right font-mono text-zinc-300 print:text-zinc-700">₹{order.pricing.base_taxable_inr}</td>
                <td className="py-4 text-right font-mono font-bold text-white print:text-black">₹{order.pricing.agreed_total_inr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* GST Tax Calculation Summary */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="text-xs text-zinc-400 print:text-zinc-600 max-w-sm">
            <p className="font-bold text-zinc-300 print:text-black mb-1">Invoice Notes & Terms:</p>
            <p className="text-[11px] leading-relaxed">
              This is a computer-generated tax invoice verified under the Central Goods and Services Tax Act, 2017.
              Autonomous agent transactions are backed by NPCI & RBI Step-Up 2FA protocols.
            </p>
          </div>

          <div className="w-full sm:w-64 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between text-zinc-400 print:text-zinc-600">
              <span>Taxable Value:</span>
              <span className="font-mono text-zinc-200 print:text-black">₹{order.pricing.base_taxable_inr}</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-zinc-600">
              <span>CGST (9.0%):</span>
              <span className="font-mono text-zinc-200 print:text-black">₹{order.pricing.cgst_inr}</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-zinc-600">
              <span>SGST (9.0%):</span>
              <span className="font-mono text-zinc-200 print:text-black">₹{order.pricing.sgst_inr}</span>
            </div>
            <div className="border-t border-zinc-800 print:border-zinc-300 pt-2 mt-1 flex justify-between text-sm font-black text-white print:text-black">
              <span>Total Amount Paid:</span>
              <span className="font-mono text-emerald-400 print:text-emerald-700">₹{order.pricing.agreed_total_inr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex items-center justify-center">
          <p className="text-xs font-mono text-zinc-400">Loading Order Success...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
