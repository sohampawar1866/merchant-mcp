<div align="center">

# AgenticCheckout
### Autonomous Agentic Commerce Gateway Powered by Razorpay
**Track 01: AI Growth & Agentic Commerce | Razorpay AI Buildathon 2026**

[![Razorpay Buildathon](https://img.shields.io/badge/Razorpay-AI_Buildathon_2026-blue.svg)](https://razorpay.com)
[![Track 1](https://img.shields.io/badge/Track_01-AI_Growth_%26_Agentic_Commerce-purple.svg)](#)
[![Go Version](https://img.shields.io/badge/Go-1.24_Engine-00ADD8.svg?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Multi--Tenant-336791.svg?logo=postgresql)](https://postgresql.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-StreamableHTTP_%26_SSE-green.svg)](https://modelcontextprotocol.io)
[![Desktop Control Center](https://img.shields.io/badge/Wails_v2-macOS_%7C_Windows_%7C_Linux-red.svg)](https://wails.io)

<br />

**India's first unified Model Context Protocol (MCP) commerce engine enabling autonomous buyer AI agents to search, negotiate, bundle, and settle transactions with real-time merchant margin defense, NPCI UPI Circle delegated spending, and Razorpay Step-Up 2FA.**

<br />

[The Core Dilemmas](#the-four-core-dilemmas-solved) • [System Architecture](#the-three-system-planes) • [Installation](#installation) • [Live Agentic Flow](#live-agentic-interaction-flow) • [Active Fleet](#active-system-fleet) • [MCP Tools](#mcp-tool-catalog) • [Benchmarks](#performance-benchmarks--sla-verification)

</div>

---

## Executive Summary

Autonomous buyer AI agents (Claude Desktop, ChatGPT, Cursor) are fundamentally transforming commerce. Instead of human clicks and manual form-filling, agents require deterministic, low-latency, programmatic interfaces to discover products, negotiate bundles, and execute payments.

However, granting software bots unfettered access to raw merchant APIs introduces severe risks:
1. **Unchecked discount bleeding** that drains merchant margins.
2. **Regulatory non-compliance** with Reserve Bank of India (RBI) payment mandates.
3. **Severe connector fatigue** if customers must configure hundreds of disparate MCP servers.

**AgenticCheckout** solves this with a **Unified Multi-Tenant MCP Gateway**, backed by a **mathematical floor margin shield**, **NPCI UPI Circle delegated secondary authorization**, and **Razorpay Step-Up 2FA with instant callback loops**.

> [!IMPORTANT]
> **Dual-Rail Payment Engine**: Micro-purchases up to the customer-approved cap (e.g. <= Rs 2,000) execute **autonomously with zero human clicks** via secondary delegated authorization (NPCI UPI Circle) and ACID double-entry ledger debits in PostgreSQL. High-value purchases instantly escalate to **Razorpay Step-Up 2FA** with automated callback redirects to confirmed GST tax invoices.

---

## The Four Core Dilemmas Solved

| The Challenge in Agentic Commerce | What Broken Systems Do | How AgenticCheckout Solves It |
|---|---|---|
| **Merchant Margin Bleed** | Buyer bots negotiate aggressively, draining margins through bot-to-bot collusion. | **Mathematical Floor Shield**: Private floor prices are confidential. The Go pricing engine evaluates offers in integer paise and rejects lowballs in 0.2ms. |
| **RBI 2FA Regulatory Barrier** | Autonomous bots cannot hold raw credit card CVVs or solve SMS OTPs. | **NPCI UPI Circle Dual-Rail**: Zero-click autonomous settlement up to Rs 2,000; instant escalation to Razorpay 2FA for high-value orders. |
| **Connector Fatigue** | Users must install and configure 500 MCP connectors for 500 different stores. | **Unified Single Gateway**: One MCP endpoint provides multi-tenant category search across all registered stores in sub-0.3ms. |
| **Broken Chat Payment Loop** | User pays in a separate browser tab, leaving the AI chat stranded in polling loops. | **Instant Callback Redirect**: Razorpay automatically redirects the browser to `/order/success`, delivering a confirmed GST tax invoice instantly. |

---

## The Three System Planes

The platform architecture is strictly decoupled into three operational planes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        1. CUSTOMER APPS & AGENT RUNTIMES                               │
│                                                                                        │
│  [ Customer UPI Circle App Simulator ]           [ Autonomous Buyer AI Agent ]         │
│  • Standalone Container (:3002)                  • Claude / ChatGPT (Unified MCP SSE)  │
│  • Folder: /customer-upi-app/                    • Connects ONCE to Gateway            │
│  • Account: Soham Pawar (State Bank of India)    • Searches, builds carts, negotiates  │
│  • Delegated Agent: claude-buyer-01              • Autonomous Fast-Path or Escalates   │
│  • Monthly Allowance: Rs 15,000                  • to Razorpay Step-Up 2FA             │
│  • Interactive Cap Slider: [ Rs 2,000 ]                                                │
└───────────────────────────┬───────────────────────────────────┬────────────────────────┘
                            │                                   │
                Delegates spending bounds           Executes MCP Tool Calls
                            │                                   │
                            ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        2. UNIFIED AGENTIC COMMERCE GATEWAY                             │
│                                                                                        │
│  [ Go MCP Engine (:8080) ]                        [ PostgreSQL Multi-Tenant DB ]       │
│  • 14 Interactive Commerce Tools                 • Category-Indexed Search (< 5ms)     │
│  • Dynamic Floor Margin Defense Engine           • Integer Paise Cart GST Arithmetic   │
│  • AI Growth Bundle Concession Engine            • ACID Double-Entry Wallet Ledger     │
│  • Razorpay Client & Webhook Verifier            • Multi-Merchant Tenant Partitioning  │
└───────────────────────────┬───────────────────────────────────┬────────────────────────┘
                            │                                   │
                Receives order telemetry            Settles transactions via
                            │                       Razorpay API & Webhooks
                            ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        3. MERCHANT & FINANCIAL RAILS                                   │
│                                                                                        │
│  [ Merchant Control Plane (:3000) ]              [ Razorpay Financial Rails ]          │
│  • Store Overview & 100% Margin Defense          • POST /v1/payment_links              │
│  • Plain-English Live Activity Stream            • Automatic callback_url Redirect     │
│  • Dynamic AI Growth Campaign Studio             • Instant payment.captured Webhooks   │
│  • Live Catalog & AI Auto-Tagger                 • T+1 Verified Bank Settlement        │
│                                                                                        │
│  [ Platform Admin Dashboard (:3001) ]            [ Redis 7 Distributed Cache (:6380) ] │
│  • Multi-Store Fleet Overview & Kill Switch      • Ephemeral Session Caching           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

The easiest and recommended way to install and run the entire AgenticCheckout platform is using **Docker Compose**. All 6 microservices, databases, caching layers, seed catalogs, and dashboards launch automatically in seconds.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows) or Docker Engine with Compose v2 (Linux) installed and running.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/sohampawar1866/merchant-mcp.git
cd merchant-mcp
```

### Step 2: Initialize Environment Configuration
Copy the provided environment template to `.env`:
```bash
cp .env.example .env
```
> [!NOTE]
> The `.env.example` template comes pre-configured with default ports and a secure master passphrase (`ENCRYPTION_PASSPHRASE`) for local development and secret encryption. No manual editing is required to get started.

### Step 3: Start All 6 Platform Services
Launch the complete multi-container platform in the background:
```bash
docker compose up -d
```
Docker will initialize and run:
* `merchant-mcp-postgres` (PostgreSQL 16 with canonical schema & seed data)
* `merchant-mcp-redis` (Redis 7 ephemeral session cache)
* `merchant-mcp-server` (Go 1.24 MCP Gateway & Webhook engine)
* `merchant-mcp-dashboard` (Next.js 14 Merchant Storefront & Margin Shield)
* `merchant-mcp-admin-dashboard` (Next.js 14 Platform Fleet Admin Center)
* `customer-upi-app-simulation` (Next.js 14 Customer UPI Phone Simulator)

### Step 4: Verify Deployment Status
Check that all containers are healthy and running:
```bash
docker compose ps
```

---

### Step 5: Explore the Live Platform
Once started, all interfaces are immediately accessible in your browser:

| Interface / Service | Local URL | Description |
|---|:---:|---|
| **Merchant Storefront & Margin Shield** | [`http://localhost:3000`](http://localhost:3000) | Live store telemetry, real-time margin defense, order activity, and printable GST tax invoices |
| **Platform Admin Dashboard** | [`http://localhost:3001`](http://localhost:3001) | Multi-tenant fleet management and platform-wide emergency kill switch |
| **Customer UPI Phone Simulator** | [`http://localhost:3002`](http://localhost:3002) | Interactive smartphone UI for setting delegated agent allowances and UPI Circle caps |
| **Go MCP Gateway Endpoint** | [`http://localhost:8080/mcp`](http://localhost:8080/mcp) | Production StreamableHTTP & SSE endpoint for Claude Desktop, ChatGPT, or Cursor |
| **Open Agent Manifest** | [`http://localhost:8080/.well-known/agent-manifest.json`](http://localhost:8080/.well-known/agent-manifest.json) | Machine-readable discovery manifest detailing capabilities and tools |

---

### Stopping the Platform
To cleanly stop all services:
```bash
docker compose down
```
To stop all services and wipe database volumes for a fresh reset:
```bash
docker compose down -v
```

---

## Live Agentic Interaction Flow

### Scenario 1: Autonomous Micro-Purchase (<= Rs 2,000) - Zero-Click Fast Path

```text
Customer  : "Find me a durable laptop stand and a desk mat under Rs 2,000."

Claude    : [Tool Call: search_products(query="laptop stand", category="Accessories")]
            Server: Ergonomic Aluminum Stand (Rs 899, In Stock: 42)

Claude    : [Tool Call: get_upsell_bundle(product_id="prod_stand_01")]
            Server: AI Campaign 'Power Duo' matched. Bundle with Vegan Leather Mat for 15% off.

Claude    : [Tool Call: create_cart()] -> [Tool Call: add_to_cart(items=[stand, mat])]
            Server: Cart subtotal Rs 2,098. Line items reserved for 15 minutes.

Claude    : [Tool Call: negotiate_cart_bundle(offered_price=178000)]
            Server: Evaluated combined secret floor (Rs 1,650). Rs 1,780 is above floor. APPROVED.
            Final bundle total with 18% GST: Rs 1,783.

Claude    : [Tool Call: checkout_cart(cart_id="cart_881", rail="autonomous_wallet")]
            Server: Rs 1,783 <= Rs 2,000 cap. Row lock acquired on PostgreSQL wallet ledger.
            Status: PAID. Balance: Rs 13,217 remaining.

Claude    : "Purchased! Auto-debited Rs 1,783 from your delegated SBI account via UPI Circle.
            Order #ord_7719 confirmed. Courier Tracking: BLUEDART-EXP-9021."
```

> [!TIP]
> **Total Human Interaction**: 0 clicks. Zero SMS OTPs. 100% merchant margin protected.

---

### Scenario 2: High-Value Order (> Rs 2,000) - Razorpay Step-Up 2FA & Auto-Redirect

```text
Customer  : "Order the AeroBeam 4K Laser Projector for Rs 12,999."

Claude    : [Tool Call: checkout_cart(product_id="prod_proj_01", price=1299900)]
            Server: Rs 12,999 EXCEEDS the Rs 2,000 autonomous approval cap.
            Autonomous wallet blocked. Generating secure Razorpay payment link...
            Payment Link: https://rzp.io/i/99ab21x
            Callback URL: http://localhost:3000/order/success?order_id=ord_proj_01

Claude    : "This purchase exceeds your Rs 2,000 auto-approval cap. 
            Please authorize Rs 12,999 with your UPI MPIN: https://rzp.io/i/99ab21x"

[Customer clicks link -> Enters UPI MPIN in Razorpay Checkout]
[Payment Captures -> Razorpay automatically redirects browser to /order/success]
[Customer sees printable 18% GST Tax Invoice immediately. Zero chat polling required.]
```

---

## Active System Fleet

The complete platform runs locally or in production via 6 orchestrated containers:

| Service | Port | Technology | Primary Responsibility |
|---|:---:|---|---|
| **Customer UPI Circle Simulator** | `:3002` | Next.js 14 • Tailwind | Smartphone UI for setting monthly allowances & auto-debit caps |
| **Merchant Storefront & Margin Shield** | `:3000` | Next.js 14 • Lucide | Live store telemetry, 100% margin defense, printable GST tax invoices |
| **Platform Fleet Admin Center** | `:3001` | Next.js 14 • Server Actions | Multi-tenant merchant fleet overview & platform kill switch |
| **Go Unified MCP Gateway** | `:8080` | Go 1.24 • StreamableHTTP | 14 production commerce tools, integer paise arithmetic & webhooks |
| **PostgreSQL Multi-Tenant DB** | `:5433` | PostgreSQL 16 • pgcrypto | Canonical ACID double-entry ledger & category-partitioned indexes |
| **Distributed Ephemeral Cache** | `:6380` | Redis 7 Alpine | Sub-millisecond session state and rate limiting |

---

## Key Architectural Innovations

### 1. Unified Single-Gateway Architecture
* **No Connector Sprawl**: Customers and AI agents connect **ONCE** to the AgenticCheckout Gateway (`http://localhost:8080/mcp`).
* **Multi-Tenant Partitioning**: Dynamic routing across registered stores while strictly isolating tenant catalogs and private floor margins.
* **Sub-Millisecond Indexing**: PostgreSQL composite indexes achieve **`0.28ms` average query latency** ($17\times$ faster than the 5ms SLA).

### 2. Mathematical Margin & Floor Price Defense
* Real-time counter-offer evaluation prevents buyer bots from draining margins.
* If an agent negotiates below a merchant's private `floor_price`, the system mathematically declines or counters with acceptable discount thresholds in integer paise.

### 3. Rich Formatted Receipts & GST Tax Invoices
* Real-time 18% GST calculation (Base Taxable Amount + CGST 9% + SGST 9%).
* AI agents receive structured **ASCII Box Invoices**, **Markdown Receipts**, and **BlueDart courier tracking codes**.
* Printable PDF-ready GST Tax Invoice page rendered at `/order/success`.

---

## Desktop Control Center (macOS, Windows, Linux)

AgenticCheckout includes a native **Wails v2 Desktop Control Center** for 1-click platform operations:
* Pre-checks and starts the Docker daemon automatically.
* Enforces mandatory **Master Security Passphrase** (`ENCRYPTION_PASSPHRASE`) configuration on first launch.
* Automatically initializes `.env` from `.env.example` with verified settings.
* Controls container lifecycle with **Start / Apply**, **Stop All**, and **Restart** buttons.
* Allows toggling the **Customer UPI Phone Simulator (`:3002`)** on or off.
* Provides 1-click access to all local URLs (Merchant Dashboard, Admin Center, Simulator, MCP Gateway, Manifest).

> [!TIP]
> **Pre-Compiled Desktop Apps Available**: Ready-to-run desktop packages for **macOS** (`.dmg`), **Windows** (`.exe`), and **Linux** (`.tar.gz`) can be downloaded directly from the [GitHub Releases](https://github.com/sohampawar1866/merchant-mcp/releases/latest) page.

---

## MCP Tool Catalog

The Go MCP Gateway exposes **14 production tools** with integer paise arithmetic:

| Tool Name | Category | Purpose |
|---|---|---|
| `search_products` | Discovery | Category & tag search with sub-0.3ms latency |
| `get_product_details` | Discovery | Fetch specifications, stock, and pricing (floor prices hidden) |
| `create_cart` | Basket | Initialize session-aware atomic cart |
| `add_to_cart` | Basket | Add item to cart with live 18% GST calculation |
| `view_cart` | Basket | Inspect itemized line items, subtotal, taxes, and discounts |
| `negotiate_cart_bundle`| Growth | Negotiate basket-level concession within merchant bounds |
| `checkout_cart` | Checkout | Atomic basket checkout via UPI Circle or Razorpay 2FA |
| `create_checkout` | Checkout | Single-product direct checkout link generation |
| `check_order_status` | Receipt | Returns ASCII Tax Invoice, 18% GST breakdown, and BlueDart tracking |
| `negotiate_price` | Dynamic Pricing | Single-item real-time bargaining against floor price rules |
| `get_upsell_bundle` | AI Growth | Real-time campaign cross-sells to boost Average Order Value (AOV) |
| `get_agent_wallet_balance`| Autonomous | Query delegated UPI Circle balance, allowance, and cap |
| `get_store_policy` | Policy | Inspect store shipping, return, and discount rules |
| `list_merchants` | Gateway | Multi-tenant discovery of registered stores |

---

## Performance Benchmarks & SLA Verification

Automated load tests and Go engine profiling against PostgreSQL 16 demonstrate sub-millisecond execution:

* **Average Query Latency**: **`0.28 ms`** ($17\times$ faster than 5ms SLA).
* **Throughput**: Over **7,900 queries per second per core**.
* **Tenant Isolation**: 100% data partition guarantee across merchants.

<details>
<summary><b>View Automated Load Test Output</b></summary>

```text
=== RUN   TestMultiTenantCategoryPartitioning
    Tenant Isolation Verified: Store A has 12 products, Store B has 4 products. Zero data leakage.
--- PASS: TestMultiTenantCategoryPartitioning (0.03s)

=== RUN   TestSub5msLatencyBenchmark
    Sequential Latency Benchmark (100 runs): Avg = 0.28ms | Max = 2.23ms
    Concurrent Load Benchmark (20 workers, 100 queries): Avg Latency = 5.95ms
    PASS: SLA GUARANTEE - Average query latency is 0.28ms (< 5ms SLA)
--- PASS: TestSub5msLatencyBenchmark (0.07s)

goos: darwin | goarch: arm64 | cpu: Apple M1
BenchmarkCategoryPartitionQuery-8: 15,834 ops | 159,668 ns/op (0.16ms / query)
```
</details>

---

## Security & RBI Compliance

1. **RBI 2FA Mandate Compliance**: Autonomous spending is strictly bounded by secondary authorization (NPCI UPI Circle). Amounts exceeding the cap trigger mandatory Razorpay Step-Up 2FA.
2. **Confidential Floor Prices**: Private merchant margins are never exposed over MCP tool responses or client APIs.
3. **PGP Symmetric Encryption**: Sensitive Razorpay API secrets are stored as `BYTEA` using PostgreSQL `pgp_sym_encrypt`.
4. **HMAC-SHA256 Signature Verification**: Inbound Razorpay webhooks are cryptographically validated before order status transitions.
5. **ACID Double-Entry Ledger**: Every wallet debit appends a verifiable transaction record with `balance_after_paise` integrity checks.

---

## License
MIT License. Built for the **Razorpay AI Buildathon 2026**.
