'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, Clock, XCircle, ShoppingCart } from 'lucide-react';

export function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load transactions from database');
      }
      setTransactions(data.transactions || []);
    } catch (e: any) {
      console.error('Failed to load transactions:', e);
      setErrorMessage(e.message || 'Database query error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> PAID
          </span>
        );
      case 'created':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> {status?.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#0e1e36] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-semibold text-white">Agent Orders & Payment Transactions</h2>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Refresh orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold">Database Error:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-400 hover:text-white font-bold text-sm px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl bg-[#0e1e36] border border-slate-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No checkout transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#071324] text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Order / Razorpay ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Agreed Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Payment Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4 font-mono font-medium text-sky-400">
                      {tx.razorpay_order_id || tx.id.slice(0, 8)}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {tx.product_name || 'Product'}
                      <span className="block text-[11px] text-slate-500 capitalize">{tx.product_category || 'general'}</span>
                    </td>
                    <td className="p-4 font-bold text-white font-mono">
                      ₹{tx.formatted_price}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {tx.payment_link ? (
                        <a
                          href={tx.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 transition text-xs font-semibold"
                        >
                          Checkout Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
