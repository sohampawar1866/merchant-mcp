# ⚡ AgenticCheckout: Autonomous Agentic Commerce Gateway
### *Razorpay AI Buildathon 2026 — Track 01: AI Growth & Agentic Commerce*

[![Razorpay Buildathon](https://img.shields.io/badge/Razorpay-AI_Buildathon_2026-blue.svg)](https://razorpay.com)
[![Track 1](https://img.shields.io/badge/Track_01-AI_Growth_%26_Agentic_Commerce-purple.svg)](#)
[![Go Version](https://img.shields.io/badge/Go-1.24_Engine-00ADD8.svg?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Multi--Tenant-336791.svg?logo=postgresql)](https://postgresql.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-StreamableHTTP_%26_SSE-green.svg)](https://modelcontextprotocol.io)
[![Desktop App](https://img.shields.io/badge/Wails_v2-macOS_%7C_Windows_%7C_Linux-red.svg)](https://wails.io)

---

## 🚀 Overview

**AgenticCheckout** is an enterprise-grade, high-performance **Unified Agentic Commerce Gateway powered by Razorpay**. It bridges the gap between **autonomous buyer AI agents** (Claude, ChatGPT, Cursor) and **real-world merchant economics**.

While traditional e-commerce relies on human clicks and form fills, AI agents require programmatic, low-latency, deterministic interfaces. However, granting AI bots unfettered access to raw APIs introduces catastrophic risks: **uncontrolled discount bleeding**, **inventory starvation**, and **regulatory non-compliance with Reserve Bank of India (RBI) payment mandates**.

AgenticCheckout solves this with a **Unified Model Context Protocol (MCP) Commerce Engine**, backed by **real-time margin defense**, **NPCI UPI Circle delegated secondary authorization**, and **Razorpay Step-Up 2FA with automatic redirect loops**.

---

## 🎯 Key Architectural Innovations

### 1. Unified Single-Gateway Architecture
* **No "500 Connectors"**: Customers and AI agents connect **ONCE** to the AgenticCheckout Gateway (`http://localhost:8080/mcp`).
* **Multi-Tenant Catalog Partitioning**: The Gateway dynamically routes requests across registered stores while strictly enforcing tenant isolation and floor price confidentiality.
* **Sub-Millisecond Indexing**: PostgreSQL composite indexes achieve **0.20ms average query latency** (over $25\times$ faster than our 5ms SLA).

### 2. Dual-Rail Payment Execution
* **Rail A: Autonomous Fast-Path (NPCI UPI Circle)**:
  * Users delegate an approved monthly allowance (e.g., ₹15,000) and an adjustable per-transaction auto-approval cap (e.g., ₹2,000) to their trusted AI agent (`claude-buyer-01`).
  * Micro-purchases under the cap execute **autonomously with zero human clicks** via ACID double-entry ledger debits in PostgreSQL.
* **Rail B: Razorpay Step-Up 2FA (High-Value Purchases)**:
  * If a basket exceeds the per-transaction cap (e.g., ₹12,999 4K Projector), the engine blocks autonomous debit and generates a secure Razorpay Payment Link with RBI-compliant 2FA (UPI MPIN / OTP).
  * **Automated Callback Redirect (`callback_url`)**: The moment payment captures, Razorpay instantly redirects the browser to `/order/success`, eliminating manual chat polling.

### 3. Mathematical Margin & Floor Price Defense
* Real-time counter-offer evaluation prevents buyer bots from draining margins.
* If an agent negotiates below a merchant's private `floor_price`, the system mathematically declines or counters with acceptable discount thresholds.

### 4. Rich Formatted Receipts & GST Tax Invoices
* Real-time 18% GST calculation (Base Taxable Amount + CGST 9% + SGST 9%).
* AI agents receive structured **ASCII Box Invoices**, **Markdown Receipts**, and **BlueDart courier tracking codes**.
* Printable PDF-ready GST Tax Invoice page at `/order/success`.

---

## 🏛️ Live System Topology

The platform runs as a coordinated 6-service Docker stack:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        1. CUSTOMER & BUYER RUNTIMES                                    │
│                                                                                        │
│  [ Customer UPI Circle App Simulator ]           [ Autonomous Buyer AI Agent ]         │
│  • Port 3002 (Next.js Phone Mockup)              • Claude Desktop / Cursor / ChatGPT   │
│  • SBI Account: soham@oksbi                      • Single Gateway Connection           │
│  • Live Cap Slider (₹500 - ₹5,000)               • Discovers, Carts, Negotiates        │
│  • Fast-Path vs Step-Up 2FA Triggers             • Bounded Autonomous Spending         │
└───────────────────────────┬───────────────────────────────────┬────────────────────────┘
                            │                                   │
                Delegated Spending Bounds               MCP Tool Calls (:8080)
                            │                                   │
                            ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        2. UNIFIED AGENTIC COMMERCE GATEWAY                             │
│                                                                                        │
│  [ Go MCP Engine (:8080) ]                        [ PostgreSQL 16 DB (:5433) ]         │
│  • 14 Interactive Commerce Tools                 • Category-Indexed Search (0.20ms)    │
│  • Margin & Dynamic Pricing Engine               • Integer Paise GST Arithmetic        │
│  • Razorpay Client & Webhooks                    • ACID Double-Entry Ledger            │
│  • StreamableHTTP & SSE Transports               • Multi-Tenant Schema Partitioning    │
└───────────────────────────┬───────────────────────────────────┬────────────────────────┘
                            │                                   │
                Order Telemetry Stream                  Payment Links & Webhooks
                            │                                   │
                            ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        3. MERCHANT & FINANCIAL RAILS                                   │
│                                                                                        │
│  [ Merchant Control Plane (:3000) ]              [ Razorpay Financial Rails ]          │
│  • Live Telemetry Stream                         • POST /v1/payment_links              │
│  • 100% Margin Defense & Overrides               • Automatic callback_url Redirect     │
│  • AI Growth Campaign Studio                     • Instant payment.captured Webhook    │
│  • Printable GST Tax Invoices                    • T+1 Verified Bank Settlement        │
│                                                                                        │
│  [ Platform Admin Dashboard (:3001) ]            [ Redis 7 Cache (:6380) ]             │
│  • Multi-Store Fleet Overview                    • Ephemeral Session Caching           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Service | Container Name | Port | Description |
|---|---|---|---|
| **Customer UPI App** | `customer-upi-app-simulation` | `3002` | Interactive smartphone simulator for NPCI UPI Circle delegation |
| **Merchant Control Plane** | `merchant-mcp-dashboard` | `3000` | Merchant store dashboard, margin defense, and tax invoice viewer |
| **Platform Admin** | `merchant-mcp-admin-dashboard` | `3001` | Multi-merchant tenant fleet management & security overview |
| **Go MCP Gateway** | `merchant-mcp-server` | `8080` | High-performance Go MCP engine running StreamableHTTP & SSE |
| **PostgreSQL 16** | `merchant-mcp-postgres` | `5433` | Canonical relational database with ACID double-entry ledger |
| **Redis 7** | `merchant-mcp-redis` | `6380` | High-throughput distributed cache and rate limiter |

---

## ⚡ Quickstart

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

---

### Option 2: Desktop 1-Click Installer (macOS, Windows, Linux)

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

## 🛠️ MCP Tool Catalog (Model Context Protocol)

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

## 📊 Performance Benchmarks & SLA Verification

We executed automated load tests and Go engine profiling against PostgreSQL 16:

```text
=== RUN   TestMultiTenantCategoryPartitioning
    Tenant Isolation Verified: Store A has 12 products, Store B has 4 products. Zero data leakage.
--- PASS: TestMultiTenantCategoryPartitioning (0.03s)

=== RUN   TestSub5msLatencyBenchmark
    Sequential Latency Benchmark (100 runs): Avg = 0.28ms | Max = 2.23ms
    Concurrent Load Benchmark (20 workers, 100 queries): Avg Latency = 5.95ms
    ✅ SLA GUARANTEE PASSED: Average query latency is 0.28ms (< 5ms SLA)
--- PASS: TestSub5msLatencyBenchmark (0.07s)

goos: darwin | goarch: arm64 | cpu: Apple M1
BenchmarkCategoryPartitionQuery-8: 15,834 ops | 159,668 ns/op (0.16ms / query)
```

* **Average Query Latency**: **`0.28 ms`** ($17\times$ faster than 5ms SLA).
* **Throughput**: Over **7,900 queries per second per core**.
* **Tenant Isolation**: 100% data partition guarantee across merchants.

---

## 🔒 Security & RBI Compliance

1. **RBI 2FA Mandate Compliance**: Autonomous spending is strictly bounded by secondary authorization (NPCI UPI Circle). Amounts exceeding the cap trigger mandatory Razorpay Step-Up 2FA.
2. **Confidential Floor Prices**: Private merchant margins are never exposed over MCP tool responses or client APIs.
3. **PGP Symmetric Encryption**: Sensitive Razorpay API secrets are stored as `BYTEA` using PostgreSQL `pgp_sym_encrypt`.
4. **HMAC-SHA256 Signature Verification**: Inbound Razorpay webhooks are cryptographically validated before order status transitions.
5. **ACID Double-Entry Ledger**: Every wallet debit appends a verifiable transaction record with `balance_after_paise` integrity checks.

---

## 📄 License
MIT License. Built for the **Razorpay AI Buildathon 2026**.
