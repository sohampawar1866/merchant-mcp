'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, ShieldCheck, Terminal } from 'lucide-react';

export function AuditTrailTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tool, setTool] = useState('all');
  const [decision, setDecision] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tool !== 'all') params.set('tool', tool);
      if (decision !== 'all') params.set('decision', decision);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve audit log from database');
      }
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      console.error('Failed to load audit logs:', e);
      setErrorMessage(e.message || 'Audit trail query failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [tool, decision]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const getDecisionBadge = (decision: string, reason?: string) => {
    switch (decision?.toLowerCase()) {
      case 'approved':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> {decision.toUpperCase()}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> {reason || 'REJECTED'}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <XCircle className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {decision || 'INFO'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-5 rounded-xl bg-[#0e1e36] border border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by correlation ID, keywords, reason code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#071324] border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Tool filter */}
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="px-3 py-2 bg-[#071324] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Tools</option>
            <option value="find_and_price">find_and_price</option>
            <option value="search_catalog">search_catalog</option>
            <option value="get_product_details">get_product_details</option>
            <option value="negotiate_offer">negotiate_offer</option>
            <option value="create_checkout">create_checkout</option>
            <option value="check_order_status">check_order_status</option>
            <option value="webhook_razorpay">webhook_razorpay</option>
          </select>

          {/* Decision filter */}
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="px-3 py-2 bg-[#071324] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Decisions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={fetchAuditLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Audit Log Table */}
      <div className="rounded-xl bg-[#0e1e36] border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Append-Only Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{total} Total Events</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit records...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit log records match the current filters.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="transition hover:bg-slate-900/30">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-sky-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
                            {entry.tool_name}
                          </span>
                          {getDecisionBadge(entry.decision, entry.reason_code)}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-3">
                          <span>CID: {entry.correlation_id}</span>
                          {entry.reason_code && <span>Reason: {entry.reason_code}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pl-7 md:pl-0">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {entry.duration_ms}ms
                      </span>
                      <span>{new Date(entry.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="p-4 bg-[#06101e] border-t border-slate-800/80 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-sky-400" /> Input Payload
                          </div>
                          <pre className="p-3 bg-[#030914] rounded-lg border border-slate-800 text-slate-300 overflow-x-auto max-h-56">
                            {JSON.stringify(entry.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Output Payload
                          </div>
                          <pre className="p-3 bg-[#030914] rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto max-h-56">
                            {JSON.stringify(entry.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                      {entry.error_message && (
                        <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs">
                          Error Message: {entry.error_message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
