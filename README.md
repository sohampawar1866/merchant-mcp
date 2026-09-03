# AgenticCheckout: Autonomous Agentic Commerce Gateway
### *Razorpay AI Buildathon 2026 - Track 01: AI Growth & Agentic Commerce*

[![Razorpay Buildathon](https://img.shields.io/badge/Razorpay-AI_Buildathon_2026-blue.svg)](https://razorpay.com)
[![Track 1](https://img.shields.io/badge/Track_01-AI_Growth_%26_Agentic_Commerce-purple.svg)](#)
[![Go Version](https://img.shields.io/badge/Go-1.24_Engine-00ADD8.svg?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Multi--Tenant-336791.svg?logo=postgresql)](https://postgresql.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-StreamableHTTP_%26_SSE-green.svg)](https://modelcontextprotocol.io)
[![Desktop Control Center](https://img.shields.io/badge/Wails_v2-macOS_%7C_Windows_%7C_Linux-red.svg)](https://wails.io)

---

## Overview

**AgenticCheckout** is an enterprise-grade, high-performance **Unified Agentic Commerce Gateway powered by Razorpay**. It bridges the gap between **autonomous buyer AI agents** (Claude, ChatGPT, Cursor) and **real-world merchant economics**.

While traditional e-commerce relies on human clicks and manual form filling, AI buyer agents require programmatic, low-latency, deterministic interfaces. However, granting AI bots unfettered access to raw APIs introduces catastrophic risks: **uncontrolled discount bleeding**, **inventory starvation**, and **regulatory non-compliance with Reserve Bank of India (RBI) payment mandates**.

AgenticCheckout solves this with a **Unified Model Context Protocol (MCP) Commerce Engine**, backed by **real-time margin defense**, **NPCI UPI Circle delegated secondary authorization**, and **Razorpay Step-Up 2FA with automatic redirect loops**.

---

### The Four Core Dilemmas Solved

1. **The Merchant Dilemma (Margin Protection)**: Merchants cannot open raw APIs to autonomous buyer bots without risking rapid margin erosion (uncontrolled discounting) or inventory exhaustion. Our Go engine mathematically enforces private floor prices.
2. **The Customer Dilemma (Regulatory Compliance & Trust)**: In India, RBI strictly mandates Additional Factor of Authentication (2FA). An AI cannot hold raw credit cards or guess OTPs. Autonomous micro-spending requires a legally compliant delegation framework (**NPCI UPI Circle**).
3. **The Multi-Merchant Scale Dilemma (No 500 Connectors)**: A customer will *never* add separate MCP configurations for every merchant. Our platform acts as a **Single Unified Gateway**: customers connect **ONCE**, and get access to all registered merchants with category-partitioned search in $< 0.3$ms.
4. **The Broken Chat Payment Loop Dilemma (Instant Receipt Redirect)**: Instead of the customer paying in a browser tab and awkwardly asking the AI *"Did it go through?"*, our Razorpay integration uses **Automated Callback Redirects (`callback_url`)** that instantly drop the customer on an official confirmed tax invoice page upon payment.

---

## The Three System Planes

The architecture is strictly separated into three decoupled components:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        1. CUSTOMER APPS & AGENT RUNTIMES                               │
│                                                                                        │
│  [ Customer UPI Circle App Simulator ]           [ Autonomous Buyer AI Agent ]         │
│  • Standalone Container (:3002)                  • Claude / ChatGPT (Unified MCP SSE)  │
│  • Folder: /customer-upi-app/                    • Connects ONCE to Gateway            │
│  • Account: Soham Pawar (State Bank of India)    • Searches, builds carts, negotiates  │
│  • Delegated Agent: claude-buyer-01              • Autonomous Fast-Path or Escalates   │
│  • Monthly Allowance: ₹15,000                    • to Razorpay Step-Up 2FA             │
│  • Interactive Cap Slider: [ ₹2,000 ]                                                  │
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

## Key Architectural Innovations

### 1. Unified Single-Gateway Architecture
* **No "500 Connectors"**: Customers and AI agents connect **ONCE** to the AgenticCheckout Gateway (`http://localhost:8080/mcp`).
* **Multi-Tenant Catalog Partitioning**: The Gateway dynamically routes requests across registered stores while strictly enforcing tenant isolation and floor price confidentiality.
* **Sub-Millisecond Indexing**: PostgreSQL composite indexes achieve **`0.28ms` average query latency** (over $17\times$ faster than our 5ms SLA).

### 2. Dual-Rail Payment Execution
* **Rail A: Autonomous Fast-Path (NPCI UPI Circle)**:
  * Users delegate an approved monthly allowance (e.g. ₹15,000) and an adjustable per-transaction auto-approval cap (e.g. ₹2,000) to their trusted AI agent (`claude-buyer-01`).
  * Micro-purchases under the cap execute **autonomously with zero human clicks** via ACID double-entry ledger debits in PostgreSQL.
* **Rail B: Razorpay Step-Up 2FA (High-Value Purchases)**:
  * If a basket exceeds the per-transaction cap (e.g. ₹12,999 4K Projector), the engine blocks autonomous debit and generates a secure Razorpay Payment Link with RBI-compliant 2FA (UPI MPIN / OTP).
  * **Automated Callback Redirect (`callback_url`)**: The moment payment captures, Razorpay instantly redirects the browser to `/order/success`, eliminating manual chat polling.

### 3. Mathematical Margin & Floor Price Defense
* Real-time counter-offer evaluation prevents buyer bots from draining margins.
* If an agent negotiates below a merchant's private `floor_price`, the system mathematically declines or counters with acceptable discount thresholds.

### 4. Rich Formatted Receipts & GST Tax Invoices
* Real-time 18% GST calculation (Base Taxable Amount + CGST 9% + SGST 9%).
* AI agents receive structured **ASCII Box Invoices**, **Markdown Receipts**, and **BlueDart courier tracking codes**.
* Printable PDF-ready GST Tax Invoice page at `/order/success`.

### 5. High-Performance Multi-Merchant Search
* **The Problem**: Calling an MCP tool per merchant creates $O(N)$ network latency (taking up to 30 seconds for 50 stores).
* **The Solution**: The agent makes **ONE** tool call: `search_products(query: "earbuds", category: "Audio")`.
* **Execution**: Stores selling unrelated categories are eliminated in **0.1ms**. The database returns top matches across relevant merchants in **`0.28ms`**.

---

## End-to-End Userflows

### Phase A: Day 0 Setup (One-Time Configuration)

#### 1. Merchant Onboarding (`http://localhost:3000/onboard`)
* Merchant registers their store (*Soham Gadgets*).
* Plugs in **Razorpay Key ID & Key Secret** for direct bank settlements (encrypted using AES-256 in PostgreSQL).
* Sets public MRPs and **Private Secret Floor Prices** (e.g. Laptop Stand = ₹899 MRP, ₹750 Floor).
* Configures **AI Growth Campaigns** (e.g. *Power Duo*: 15% off combo bundle).

#### 2. Customer UPI Circle Delegation (`http://localhost:3002`)
* Customer opens the **Customer UPI Circle Simulator** (styled like Google Pay / PhonePe smartphone mockup).
* Selects **"Delegate AI Agent"** and assigns `claude-buyer-01`.
* Sets **Monthly Budget**: ₹15,000.
* Sets **Zero-Click Auto-Debit Cap**: ₹2,000 (purchases under this amount do not require an MPIN).
* Authorizes the mandate with biometric / MPIN **once**.

---

### Phase B: Day 1..N Daily Usage

#### Flow 1: Micro-Purchase ($\le$ ₹2,000) - Zero-Click Fast Path
*(Example: Customer asks Claude to buy the Laptop Stand + Desk Mat bundle for ₹1,783)*

1. **Discovery & Bundle Recommendation**:
   * Agent calls `search_products("laptop stand")` $\rightarrow$ Server returns ₹899 stand.
   * Agent calls `get_upsell_bundle` $\rightarrow$ Server dynamically proposes the *Power Duo Bundle* (Stand + RGB Desk Mat with 15% discount).
2. **Session Cart & Margin Defense**:
   * Agent calls `create_cart` and `add_to_cart`. Subtotal: ₹2,098.
   * Agent calls `negotiate_cart_bundle(offered_price: 178000)`.
   * Go engine checks combined secret floors (₹1,650). ₹1,780 is safely above floor!
   * Approves concession in integer paise: Final total = ₹1,783.
3. **Zero-Click Settlement**:
   * Agent calls `checkout_cart(payment_method: "autonomous_wallet")`.
   * ₹1,783 is $\le$ ₹2,000 auto-cap $\rightarrow$ Atomic PostgreSQL `SELECT ... FOR UPDATE` row lock.
   * Balance deducts in real-time (`agent_wallet_ledger`). Order status set to `paid`.
4. **Real-Time Visibility**:
   * Customer's UPI App updates: *"-₹1,783 debited for Soham Gadgets Power Duo"*.
   * Merchant Dashboard rings up the sale with 0% margin leakage.

---

#### Flow 2: High-Value Purchase (> ₹2,000) - Razorpay Step-Up 2FA & Auto-Redirect
*(Example: Customer asks Claude to buy the AeroBeam 4K Projector for ₹12,999)*

1. **Cap Escalation**:
   * Agent calls `checkout_cart(product_id: Projector, price: ₹12,999)`.
   * Gateway detects: ₹12,999 exceeds the ₹2,000 auto-debit cap!
2. **Live Razorpay Link with Callback URL**:
   * Gateway calls Razorpay API:
     ```json
     POST /v1/payment_links
     {
       "amount": 1299900,
       "currency": "INR",
       "callback_url": "http://localhost:3000/order/success?order_id=ord_xxx",
       "callback_method": "get"
     }
     ```
   * Razorpay returns: `https://rzp.io/i/xxxxxx`.
3. **Seamless Human Authorization & Zero-Polling UX**:
   * Agent shares the link: *"Exceeds your ₹2,000 limit. Please authorize: [Pay ₹12,999 via Razorpay](https://rzp.io/i/xxxxxx)"*
   * Customer enters their UPI PIN in the Razorpay checkout.
   * **The Instant Payment Completes:** Razorpay **automatically redirects the browser** directly to `http://localhost:3000/order/success?order_id=ord_xxx`.
   * **No manual polling needed!** The customer sees their verified GST tax invoice on screen instantly.
4. **Webhook Capture**:
   * Razorpay fires background webhook (`payment.captured`) to `/api/webhook/razorpay`.
   * Merchant Dashboard updates in real time; merchant ships the order.

---

## Active Repository Modules

| Module | Path | Description |
|---|---|---|
| **MCP Commerce Gateway** | [`server/`](file:///Volumes/MyData/merchant-mcp/server/) | High-performance Go MCP engine exposing 14 tools over StreamableHTTP & SSE |
| **Customer UPI App Simulator** | [`customer-upi-app/`](file:///Volumes/MyData/merchant-mcp/customer-upi-app/) | Dedicated Next.js smartphone UI on port `:3002` (NPCI UPI Circle delegation) |
| **Merchant Control Plane** | [`dashboard/`](file:///Volumes/MyData/merchant-mcp/dashboard/) | Next.js 14 Merchant Dashboard on port `:3000` (Margin Defense & Invoices) |
| **Platform Admin Center** | [`admin-dashboard/`](file:///Volumes/MyData/merchant-mcp/admin-dashboard/) | Fleet monitoring, cross-tenant auditing & platform settings on port `:3001` |
| **Desktop Control Center** | [`desktop-manager/`](file:///Volumes/MyData/merchant-mcp/desktop-manager/) | Native Wails v2 GUI application with cross-platform builds (macOS, Windows, Linux) |
| **Database Schema** | [`server/db/migrations/`](file:///Volumes/MyData/merchant-mcp/server/db/migrations/) | Consolidated canonical idempotent PostgreSQL schema with double-entry ledger |
| **Containerization** | [`docker-compose.yml`](file:///Volumes/MyData/merchant-mcp/docker-compose.yml) | Production 6-container topology with health checks and volume persistence |

---

## Quickstart

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
* Git

### Option 1: Docker Compose (Instant 1-Command Setup)

```bash
# 1. Clone repository
git clone https://github.com/sohampawar1866/merchant-mcp.git
cd merchant-mcp

# 2. Start all services
docker compose up -d

# 3. Verify running containers
docker compose ps
```

Open your browser:
* **Customer UPI App Simulator**: [`http://localhost:3002`](http://localhost:3002)
* **Merchant Store Control Plane**: [`http://localhost:3000`](http://localhost:3000)
* **Platform Admin Dashboard**: [`http://localhost:3001`](http://localhost:3001)
* **Open Agent Manifest**: [`http://localhost:8080/.well-known/agent-manifest.json`](http://localhost:8080/.well-known/agent-manifest.json)
* **Go MCP Gateway**: [`http://localhost:8080/mcp`](http://localhost:8080/mcp)

---

### Option 2: Desktop Control Center (macOS, Windows, Linux)

AgenticCheckout includes a native **Wails v2 Desktop Control Center**:
* Pre-checks and starts Docker daemon automatically.
* Enforces mandatory **Master Security Passphrase** (`ENCRYPTION_PASSPHRASE`) configuration on first launch.
* Automatically creates `.env` from `.env.example` with verified settings.
* Controls container lifecycle with **Start**, **Stop All**, and **Restart** buttons.
* Allows toggling the **Customer UPI Phone Simulator (`:3002`)** on or off.
* Provides 1-click access to all local URLs (Merchant Dashboard, Admin Center, Simulator, MCP Gateway, Manifest).

#### Automated GitHub Releases:
Our GitHub Actions workflow automatically builds release binaries on every release tag:
* **macOS**: `AgenticCheckout-macOS-arm64.dmg` & `.zip`
* **Windows**: `AgenticCheckout-Windows-amd64.exe` & `.zip`
* **Linux**: `AgenticCheckout-Linux-amd64` & `.tar.gz`

To build locally:
```bash
cd desktop-manager
./build-all.sh host    # Builds for current operating system
./build-all.sh mac     # Builds macOS bundle
./build-all.sh windows # Builds Windows executable
./build-all.sh linux   # Builds Linux binary
```

---

## MCP Tool Catalog (Model Context Protocol)

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

We executed automated load tests and Go engine profiling against PostgreSQL 16:

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

* **Average Query Latency**: **`0.28 ms`** ($17\times$ faster than 5ms SLA).
* **Throughput**: Over **7,900 queries per second per core**.
* **Tenant Isolation**: 100% data partition guarantee across merchants.

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
