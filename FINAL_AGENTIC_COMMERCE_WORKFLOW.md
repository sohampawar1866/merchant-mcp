# AgenticCheckout — Final Production Workflow & System Architecture
**Track 01: AI Growth & Agentic Commerce | Razorpay /buildathon 2026**

---

## 1. Executive Architecture Blueprint

AgenticCheckout bridges the gap between **autonomous buyer AI agents** (Claude, ChatGPT, Perplexity) and **real-world merchant economics**.

### The Core Problem Solved:
1. **The Merchant's Dilemma**: Merchants cannot open raw APIs to autonomous AI buyer bots without risking rapid margin erosion (lowball pricing), inventory exhaustion, or unauthorized discounts.
2. **The Customer's Dilemma**: In India, RBI strictly mandates Additional Factor of Authentication (2FA). An AI cannot hold raw credit cards or guess OTPs. Autonomous commerce requires a legally compliant, bounded delegation protocol (**NPCI UPI Circle & AP2**).
3. **The Gateway's Opportunity (Razorpay)**: Razorpay serves as the unified trust, authentication, and settlement bridge. High-value transactions flow via live **Razorpay Payment Links (Step-Up 2FA)**, while pre-authorized micro-transactions clear through a **delegated UPI Circle mandate**.

---

## 2. The Three System Planes

The architecture is strictly divided into three decoupled components:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        1. CUSTOMER APPS & AGENT RUNTIMES                               │
│                                                                                        │
│  [ Customer UPI Circle App Simulator ]           [ Autonomous Buyer AI Agent ]         │
│  • Account: Soham Pawar (SBI)                    • Claude / ChatGPT (with MCP / SSE)   │
│  • Delegated Agent: claude-buyer-01              • Searches, builds carts, negotiates  │
│  • Monthly Limit: ₹15,000                        • Decides whether to auto-clear or    │
│  • Zero-Click Cap Slider: [ ₹2,000 ]               request human approval              │
└───────────────────────────┬───────────────────────────────────┬────────────────────────┘
                            │                                   │
                Delegates spending bounds           Executes MCP Tool Calls
                            │                                   │
                            ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        2. AGENTIC COMMERCE BACKEND GATEWAY                             │
│                                                                                        │
│  [ Open Discovery (Vercel) ]                      [ Go MCP Engine & DB (:8080) ]       │
│  • /llms.txt (Catalog & Policies)                • 14 Interactive Commerce Tools       │
│  • /.well-known/mcp.json                         • Dynamic Floor Margin Shield Engine  │
│  • /.well-known/agent-manifest.json              • Integer Paise Cart GST Arithmetic   │
│                                                  • PostgreSQL ACID Double-Entry Ledger │
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
│  • Plain-English Live Activity Stream            • Instant payment.captured Webhooks   │
│  • Dynamic AI Growth Campaign Studio             • T+1 Verified Bank Settlement        │
│  • Live Catalog & AI Auto-Tagger                 • 2% Standard Gateway Interchange     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End Userflows: Setup vs Daily Usage

### Phase A: Day 0 Setup (One-Time Onboarding)

#### 1. Merchant Setup (`http://localhost:3000/onboard`)
* **Step 1.1**: Merchant creates their store profile (*Soham Gadgets*).
* **Step 1.2**: Merchant enters their live/test **Razorpay Key ID & Key Secret**.
* **Step 1.3**: Merchant defines their catalog with **Public MRP** and **Private Secret Floor Prices** (e.g. Laptop Stand = ₹899 MRP, ₹750 Floor).
* **Step 1.4**: Merchant activates the **AI Growth Campaign Studio** (e.g. *Power Duo*: 15% off when Laptop Stand + Desk Mat are bundled).
* **Step 1.5**: System exposes open discovery standards at `https://soham-gadgets.vercel.app/llms.txt` and `/.well-known/mcp.json`.

#### 2. Customer Mandate Setup (`http://localhost:3000/upi-circle`)
* **Step 2.1**: Customer opens their personal UPI banking interface (Simulated UPI Circle / Google Pay app).
* **Step 2.2**: Customer selects **"Delegate Secondary Agent"** and assigns `claude-buyer-01`.
* **Step 2.3**: Customer sets limits:
  * **Monthly Allowance**: ₹15,000.00.
  * **Zero-Click Auto-Debit Cap without MPIN**: ₹2,000.00.
  * **Approved Categories**: *Desk Gadgets, Audio & Acoustics, Smart Home, Wearables*.
* **Step 2.4**: Customer authorizes the mandate **once** with their biometric / UPI MPIN.

---

### Phase B: Day 1..N Daily Usage (Autonomous Shopping)

#### Flow 1: Micro-Purchase ($\le$ ₹2,000) — Zero-Click Fast Path
*(Example: Customer asks Claude to buy the Laptop Stand + Desk Mat bundle for ₹1,783)*

1. **Discovery & Bundle Recommendation**:
   * Agent calls `search_catalog("laptop stand")` $\rightarrow$ Server returns ₹899 stand.
   * Agent calls `get_upsell_bundle` $\rightarrow$ Server dynamically proposes the *Power Duo Bundle* (Stand + RGB Desk Mat with 15% discount).
2. **Session Cart & Margin Negotiation**:
   * Agent calls `create_cart` and `add_to_cart`. Subtotal: ₹2,098.
   * Agent calls `negotiate_cart_bundle(offered_price: 178000)`.
   * Go engine verifies: Combined floor is ₹1,650. Offered ₹1,780 is safely above floor!
   * Concession is calculated in integer paise: Final total = ₹1,783 (15% savings).
3. **Zero-Click Settlement**:
   * Agent calls `checkout_cart(payment_method: "autonomous_wallet")`.
   * Gateway checks: Total ₹1,783 is $\le$ ₹2,000 auto-cap.
   * PostgreSQL executes atomic `SELECT balance_paise FROM agent_wallets FOR UPDATE`.
   * Balance deducts from ₹3,939.18 $\rightarrow$ ₹2,156.18.
   * Order is logged as `status = 'paid'`, and receipt is generated.
4. **Real-Time Visibility**:
   * Customer's UPI App shows: *"-₹1,783 debited for Soham Gadgets Power Duo"*.
   * Merchant Dashboard shows: *"New Order #ord_xxx Paid • 0% Margin Loss"*.

---

#### Flow 2: High-Value Purchase (> ₹2,000) — Razorpay Step-Up 2FA
*(Example: Customer asks Claude to buy the AeroBeam 4K Projector for ₹12,999)*

1. **Cart & Cap Evaluation**:
   * Agent calls `checkout_cart(product_id: Projector, price: ₹12,999)`.
   * Gateway detects: ₹12,999 exceeds the ₹2,000 auto-debit cap!
2. **Automatic Escalation to Razorpay**:
   * Gateway halts autonomous wallet deduction.
   * Gateway calls live Razorpay API (`POST /v1/payment_links`) for ₹12,999.
   * Razorpay generates live short URL: `https://rzp.io/i/xxxxxx`.
   * Gateway returns response: `{ status: "awaiting_2fa", payment_url: "https://rzp.io/i/xxxxxx" }`.
3. **Human Authorization**:
   * Agent presents the official Razorpay link to the customer:
     > *"This flagship projector exceeds your ₹2,000 autonomous spending limit. Please authorize: [Pay ₹12,999 via Razorpay](https://rzp.io/i/xxxxxx)"*
   * Customer clicks link, enters UPI PIN or OTP in the secure Razorpay checkout modal.
4. **Webhook Settlement**:
   * Razorpay fires webhook (`payment.captured`) to `/api/webhook/razorpay`.
   * Gateway updates order to `status = 'paid'` and triggers fulfillment.

---

## 4. Codebase Audit: What We Keep vs What We Delete

To keep the repository production-grade, modular, and easy for any developer to fork, here is the clean separation of code:

### ✅ Core Files to KEEP (The True Engine):

| Component | Path | Responsibility |
|---|---|---|
| **Core MCP Gateway** | `server/` | Pure Go backend exposing the 14 MCP tools over SSE / HTTP. |
| **Catalog & Margins** | `server/catalog/`, `server/negotiator/` | Product search, stock counts, and floor price defense. |
| **Session Cart & Bundles** | `server/cart/` | Multi-product carts, GST calculation, bundle negotiation. |
| **Autonomous Wallet Ledger** | `server/wallet/` | Double-entry ledger, ACID locks, ₹2,000 auto-cap checks. |
| **Razorpay Integration** | `server/razorpay/` | Live Razorpay client (Payment links, orders, webhooks). |
| **Merchant Control Plane** | `dashboard/` | Next.js 14 merchant dashboard on port `:3000`. |
| **Customer UPI App** | `dashboard/src/app/upi-circle/` | **NEW**: Dedicated Customer Phone Simulator UI. |
| **Open Discovery Site** | `store-site/` | Next.js storefront deployed on Vercel (`soham-gadgets.vercel.app`) with `/llms.txt` and `/.well-known/mcp.json`. |
| **Database Migrations** | `server/db/migrations/` | Migrations `00001` through `00007`. |
| **Infrastructure** | `docker-compose.yml`, `Dockerfile` | Multi-container setup (Postgres, MCP server, Dashboard, Store-site). |

---

### ❌ Redundant / Junk Files to DELETE:

| File / Folder | Reason for Deletion |
|---|---|
| `cat.jpg` | Loose test artifact in root directory from stock photo tests. |
| `laptop_stand.jpg` | Loose test image in root directory (already properly inside `store-site/public/products/`). |
| `server/bin/` | Compiled local Go binaries (should not be checked into Git). |
| Temporary scratch scripts | One-off debug scripts in `.gemini` scratch directories. |

---

## 5. Verification & Demonstration Checklist

- [x] 14 MCP Tools pass all unit tests (`go test ./server/... -v`).
- [x] Secret floor margins strictly enforced (0 sales below floor price).
- [x] Proportional bundle concessions correctly split across line items.
- [x] PostgreSQL double-entry wallet ledger maintains ACID integrity.
- [x] Razorpay payment links generated for orders exceeding ₹2,000.
- [x] Real-time Razorpay webhooks capture and settle payments.
- [x] Vercel storefront exposes compliant `llms.txt` and `.well-known/mcp.json`.
- [ ] Dedicated Customer UPI Circle Simulator UI built and linked.
- [ ] Repository cleaned of loose files and tagged for submission.
