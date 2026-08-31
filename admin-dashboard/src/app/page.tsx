'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Store,
  CreditCard,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Key,
  Copy,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Zap,
  Sliders,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'merchants' | 'audit'>('merchants');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchAudit, setSearchAudit] = useState('');
  const [filterMerchant, setFilterMerchant] = useState('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setErrorMessage('');
      const [metricsRes, merchantsRes, auditRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/merchants'),
        fetch(`/api/admin/audit?search=${encodeURIComponent(searchAudit)}&merchant_id=${filterMerchant}`),
      ]);

      if (!metricsRes.ok || !merchantsRes.ok || !auditRes.ok) {
        const errJson = await (metricsRes.ok ? (merchantsRes.ok ? auditRes : merchantsRes) : metricsRes).json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to communicate with platform administration backend');
      }

      setMetrics(await metricsRes.json());
      const mData = await merchantsRes.json();
      setMerchants(mData.merchants || []);
      const aData = await auditRes.json();
      setAuditLogs(aData.entries || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setErrorMessage(err.message || 'Platform administration backend error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000);
    return () => clearInterval(interval);
  }, [searchAudit, filterMerchant]);

  const handleToggleStatus = async (merchantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(merchantId);

    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-figma-canvas text-figma-ink flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-figma-canvas border-b border-figma-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center p-1.5 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-base font-bold text-figma-ink tracking-tight">
                  AgenticCheckout Platform Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-bold tracking-wider uppercase">
                  ROOT CONTROL
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">Multi-Tenant Gateway & Kill Switch Console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-figma-surfaceSoft border border-figma-hairline text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-green-600" />
              <span>{metrics?.merchants?.active || 0} Stores Active</span>
              {metrics?.merchants?.suspended > 0 && (
                <span className="text-red-600 font-bold">({metrics.merchants.suspended} Suspended)</span>
              )}
            </div>

            <button
              onClick={fetchAdminData}
              className="w-9 h-9 rounded-full bg-figma-surfaceSoft hover:bg-zinc-100 flex items-center justify-center transition border border-figma-hairline"
              title="Refresh platform data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-figma-hairline bg-figma-surfaceSoft px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setActiveTab('merchants')}
              className={`py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'merchants'
                  ? 'border-figma-primary text-figma-ink'
                  : 'border-transparent text-zinc-500 hover:text-figma-ink'
              }`}
            >
              Merchants & Kill Switch ({merchants.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'audit'
                  ? 'border-figma-primary text-figma-ink'
                  : 'border-transparent text-zinc-500 hover:text-figma-ink'
              }`}
            >
              Cross-Merchant Audit Explorer
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <div className="font-bold">Platform Admin Backend Error</div>
              <div>{errorMessage}</div>
              <div className="text-xs text-red-600 font-mono mt-1">
                Make sure PostgreSQL is healthy and migrations have run.
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-figma-hairline rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Platform GMV</div>
            <div className="text-2xl font-bold font-mono text-figma-ink">
              ₹{metrics?.platform_gmv?.formatted_rupees || '0'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{metrics?.orders?.paid || 0} paid checkouts</div>
          </div>

          <div className="bg-white border border-figma-hairline rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Registered Stores</div>
            <div className="text-2xl font-bold font-mono text-figma-ink flex items-center gap-2">
              <span>{metrics?.merchants?.total || 0}</span>
              <span className="text-xs font-normal text-green-600 font-sans">({metrics?.merchants?.active || 0} active)</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">{metrics?.merchants?.suspended || 0} stores suspended</div>
          </div>

          <div className="bg-white border border-figma-hairline rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Agent Bargain Win Rate</div>
            <div className="text-2xl font-bold font-mono text-figma-ink">
              {metrics?.negotiations?.success_rate_percent || 100}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">{metrics?.negotiations?.approved || 0} approved / {metrics?.negotiations?.rejected || 0} rejected</div>
          </div>

          <div className="bg-white border border-figma-hairline rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Total Tool Calls</div>
            <div className="text-2xl font-bold font-mono text-figma-ink">
              {metrics?.telemetry?.total_tool_calls || 0}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Avg latency: {metrics?.telemetry?.avg_latency_ms || 0}ms</div>
          </div>
        </div>

        {/* Tab 1: Merchants & Kill Switch */}
        {activeTab === 'merchants' && (
          <div className="bg-white border border-figma-hairline rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-figma-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-figma-surfaceSoft">
              <div>
                <h2 className="text-base font-bold text-figma-ink tracking-tight">Registered Merchant Stores</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Platform-wide tenant isolation with per-merchant credentials & immediate kill switch controls.
                </p>
              </div>

              <a
                href="http://localhost:3000/onboard"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-figma-primary text-white text-xs font-medium hover:bg-zinc-800 transition flex items-center gap-1.5"
              >
                <span>+ Onboard New Merchant</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-figma-hairline bg-zinc-50/50 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    <th className="py-3 px-4">Store / Tenant</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Razorpay Key</th>
                    <th className="py-3 px-4">Products</th>
                    <th className="py-3 px-4">Sales / Revenue</th>
                    <th className="py-3 px-4">MCP API Key</th>
                    <th className="py-3 px-4 text-right">Kill Switch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-figma-hairline">
                  {merchants.map((m) => {
                    const isSuspended = m.status === 'suspended';
                    return (
                      <tr key={m.id} className={`hover:bg-zinc-50/75 transition ${isSuspended ? 'bg-red-50/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-figma-ink">{m.name}</div>
                          <div className="text-[11px] font-mono text-zinc-400">{m.id}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-mono font-bold">
                              <XCircle className="w-3.5 h-3.5" />
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-mono font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-600">
                          {m.razorpay_key_id || <span className="text-zinc-400">Not configured</span>}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          {m.product_count || 0} items
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div className="font-bold text-figma-ink">₹{m.formatted_revenue || '0'}</div>
                          <div className="text-[11px] text-zinc-400">{m.order_count || 0} orders</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-mono">
                            <span className="truncate max-w-[120px]">{m.api_key}</span>
                            <button
                              onClick={() => handleCopy(m.api_key, m.id)}
                              className="text-zinc-500 hover:text-zinc-800"
                              title="Copy API key"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {copiedKey === m.id && <span className="text-[10px] text-green-600 font-mono ml-1">Copied</span>}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(m.id, m.status)}
                            disabled={actionLoading === m.id}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition ${
                              isSuspended
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === m.id ? (
                              'Updating...'
                            ) : isSuspended ? (
                              'Reactivate Store'
                            ) : (
                              'Suspend (Kill Switch)'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Cross-Merchant Audit Explorer */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-figma-hairline rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-figma-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-figma-surfaceSoft">
              <div>
                <h2 className="text-base font-bold text-figma-ink tracking-tight">Platform-Wide Audit Trail</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Real-time append-only telemetry across all active & suspended stores.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search correlation ID, tool, store..."
                    value={searchAudit}
                    onChange={(e) => setSearchAudit(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs font-mono focus:outline-none focus:border-figma-primary"
                  />
                </div>

                {/* Filter Store */}
                <select
                  value={filterMerchant}
                  onChange={(e) => setFilterMerchant(e.target.value)}
                  className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs font-mono focus:outline-none"
                >
                  <option value="all">All Stores</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-figma-hairline bg-zinc-50/50 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Store</th>
                    <th className="py-3 px-4">Tool Name</th>
                    <th className="py-3 px-4">Decision / Code</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Correlation ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-figma-hairline font-mono text-xs">
                  {auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50/75 transition">
                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-figma-ink whitespace-nowrap">
                        {a.merchant_name}
                      </td>
                      <td className="py-3 px-4 font-bold text-figma-ink">
                        {a.tool_name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.decision === 'approved' || a.decision === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : a.decision === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {a.decision} {a.reason_code ? `(${a.reason_code})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600">{a.duration_ms}ms</td>
                      <td className="py-3 px-4 text-zinc-400 truncate max-w-[120px]">{a.correlation_id}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-mono">
                        No audit events match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-figma-canvas border-t border-figma-hairline py-4 px-4 sm:px-6 text-xs text-zinc-500 flex items-center justify-between font-mono uppercase tracking-wider">
        <div>AgenticCheckout Platform Operator Console</div>
        <div className="flex items-center gap-2 text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          PostgreSQL Cryptographic Vault Active
        </div>
      </footer>
    </div>
  );
}
