'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sliders,
  X,
  CheckCircle2,
  Lock,
  Zap,
  Activity,
  Key,
  Radio,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
  merchantId: string;
}

export function SettingsModal({ isOpen, onClose, onSettingsChanged, merchantId }: SettingsModalProps) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form states for text/password inputs
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings?merchant_id=${merchantId}`);
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setKeyId(data.settings['razorpay_key_id']?.value || '');
        setKeySecret(data.settings['razorpay_key_secret']?.value || '');
        setWebhookSecret(data.settings['razorpay_webhook_secret']?.value || '');
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setSaveSuccessMsg('');
    }
  }, [isOpen, merchantId]);

  const updateSetting = async (key: string, value: any) => {
    setUpdatingKey(key);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: merchantId, key, value: String(value) }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: String(value),
          },
        }));
        setSaveSuccessMsg(`Policy "${key}" updated live in database`);
        setTimeout(() => setSaveSuccessMsg(''), 3000);
        if (onSettingsChanged) onSettingsChanged();
      }
    } catch (e) {
      console.error('Failed to update setting:', e);
    } finally {
      setUpdatingKey(null);
    }
  };

  const saveCredentials = async () => {
    setUpdatingKey('credentials');
    try {
      await updateSetting('razorpay_key_id', keyId);
      await updateSetting('razorpay_key_secret', keySecret);
      await updateSetting('razorpay_webhook_secret', webhookSecret);
      setSaveSuccessMsg('Razorpay credentials updated live in database');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } finally {
      setUpdatingKey(null);
    }
  };

  if (!isOpen) return null;

  const currentTransport = settings['mcp_transport']?.value || 'streamablehttp';
  const isFindAndPrice = settings['enable_find_and_price']?.value !== 'false';
  const isNegotiation = settings['enable_negotiation']?.value !== 'false';
  const isHumanApproval = settings['enable_human_approval']?.value === 'true';
  const maxAttempts = parseInt(settings['max_negotiation_attempts']?.value || '3', 10);
  const rateLimit = parseInt(settings['max_tool_calls_per_minute']?.value || '30', 10);
  const isStrictWebhook = settings['webhook_strict_mode']?.value !== 'false';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-lg border border-black/15 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Block: Lilac Pastel */}
        <div className="p-5 sm:p-6 bg-figma-lilac text-figma-ink border-b border-black/10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-1.5 font-bold">
              <Sliders className="w-3.5 h-3.5" /> LIVE STORE CONTROL PANEL
            </div>
            <h3 className="font-sans text-xl font-bold tracking-tight text-figma-ink">
              Store Policies & Dynamic Settings
            </h3>
            <p className="text-xs text-figma-ink/80 font-medium mt-0.5">
              All credentials, transport, and guardrails live in PostgreSQL - zero container restarts needed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-100 border border-black/10 flex items-center justify-center text-figma-ink transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {saveSuccessMsg && (
            <div className="p-3 rounded-md bg-figma-mint text-figma-ink border border-black/10 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-figma-success shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs font-mono text-zinc-500 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-black" />
              <span>Loading live store policies...</span>
            </div>
          ) : (
            <>
              {/* Category 1: Razorpay Credentials */}
              <div className="p-4 rounded-md bg-figma-lime/30 border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-figma-ink flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Razorpay Test Credentials
                  </div>
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-zinc-700 hover:text-black flex items-center gap-1 underline font-semibold"
                  >
                    API Keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase font-mono mb-1">
                      Key ID
                    </label>
                    <input
                      type="text"
                      value={keyId}
                      onChange={(e) => setKeyId(e.target.value)}
                      placeholder="rzp_test_..."
                      className="w-full px-3 py-1.5 rounded-md border border-black/15 bg-white text-xs font-mono outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase font-mono mb-1">
                      Key Secret
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={keySecret}
                        onChange={(e) => setKeySecret(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 pr-8 rounded-md border border-black/15 bg-white text-xs font-mono outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-2 text-zinc-400 hover:text-black"
                      >
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase font-mono mb-1">
                    Webhook Secret
                  </label>
                  <input
                    type="text"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="agentic_checkout_secret_2026"
                    className="w-full px-3 py-1.5 rounded-md border border-black/15 bg-white text-xs font-mono outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={saveCredentials}
                    disabled={updatingKey === 'credentials'}
                    className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:opacity-90 transition shadow-xs flex items-center gap-1.5"
                  >
                    {updatingKey === 'credentials' ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    Save Credentials
                  </button>
                </div>
              </div>

              {/* Category 2: MCP Transport Protocol */}
              <div className="p-4 rounded-md bg-figma-lilac/30 border border-black/10 space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-figma-ink flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" /> Active MCP Transport
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'streamablehttp', label: 'StreamableHTTP', hint: 'Recommended' },
                    { id: 'sse', label: 'SSE Stream', hint: 'Web clients' },
                    { id: 'stdio', label: 'Stdio', hint: 'Claude Desktop' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSetting('mcp_transport', t.id)}
                      className={`p-2.5 rounded-md border text-left transition ${
                        currentTransport === t.id
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-figma-ink border-black/15 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{t.label}</div>
                      <div className={`text-[10px] ${currentTransport === t.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {t.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 3: AI Commerce Features */}
              <div className="p-4 rounded-md bg-figma-surfaceSoft border border-figma-hairline space-y-3.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  AI Commerce Features
                </div>

                {/* Flag 1: find_and_price */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-figma-ink flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-black" /> AI Intent Discovery (`find_and_price`)
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      Permits autonomous buyer agents to query catalog using natural language and parsed price budgets.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('enable_find_and_price', !isFindAndPrice)}
                    disabled={updatingKey === 'enable_find_and_price'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isFindAndPrice ? 'bg-black' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isFindAndPrice ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Flag 2: enable_negotiation */}
                <div className="flex items-start justify-between gap-4 pt-3 border-t border-black/5">
                  <div>
                    <div className="text-sm font-bold text-figma-ink flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-black" /> Autonomous Bargaining (`negotiate_offer`)
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      Allows agents to negotiate discounts within your pre-configured concession ladder.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('enable_negotiation', !isNegotiation)}
                    disabled={updatingKey === 'enable_negotiation'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isNegotiation ? 'bg-black' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isNegotiation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Category 4: Guardrails & Negotiation Limits */}
              <div className="p-4 rounded-md bg-figma-surfaceSoft border border-figma-hairline space-y-3.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Guardrails & Human Oversight
                </div>

                {/* Flag 3: enable_human_approval */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-figma-ink flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-black" /> Require Merchant Human Approval
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      When enabled, all discounts are placed in `pending_approval` state requiring manual sign-off.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('enable_human_approval', !isHumanApproval)}
                    disabled={updatingKey === 'enable_human_approval'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isHumanApproval ? 'bg-black' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isHumanApproval ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Flag 4: max_negotiation_attempts */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-black/5">
                  <div>
                    <div className="text-sm font-bold text-figma-ink">
                      Max Bargaining Rounds (Lockout Limit)
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      Number of counter-offer turns before an agent session is locked out.
                    </p>
                  </div>
                  <select
                    value={maxAttempts}
                    onChange={(e) => updateSetting('max_negotiation_attempts', e.target.value)}
                    disabled={updatingKey === 'max_negotiation_attempts'}
                    className="px-3 py-1.5 rounded-full border border-black/20 bg-white text-xs font-mono font-bold text-figma-ink outline-none cursor-pointer"
                  >
                    <option value="1">1 Attempt</option>
                    <option value="2">2 Attempts</option>
                    <option value="3">3 Attempts (Standard)</option>
                    <option value="5">5 Attempts</option>
                    <option value="10">10 Attempts</option>
                  </select>
                </div>
              </div>

              {/* Category 5: Security & Rate Limits */}
              <div className="p-4 rounded-md bg-figma-surfaceSoft border border-figma-hairline space-y-3.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Security & Abuse Protection
                </div>

                {/* Flag 5: max_tool_calls_per_minute */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-figma-ink flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-black" /> Rate Limit Threshold
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      Maximum allowed MCP tool calls per agent session per minute.
                    </p>
                  </div>
                  <select
                    value={rateLimit}
                    onChange={(e) => updateSetting('max_tool_calls_per_minute', e.target.value)}
                    disabled={updatingKey === 'max_tool_calls_per_minute'}
                    className="px-3 py-1.5 rounded-full border border-black/20 bg-white text-xs font-mono font-bold text-figma-ink outline-none cursor-pointer"
                  >
                    <option value="15">15 calls / min</option>
                    <option value="30">30 calls / min (Standard)</option>
                    <option value="60">60 calls / min</option>
                    <option value="120">120 calls / min</option>
                  </select>
                </div>

                {/* Flag 6: webhook_strict_mode */}
                <div className="flex items-start justify-between gap-4 pt-3 border-t border-black/5">
                  <div>
                    <div className="text-sm font-bold text-figma-ink flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-black" /> Strict HMAC Webhook Verification
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      Rejects any Razorpay payment webhook lacking a valid SHA256 cryptographic signature.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('webhook_strict_mode', !isStrictWebhook)}
                    disabled={updatingKey === 'webhook_strict_mode'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isStrictWebhook ? 'bg-black' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isStrictWebhook ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-figma-surfaceSoft border-t border-figma-hairline flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            Database-Backed Store Settings Engine v1.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-black text-white text-xs font-medium hover:opacity-90 transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
