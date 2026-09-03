# AgenticCheckout — Final Production Workflow & System Architecture
**Track 01: AI Growth & Agentic Commerce | Razorpay /buildathon 2026**

---

## 1. Executive Architecture Blueprint

AgenticCheckout is the **Unified Agentic Commerce Gateway powered by Razorpay**, bridging the gap between **autonomous buyer AI agents** (Claude, ChatGPT) and **real-world merchant economics**.

### The Core Problems Solved:
1. **The Merchant Dilemma (Margin Protection)**: Merchants cannot open raw APIs to autonomous buyer bots without risking rapid margin erosion (uncontrolled discounting) or inventory exhaustion. Our Go engine mathematically enforces private floor prices.
2. **The Customer Dilemma (Regulatory Compliance & Trust)**: In India, RBI strictly mandates Additional Factor of Authentication (2FA). An AI cannot hold raw credit cards or guess OTPs. Autonomous micro-spending requires a legally compliant delegation framework (**NPCI UPI Circle**).
3. **The Multi-Merchant Scale Dilemma (No 500 Connectors)**: A customer will *never* add separate MCP configurations for every merchant. Our platform acts as a **Single Unified Gateway**: customers connect **ONCE**, and get access to all registered merchants with category-partitioned search in < 5ms.
4. **The Broken Chat Payment Loop Dilemma (Instant Receipt Redirect)**: Instead of the customer paying in a browser tab and awkwardly asking the AI *"Did it go through?"*, our Razorpay integration uses **Automated Callback Redirects (`callback_url`)** that instantly drop the customer on an official confirmed tax invoice page upon payment.

---

## 2. The Three System Planes

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
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. High-Performance Multi-Merchant Search Architecture

### The Problem:
* Calling a tool per merchant would be $O(N)$ network latency (takes 30 seconds).
* Searching all stores naively without categories would return "socks" in an electronics store.

### The Solution:
1. **Single Tool Call**: The agent makes **ONE** tool call: `search_catalog(query: "earbuds", category: "Audio")`.
2. **Category Partitioning**: PostgreSQL uses an inverted B-Tree index on `(category, price_paise)` and `search_vector`.
3. **Execution**: Stores selling unrelated categories (e.g. Apparel) are eliminated in **0.1ms**. The database returns top matches across relevant merchants in under **5ms**.

---

## 4. End-to-End Userflows

### Phase A: Day 0 Setup (One-Time Configuration)

#### 1. Merchant Onboarding (`http://localhost:3000/onboard`)
* Merchant registers their store (*Soham Gadgets*).
* Plugs in **Razorpay Key ID & Key Secret** for direct bank settlements.
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

#### Flow 1: Micro-Purchase ($\le$ ₹2,000) — Zero-Click Fast Path
*(Example: Customer asks Claude to buy the Laptop Stand + Desk Mat bundle for ₹1,783)*

1. **Discovery & Bundle Recommendation**:
   * Agent calls `search_catalog("laptop stand")` $\rightarrow$ Server returns ₹899 stand.
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

#### Flow 2: High-Value Purchase (> ₹2,000) — Razorpay Step-Up 2FA & Auto-Redirect
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

## 5. Codebase Inventory: Clean & Production-Ready

### Active Repository Modules:

| Module | Path | Description |
|---|---|---|
| **MCP Commerce Gateway** | `server/` | Go backend exposing 14 MCP tools over StreamableHTTP & SSE. |
| **Customer UPI App Simulator** | `customer-upi-app/` | Dedicated smartphone UI on port `:3002` (UPI Circle delegation). |
| **Merchant Control Plane** | `dashboard/` | Next.js 14 Merchant Dashboard on port `:3000`. |
| **Platform Admin Center** | `admin-dashboard/` | Fleet monitoring & platform settings on port `:3001`. |
| **Desktop Control Center** | `desktop-manager/` | Wails v2 native app with cross-platform builds (macOS, Windows, Linux). |
| **Database Schema** | `server/db/migrations/`, `server/db/schema.sql` | Consolidated canonical idempotent PostgreSQL schema. |
| **Containerization** | `docker-compose.yml` | Production 6-container topology with health checks. |

---

## 6. Video Demonstration Strategy (2-Minute Winning Pitch)

In the demo video, use a **Split Screen / Multi-Tab View**:
* **Window 1**: 📱 **Customer UPI App Simulator** (`http://localhost:3002`)
* **Window 2**: 🏪 **Merchant Control Plane** (`http://localhost:3000`)
* **Window 3**: 🧾 **GST Tax Invoice & Courier Tracking** (`http://localhost:3000/order/success`)
* **Terminal**: 🤖 **Claude AI Assistant & Sub-0.3ms Latency Benchmarks**

1. **Minute 1: The Core Thesis & Customer Setup**
   * Show the Customer Phone setting up a ₹2,000 UPI Circle auto-cap for Claude.
2. **Minute 2: The Merchant Setup & Margin Shield**
   * Show the Merchant Dashboard, the ₹750 secret floor price, and active bundle campaigns.
3. **Minute 3: Micro-Purchase Fast Path ($\le$ ₹2k)**
   * Claude buys the ₹1,783 Power Duo bundle. Watch the phone deduct instantly with zero human clicks, and watch the merchant dashboard log the sale.
4. **Minute 4: High-Value Purchase (> ₹2k) & Razorpay 2FA**
   * Claude buys the ₹12,999 Projector. System halts auto-debit $\rightarrow$ generates live Razorpay link $\rightarrow$ user enters UPI PIN $\rightarrow$ Razorpay auto-redirects to the confirmed invoice.
5. **Minute 5: Architectural Summary & Razorpay Alignment**
   * Explain multi-merchant scalability, NPCI compliance, and why this is the blueprint for real-world Agentic Commerce in India.
