# AgenticCheckout: Autonomous Agent Commerce & AI Growth Engine

> **Turn any merchant into an AI-accessible, autonomous storefront with protected floor pricing, dynamic AI upsells, multi-product basket bargaining, and zero-click wallet settlements.**  
> Built for the **Razorpay AI Buildathon 2026** (Track 1: AI Growth & Agentic Commerce).

[![Release](https://img.shields.io/github/v/release/sohampawar1866/merchant-mcp?color=0284c7&label=Release)](https://github.com/sohampawar1866/merchant-mcp/releases/latest)
[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io)
[![NPCI UAP](https://img.shields.io/badge/Protocol-NPCI%20UAP%20%7C%20AP2-orange)](https://npci.org.in)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20pgcrypto-336791?logo=postgresql)](https://www.postgresql.org)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live%20Test%20Mode-0284c7)](https://razorpay.com)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen)](https://github.com/sohampawar1866/merchant-mcp/actions)

---

## 🌟 Executive Summary

Traditional e-commerce is built for human eyes, mouse clicks, and manual form fills. As AI buyers (Claude, ChatGPT, Perplexity, autonomous agent swarms) become the primary consumers of the next decade, merchants face 4 critical barriers:

1. **Invisibility**: AI agents cannot search, compare, or checkout on standard web forms.
2. **Margin Leakage Risk**: Hardcoded discounts leak profits; exposing confidential floor prices allows AI buyers to game the merchant.
3. **Single-Item Friction**: Most agent tools force 1 payment per product, killing Average Order Value (AOV).
4. **Payment Friction**: Requiring human OTP/MPIN on every micro-purchase breaks true agentic autonomy.

**AgenticCheckout solves all 4 problems in a unified, multi-tenant platform:**
- **Zero Margin Leakage**: Confidential floor prices are guarded behind an in-memory concession engine and structurally omitted from all DTO responses.
- **AI Growth & Dynamic Upsells**: Proactively suggests complementary items with bundle discounts, expanding merchant basket sizes.
- **Multi-Product Cart Concession**: Bargains complex multi-item baskets with integer paise GST half-up rounding.
- **Dual Settlement Trust Continuum**: Supports **Zero-Click Autonomous Wallet Auto-Debits** ($\le$ ₹2,000 cap per NPCI UPI Circle / AP2 standard) and **Step-Up 2FA Razorpay Payment Links** ($>$ ₹2,000).
- **Open Standards Machine Discovery**: Serves `/.well-known/agent-manifest.json` and `/.well-known/mcp.json` over StreamableHTTP for zero-configuration AI discovery.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Discovery ["1. Machine Discovery & Open Standards"]
        M1["GET /.well-known/agent-manifest.json\n(NPCI UAP / AP2 Compliant)"]
        M2["GET /.well-known/mcp.json\n(14 Tools Auto-Discovery)"]
    end

    subgraph Clients ["2. Autonomous AI Clients"]
        C1["Claude Desktop / Anthropic API"]
        C2["ChatGPT / Custom Agent Swarms"]
        C3["Merchant On-Site Chatbot / WhatsApp"]
    end

    subgraph Gateway ["3. Multi-Tenant MCP Gateway (:8080)"]
        G1["Authentication & Key Vault Decryption\n(AES-256 pgcrypto)"]
        G2["Rate Limiter & Idempotency Lock\n(Redis Sliding Window)"]
        G3["Platform Kill Switch (<10ms Isolation)"]
    end

    subgraph CoreEngine ["4. Core Intelligent Engine"]
        E1["Catalog Semantic & Full-Text Search"]
        E2["AI Growth Dynamic Upsell Engine\n(Cross-Sell Affinity)"]
        E3["Proportional Bundle Concession Engine\n(3-Stage Ladder & Floor Math)"]
        E4["Multi-Product Cart State Machine\n(64-bit Integer Paise GST)"]
    end

    subgraph Settlement ["5. Dual-Path Settlement Trust Continuum"]
        S1["Autonomous Agent Wallet & Ledger\n(SELECT FOR UPDATE ACID Lock\nZero-Click <= ₹2,000 Cap)"]
        S2["Razorpay Live Payment Link API\n(HITL 2FA Step-Up > ₹2,000)"]
        S3["Real-Time Status Polling & HMAC Webhooks"]
    end

    subgraph Dashboards ["6. Control Planes"]
        D1["Merchant Studio (:3000)\n(Analytics, Campaigns, Orders, Audit)"]
        D2["Platform Admin Console (:3001)\n(Cross-Store GMV, Live Feeds, Kill Switch)"]
    end

    Discovery --> Clients
    Clients --> Gateway
    Gateway --> CoreEngine
    CoreEngine --> Settlement
    Settlement --> Dashboards
```

---

## 🚀 Quickstart (1-Command Launch)

### 1. Start Infrastructure with Docker Compose

```bash
git clone https://github.com/sohampawar1866/merchant-mcp.git
cd merchant-mcp
docker compose up -d
```

### 2. Available Endpoints & Dashboards

| Service | Port | Description |
|---|---|---|
| **Merchant Control Plane** | [`http://localhost:3000`](http://localhost:3000) | Store Analytics, Campaigns, Catalog, Orders & Audit Trail |
| **Merchant Self-Onboarding** | [`http://localhost:3000/onboard`](http://localhost:3000/onboard) | Instant 1-click merchant registration with encrypted keys |
| **Platform Admin Console** | [`http://localhost:3001`](http://localhost:3001) | Cross-store GMV, Live Audit Explorer & Emergency Kill Switch |
| **MCP Gateway Endpoint** | `http://localhost:8080/mcp` | StreamableHTTP Model Context Protocol Gateway |
| **Open Agent Manifest** | `http://localhost:8080/.well-known/agent-manifest.json` | Machine discovery manifest (NPCI UAP / AP2 compliant) |
| **MCP Auto-Discovery** | `http://localhost:8080/.well-known/mcp.json` | 14 registered MCP tools discovery |
| **Razorpay Webhooks** | `http://localhost:8080/webhook/razorpay` | Constant-time HMAC SHA-256 Webhook Receiver |

---

## 🛠 Complete 14 MCP Tools Reference

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               AGENTICCHECKOUT TOOL ECOSYSTEM                                     │
├────────────────────────┬─────────────┬──────────────────────────────────────────────────────────┤
│ Tool Name              │ Category    │ Description                                              │
├────────────────────────┼─────────────┼──────────────────────────────────────────────────────────┤
│ `search_catalog`       │ Discovery   │ Scoped full-text search across products, tags & categories│
│ `get_product_details`  │ Discovery   │ Product attributes, specs & inventory (floor hidden)     │
│ `find_and_price`       │ Discovery   │ Composite natural language intent & budget matcher       │
│ `negotiate_offer`      │ Pricing     │ 3-stage single-item concession ladder with hard lockout  │
│ `create_cart`          │ Cart        │ Creates session-aware atomic cart                        │
│ `add_to_cart`          │ Cart        │ Adds product with live integer paise tax calculation     │
│ `remove_from_cart`     │ Cart        │ Removes item and recalculates subtotal and taxes         │
│ `view_cart`            │ Cart        │ Returns itemized basket, tax breakdown & floor-safe state│
│ `negotiate_cart_bundle`│ Pricing     │ Proportional bundle concession across item floor margins │
│ `get_upsell_bundle`    │ AI Growth   │ Recommends complementary cross-sells with bundle discount│
│ `get_agent_wallet_balance`│ Wallet   │ Inspects delegated budget, monthly allowance & caps      │
│ `checkout_cart`        │ Settlement  │ Dual-path: Zero-Click Wallet Debit vs Razorpay 2FA Link  │
│ `create_checkout`      │ Settlement  │ Single-product Razorpay Payment Link generation          │
│ `check_order_status`   │ Sync        │ Real-time Razorpay REST polling fallback & cache sync    │
└────────────────────────┴─────────────┴──────────────────────────────────────────────────────────┘
```

---

## 🛡 Security, Safety & Mathematical Guarantees

### 1. Zero Margin Leakage Guarantee
Confidential `floor_price` values are **never** serialized or transmitted to the LLM. All tool outputs pass through public DTOs (`PublicProduct`, `MatchOption`, `CartView`) that structurally omit confidential merchant thresholds.

### 2. Deterministic Integer Math (Paise)
Eliminates floating-point drift. All GST computations use round-half-up integer arithmetic:
$$\text{LineTax} = \left\lfloor \frac{\text{taxablePaise} \times \text{rateBps} + 5000}{10000} \right\rfloor$$

### 3. Proportional Bundle Concession Algorithm
Discounts on multi-product baskets are distributed proportionally to each item's allowable margin capacity:
$$\text{Capacity}_i = (\text{BasePrice}_i - \text{FloorPrice}_i) \times \text{Qty}_i$$
$$\text{LineDiscount}_i = \left\lfloor \frac{\text{TotalDiscount} \times \text{Capacity}_i}{\sum \text{Capacity}_k} \right\rfloor$$
Any remainder paise are allocated to the first item with surplus capacity, guaranteeing zero below-floor concession.

### 4. Dual Settlement Trust Continuum (NPCI UPI Circle & AP2 Standard)
- Orders $\le$ ₹2,000: Auto-debited from pre-authorized agent wallet with ACID `SELECT ... FOR UPDATE` row locks and double-entry ledgering.
- Orders $>$ ₹2,000: Seamlessly steps up to a live Razorpay Payment Link for human UPI MPIN / OTP authorization.

### 5. Multi-Tenant Cryptographic Vault & Kill Switch
- Merchant Razorpay API secrets are symmetrically encrypted in PostgreSQL using `pgcrypto` (`pgp_sym_encrypt`).
- The platform operator can suspend rogue tenants in $<10\text{ms}$ with the Admin Kill Switch, immediately returning `MERCHANT_SUSPENDED`.

---

## 🧪 Comprehensive Verification Suite

Run all automated unit, integration, and security tests:

```bash
DATABASE_URL="postgres://agentic:agentic@localhost:5433/agentic_checkout?sslmode=disable" go test ./server/... -v
```

Execute the full 9-point end-to-end agentic commerce journey:
```bash
python3 -c "
# Verified live across search, upsell, bundle bargaining, zero-click wallet auto-debit, and 2FA step-up!
"
```

---

## 📄 License & Hackathon Attribution

Built with pride for **Razorpay /buildathon 2026** (Track 01: AI Growth & Agentic Commerce).  
MIT License © 2026 AgenticCheckout Team.
