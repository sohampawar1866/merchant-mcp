'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Lock,
  Code2,
} from 'lucide-react';

export function AuditTrailTab({ merchantId }: { merchantId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tool, setTool] = useState('all');
  const [decision, setDecision] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showTechnicalJson, setShowTechnicalJson] = useState<Record<number, boolean>>({});

  const [errorMessage, setErrorMessage] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({ merchant_id: merchantId });
      if (search) params.set('search', search);
      if (tool !== 'all') params.set('tool', tool);
      if (decision !== 'all') params.set('decision', decision);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to retrieve activity log from database');
      }
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      console.error('Failed to load audit logs:', e);
      setErrorMessage(e.message || 'Activity query failed');
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

  const getFriendlyToolName = (toolName: string) => {
    switch (toolName) {
      case 'ai_tagger':
        return 'AI Catalog Categorization & Auto-Tagger';
      case 'find_and_price':
        return 'AI Product Discovery & Intent Match';
      case 'negotiate_offer':
        return 'Autonomous Price Bargaining & Gating';
      case 'create_checkout':
        return 'Razorpay Payment Link & Order Lock';
      case 'webhook_razorpay':
        return 'Razorpay Bank Payment Confirmation';
      case 'get_product_details':
        return 'Product Details & Stock Inquiry';
      case 'search_catalog':
        return 'Store Catalog Search & Filter';
      case 'check_order_status':
        return 'Live Order & Payment Status Check';
      default:
        return toolName || 'Customer Action';
    }
  };

  const getFriendlyDecisionLabel = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'approved':
        return 'APPROVED';
      case 'paid':
        return 'PAID & SETTLED';
      case 'rejected':
        return 'DEFENDED / COUNTER-OFFER';
      case 'suggested':
        return 'TAGS GENERATED';
      case 'pending_approval':
        return 'PENDING REVIEW';
      case 'failed':
        return 'FAILED';
      case 'completed':
        return 'COMPLETED';
      default:
        return decision && decision !== 'n/a' ? decision.toUpperCase() : 'COMPLETED';
    }
  };

  const getDecisionBadgeStyle = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'approved':
      case 'paid':
        return 'bg-figma-mint text-figma-ink border border-black/10';
      case 'rejected':
        return 'bg-figma-coral text-figma-ink border border-black/10';
      case 'suggested':
        return 'bg-figma-lilac text-figma-ink border border-black/10';
      case 'pending_approval':
        return 'bg-figma-cream text-figma-ink border border-black/10';
      case 'failed':
        return 'bg-figma-pink text-figma-ink border border-black/10';
      default:
        return 'bg-figma-surfaceSoft text-figma-ink border border-black/10';
    }
  };

  const getFriendlyReason = (reasonCode: string) => {
    switch (reasonCode) {
      case 'AI_TAGGING_COMPLETED':
        return 'Categories and tags extracted from product features';
      case 'MATCHES_FOUND':
        return 'Matched products matching buyer intent and budget';
      case 'ACCEPTED_BASE_OR_HIGHER':
        return 'Offer accepted at or above listing price';
      case 'WITHIN_BOUNDS':
        return 'Offer accepted within merchant allowed discount bounds';
      case 'COUNTER_OFFER_MADE':
        return 'Offer below floor: Step-ladder counter-offer issued';
      case 'DISCOUNT_STAGE_1':
        return 'Conceded 33% allowable discount (Attempt 1)';
      case 'DISCOUNT_STAGE_2':
        return 'Conceded 66% allowable discount (Attempt 2)';
      case 'DISCOUNT_STAGE_3':
        return 'Conceded 100% allowable discount / floor limit (Attempt 3)';
      case 'BELOW_FLOOR':
        return 'Offer rejected: Below merchant minimum profit floor';
      case 'MAX_ATTEMPTS_EXCEEDED':
        return 'Max bargaining attempts reached (Lockout enforced)';
      case 'PRODUCT_OUT_OF_STOCK':
        return 'Rejected: Product is currently out of stock';
      case 'PRODUCT_NOT_FOUND':
        return 'Rejected: Product ID does not exist in store';
      case 'CHECKOUT_CREATED':
        return 'Generated Razorpay checkout link & locked inventory';
      case 'IDEMPOTENT_HIT':
        return 'Duplicate prevention: Returned existing order without double charging';
      case 'PRICE_GATING_VIOLATION':
        return 'Blocked: Proposed price is below minimum floor price';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Session rate limit exceeded (30 calls/min)';
      case 'PAYMENT_CAPTURED':
      case 'payment.captured':
      case 'order.paid':
        return 'Bank payment verified and captured via Razorpay';
      case 'PAYMENT_FAILED':
      case 'payment.failed':
        return 'Customer payment failed on bank/gateway side';
      case 'INVALID_WEBHOOK_SIGNATURE':
        return 'Blocked: HMAC-SHA256 signature verification failed';
      default:
        return reasonCode ? reasonCode.replace(/_/g, ' ') : '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Figma Signature Story Block: Lime Ground for Search & Systems Filter */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lime text-figma-ink border border-black/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-2">
              <Activity className="w-3.5 h-3.5" /> AUDIT TELEMETRY & EVENT LOG
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-figma-ink">
              Live Customer & AI Shopper Logs
            </h2>
            <p className="text-xs sm:text-sm text-figma-ink/80 mt-1 max-w-2xl font-medium">
              Permanent immutable ledger of customer queries, automated discount negotiations, checkout links, and settlement webhooks.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold tracking-wider uppercase bg-white/80 border border-black/10 px-3.5 py-1.5 rounded-full text-figma-ink">
              {total} Total Events
            </span>
            <button
              onClick={fetchAuditLogs}
              className="w-10 h-10 bg-white hover:bg-figma-surfaceSoft border border-black/10 text-figma-ink rounded-full flex items-center justify-center transition shrink-0"
              title="Refresh activity log"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar inside the Lime Section */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pt-1">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by product name, intent, session ID, rule code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/15 rounded-full text-xs sm:text-sm text-figma-ink placeholder-zinc-500 focus:outline-none focus:border-black font-medium transition shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-figma-primary hover:opacity-90 text-figma-onPrimary rounded-full text-xs sm:text-sm font-medium transition shrink-0 shadow-xs"
            >
              Search Logs
            </button>
          </form>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 font-mono text-xs">
            {/* Activity filter */}
            <select
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-black/15 rounded-full text-xs text-figma-ink font-medium focus:outline-none focus:border-black uppercase tracking-wider"
            >
              <option value="all">ALL ACTIVITIES</option>
              <option value="find_and_price">AI DISCOVERY</option>
              <option value="negotiate_offer">BARGAIN NEGOTIATION</option>
              <option value="create_checkout">CHECKOUT LINKS</option>
              <option value="webhook_razorpay">BANK WEBHOOKS</option>
              <option value="ai_tagger">AI AUTO-TAGGER</option>
              <option value="get_product_details">PRODUCT INQUIRY</option>
              <option value="search_catalog">CATALOG SEARCH</option>
              <option value="check_order_status">ORDER STATUS</option>
            </select>

            {/* Decision filter */}
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-black/15 rounded-full text-xs text-figma-ink font-medium focus:outline-none focus:border-black uppercase tracking-wider"
            >
              <option value="all">ALL OUTCOMES</option>
              <option value="approved">APPROVED</option>
              <option value="rejected">DEFENDED / COUNTER</option>
              <option value="paid">PAID & SETTLED</option>
              <option value="suggested">TAGS GENERATED</option>
              <option value="pending_approval">PENDING REVIEW</option>
              <option value="failed">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-figma-pink border border-black/10 text-figma-ink text-xs sm:text-sm flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold">NOTICE:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="hover:opacity-70 font-bold text-sm px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Activity Log Table */}
      <div className="rounded-lg bg-figma-canvas border border-figma-hairline overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex items-center justify-between bg-figma-surfaceSoft">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">EVENT STREAM</span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-figma-ink flex items-center gap-2">
              Telemetric Event Stream
            </h3>
          </div>
          <span className="text-xs text-figma-ink font-mono tracking-wider uppercase bg-figma-canvas border border-figma-hairline px-3 py-1 rounded-full">{total} Records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm font-mono">
            LOADING SHOPPER ACTIVITY RECORDS...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm">
            No shopper activity records match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-figma-hairlineSoft">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isJsonVisible = showTechnicalJson[entry.id] || false;
              const friendlyReason = getFriendlyReason(entry.reason_code);

              return (
                <div key={entry.id} className="transition hover:bg-figma-surfaceSoft/60">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-figma-ink shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-figma-ink">
                            {getFriendlyToolName(entry.tool_name)}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono tracking-wider uppercase font-semibold ${getDecisionBadgeStyle(entry.decision)}`}>
                            {getFriendlyDecisionLabel(entry.decision)}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                          <span>Session: {entry.correlation_id ? entry.correlation_id.slice(0, 8) : 'Direct'}</span>
                          {friendlyReason && (
                            <span className="text-zinc-700 font-sans font-medium">• {friendlyReason}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 pl-7 md:pl-0 font-mono">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {entry.duration_ms}ms
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Clear Summary */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-figma-surfaceSoft border-t border-figma-hairline space-y-3.5 text-xs sm:text-sm">
                      {/* Merchant-friendly request / response cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg bg-figma-cream text-figma-ink border border-black/10 space-y-2">
                          <div className="text-figma-ink font-bold flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
                            <ShoppingBag className="w-3.5 h-3.5 text-figma-ink" /> Request & Input Details
                          </div>
                          <div className="text-xs text-zinc-800 space-y-1 font-medium">
                            {/* AI Tagger Input */}
                            {entry.tool_name === 'ai_tagger' && (
                              <>
                                {entry.input?.name && <div><strong className="text-figma-ink font-bold">Product Title:</strong> {entry.input.name}</div>}
                                {entry.input?.description && <div><strong className="text-figma-ink font-bold">Description:</strong> {entry.input.description}</div>}
                              </>
                            )}

                            {/* Natural Language Discovery Input */}
                            {entry.tool_name === 'find_and_price' && (
                              <>
                                {entry.input?.intent && <div><strong className="text-figma-ink font-bold">Buyer Natural Intent:</strong> "{entry.input.intent}"</div>}
                                {entry.input?.query && <div><strong className="text-figma-ink font-bold">Searched Query:</strong> "{entry.input.query}"</div>}
                              </>
                            )}

                            {/* Negotiation Input */}
                            {entry.tool_name === 'negotiate_offer' && (
                              <>
                                {entry.input?.proposed_price && (
                                  <div><strong className="text-figma-ink font-bold">Offered Price:</strong> ₹{Math.round(entry.input.proposed_price / 100).toLocaleString('en-IN')}</div>
                                )}
                                {entry.input?.offered_price_rupees && (
                                  <div><strong className="text-figma-ink font-bold">Offered Price:</strong> ₹{entry.input.offered_price_rupees}</div>
                                )}
                                {entry.input?.product_id && (
                                  <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Target Product UUID:</strong> {entry.input.product_id}</div>
                                )}
                              </>
                            )}

                            {/* Checkout Input */}
                            {entry.tool_name === 'create_checkout' && (
                              <>
                                {entry.input?.agreed_price && (
                                  <div><strong className="text-figma-ink font-bold">Agreed Purchase Price:</strong> ₹{Math.round(entry.input.agreed_price / 100).toLocaleString('en-IN')}</div>
                                )}
                                {entry.input?.idempotency_key && (
                                  <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Idempotency Key:</strong> {entry.input.idempotency_key}</div>
                                )}
                                {entry.input?.customer_phone && (
                                  <div><strong className="text-figma-ink font-bold">Customer Phone:</strong> {entry.input.customer_phone}</div>
                                )}
                              </>
                            )}

                            {/* Webhook Input */}
                            {entry.tool_name === 'webhook_razorpay' && (
                              <>
                                <div><strong className="text-figma-ink font-bold">Source:</strong> Razorpay Payment Gateway Webhook</div>
                                {entry.input?.signature && (
                                  <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">HMAC Signature:</strong> {entry.input.signature.slice(0, 16)}...</div>
                                )}
                              </>
                            )}

                            {/* Generic fallback inputs */}
                            {entry.tool_name !== 'ai_tagger' && entry.tool_name !== 'find_and_price' && entry.tool_name !== 'negotiate_offer' && entry.tool_name !== 'create_checkout' && entry.tool_name !== 'webhook_razorpay' && (
                              <>
                                {entry.input?.product_id && <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Product ID:</strong> {entry.input.product_id}</div>}
                                {entry.input?.order_id && <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Order ID:</strong> {entry.input.order_id}</div>}
                                {entry.input?.query && <div><strong className="text-figma-ink font-bold">Query:</strong> "{entry.input.query}"</div>}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-figma-mint text-figma-ink border border-black/10 space-y-2">
                          <div className="text-figma-ink font-bold flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-figma-ink" /> Output & Store Execution Result
                          </div>
                          <div className="text-xs text-zinc-800 space-y-1 font-medium">
                            <div><strong className="text-figma-ink font-bold">Outcome:</strong> {getFriendlyDecisionLabel(entry.decision)}</div>
                            {friendlyReason && (
                              <div><strong className="text-figma-ink font-bold">Rule / Action:</strong> {friendlyReason}</div>
                            )}

                            {/* AI Tagger Output */}
                            {entry.tool_name === 'ai_tagger' && (
                              <>
                                {entry.output?.category && <div><strong className="text-figma-ink font-bold">Identified Category:</strong> {entry.output.category}</div>}
                                {Array.isArray(entry.output?.suggested_tags) && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    <strong className="text-figma-ink font-bold block w-full mb-0.5">Assigned Tags:</strong>
                                    {entry.output.suggested_tags.map((t: string, i: number) => (
                                      <span key={i} className="px-2 py-0.5 rounded-full bg-white text-figma-ink border border-black/10 font-mono text-[11px]">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Find and Price Output */}
                            {entry.tool_name === 'find_and_price' && (
                              <>
                                {entry.output?.total_matches !== undefined && (
                                  <div><strong className="text-figma-ink font-bold">Ranked Matches Found:</strong> {entry.output.total_matches} products</div>
                                )}
                                {entry.output?.parsed_budget_paise && (
                                  <div><strong className="text-figma-ink font-bold">Parsed Price Budget:</strong> ₹{Math.round(entry.output.parsed_budget_paise / 100).toLocaleString('en-IN')}</div>
                                )}
                              </>
                            )}

                            {/* Negotiation Output */}
                            {entry.tool_name === 'negotiate_offer' && (
                              <>
                                {entry.output?.counter_offer && (
                                  <div><strong className="text-figma-ink font-bold">Step-Ladder Counter-Offer:</strong> ₹{Math.round(entry.output.counter_offer / 100).toLocaleString('en-IN')}</div>
                                )}
                                {entry.output?.final_price && (
                                  <div><strong className="text-figma-ink font-bold">Agreed Final Price:</strong> ₹{Math.round(entry.output.final_price / 100).toLocaleString('en-IN')}</div>
                                )}
                                {entry.output?.attempt && (
                                  <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Attempt Number:</strong> {entry.output.attempt} / {entry.output.max_attempts || 3}</div>
                                )}
                              </>
                            )}

                            {/* Checkout Output */}
                            {entry.output?.checkout_link && (
                              <div>
                                <strong className="text-figma-ink font-bold">Razorpay Payment Link:</strong>{' '}
                                <a
                                  href={entry.output.checkout_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-figma-ink font-bold underline font-mono uppercase"
                                >
                                  Open Checkout Link ↗
                                </a>
                              </div>
                            )}
                            {entry.output?.payment_link && !entry.output?.checkout_link && (
                              <div>
                                <strong className="text-figma-ink font-bold">Razorpay Payment Link:</strong>{' '}
                                <a
                                  href={entry.output.payment_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-figma-ink font-bold underline font-mono uppercase"
                                >
                                  Open Checkout Link ↗
                                </a>
                              </div>
                            )}
                            {entry.output?.order_id && (
                              <div className="font-mono text-[11px]"><strong className="text-figma-ink font-bold">Razorpay Order ID:</strong> {entry.output.order_id}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Developer Details Toggle with Figma Inverse Canvas Code Block */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTechnicalJson((prev) => ({
                              ...prev,
                              [entry.id]: !prev[entry.id],
                            }));
                          }}
                          className="text-[11px] text-zinc-600 hover:text-figma-ink flex items-center gap-1 font-mono uppercase tracking-wider transition"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          {isJsonVisible ? 'Hide Raw Technical Payload' : 'View Raw Technical Payload (JSON)'}
                        </button>

                        {isJsonVisible && (
                          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-[11px]">
                            <div className="p-4 rounded-lg bg-figma-inverseCanvas text-figma-inverseInk">
                              <div className="text-zinc-400 mb-1.5 text-[10px] uppercase tracking-wider">Input Payload</div>
                              <pre className="overflow-x-auto max-h-48 leading-relaxed text-xs">
                                {JSON.stringify(entry.input, null, 2)}
                              </pre>
                            </div>
                            <div className="p-4 rounded-lg bg-figma-inverseCanvas text-figma-inverseInk">
                              <div className="text-zinc-400 mb-1.5 text-[10px] uppercase tracking-wider">Output Payload</div>
                              <pre className="overflow-x-auto max-h-48 leading-relaxed text-xs text-figma-lime">
                                {JSON.stringify(entry.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
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
