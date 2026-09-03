# AgenticCheckout - Phased Implementation Plan
**Execution Roadmap for Track 01 (AI Growth & Agentic Commerce) | Razorpay /buildathon 2026**

---

## Overview
This document breaks down the remaining technical implementation into **5 structured, verifiable phases**. Each phase is completely self-contained, testable, and builds directly toward an airtight, award-winning hackathon demonstration.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 1    │ ──► │   PHASE 2    │ ──► │   PHASE 3    │ ──► │   PHASE 4    │ ──► │   PHASE 5    │
│ Customer UPI │     │ Razorpay 2FA │     │ Rich Invoice │     │ Multi-Store  │     │ End-to-End   │
│ Circle App   │     │ Auto-Redirect│     │ MCP Receipts │     │ Search Bench │     │ Demo & Video │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Phase 1: Customer UPI Circle App Simulator (`/upi-circle`)

### **Goal**:
Eliminate all judge confusion regarding the Customer side of the delegated wallet by providing a standalone, interactive **Customer Phone UI** styled like Google Pay / BHIM UPI Circle.

### **Tasks**:
1. **Frontend UI (`dashboard/src/app/upi-circle/page.tsx`)**:
   * Build a sleek mobile smartphone mockup frame with official **NPCI UPI Circle** styling.
   * Display User Profile: **Soham Pawar (State Bank of India • Account ****4092)**.
   * Display Delegated Bot: **Claude Shopping Assistant (`claude-buyer-01`)** with active status indicator.
   * **Interactive Auto-Debit Cap Slider**: Range ₹500 to ₹5,000 (default ₹2,000). Moving the slider instantly updates the database limit.
   * **Live Balance Display**: Displays live `balance_paise` (₹1,817.54) and monthly budget progress against ₹15,000.
   * **Live Transaction Feed**: Real-time ledger stream showing debits from `agent_wallet_ledger`.
2. **Interactive Test Actions**:
   * **Button A: "Simulate Fast-Path Purchase (₹899 Stand)"**:
     * Directly triggers atomic balance deduction.
     * Screen flashes green: *"⚡ Auto-Approved via UPI Circle without MPIN!"*
     * In real time, the Merchant Dashboard (`:3000`) logs the sale!
   * **Button B: "Simulate High-Value Purchase (₹12,999 Projector)"**:
     * Evaluates against the ₹2,000 cap.
     * Screen flashes amber: *"🛡️ Exceeds ₹2,000 Auto-Cap! Escalated to Razorpay 2FA"*.
3. **Backend API Route (`dashboard/src/app/api/upi-circle/route.ts`)**:
   * `GET`: Fetches current wallet balance, caps, and recent ledger debits from PostgreSQL.
   * `POST`: Updates per-transaction auto-cap slider or triggers simulated transactions.
4. **Navigation Integration**:
   * Add a prominent button in the Merchant Dashboard header: **"📱 Open Customer UPI App"** to switch tabs easily during demos.

### **Verification Criteria**:
- [ ] Visiting `http://localhost:3000/upi-circle` renders a responsive, realistic phone interface.
- [ ] Dragging the cap slider updates `agent_wallets.per_transaction_cap_paise` in PostgreSQL.
- [ ] Clicking "Test ₹899 Stand" deducts balance atomically and appends a row to `agent_wallet_ledger`.
- [ ] Clicking "Test ₹12,999 Projector" blocks auto-debit and displays the Razorpay 2FA alert.

---

## Phase 2: Razorpay Step-Up 2FA Auto-Redirect (`/order/success`)

### **Goal**:
Completely eliminate the broken chat payment loop where a customer pays a Razorpay link and has to manually type *"Did it go through?"* in Claude. Razorpay automatically redirects the browser straight to a confirmed GST tax invoice upon payment.

### **Tasks**:
1. **Update Razorpay Link Generation (`server/razorpay/client.go` & `server/server.go`)**:
   * Include `callback_url: "http://localhost:3000/order/success?order_id={id}"` and `callback_method: "get"` in all `POST /v1/payment_links` payloads.
2. **Build Success & Receipt Page (`dashboard/src/app/order/success/page.tsx`)**:
   * Extracts `order_id` and Razorpay parameters (`razorpay_payment_id`, `razorpay_payment_link_id`) from query params.
   * Queries PostgreSQL `orders` and `order_items` for full transaction details.
   * **Visual Elements**:
     * Confetti animation 🎉 and verified green shield.
     * **Official GST Tax Invoice**:
       * Invoice #, Order ID, and Razorpay Reference ID.
       * Itemized line items with unit price, discount concessions, and 18% GST breakdown.
       * Delivery estimate (2-3 business days) and simulated courier tracking number (`TRK-IN-98214`).
     * Action Buttons: *"Print / Save PDF"* and *"Return to AI Chat"*.

### **Verification Criteria**:
- [ ] Generated payment link contains valid `callback_url`.
- [ ] Navigating to `/order/success?order_id=...` renders a verified tax invoice with accurate paise-to-rupee calculations.
- [ ] Background Razorpay webhook confirms payment without requiring manual input in chat.

---

## Phase 3: Rich Formatted Receipts in Go MCP Tool (`check_order_status`)

### **Goal**:
Ensure that if a customer *does* ask Claude *"What is my order status?"*, Claude doesn't spit out raw unformatted JSON, but instead prints a formatted, professional markdown receipt.

### **Tasks**:
1. **Update `check_order_status` in `server/server.go`**:
   * If `status == 'paid'`:
     * Format output with ASCII invoice layout, line items, total with GST, and tracking info.
   * If `status == 'awaiting_payment'`:
     * Return friendly prompt with payment link and expiry timer.
2. **Add Unit Tests**:
   * Test `check_order_status` under both `paid` and `pending` states in `server/server_test.go`.

### **Verification Criteria**:
- [ ] Calling `check_order_status` via MCP tool inspector returns a human-readable, itemized markdown tax invoice.

---

## Phase 4: Multi-Store Category Partitioning & Latency Verification

### **Goal**:
Prove that the Unified Gateway handles multi-merchant catalog queries in $< 5$ms without cross-category pollution (e.g. searching for socks never scans electronics stores).

### **Tasks**:
1. **Verify PostgreSQL Indexes**:
   * Confirm `idx_products_category` and `idx_products_merchant_id` exist.
2. **Benchmark Query Performance**:
   * Run an EXPLAIN ANALYZE query on `search_catalog` to confirm index scan latency is $< 3$ms.
3. **Verify Floor Margin Shield**:
   * Ensure `negotiate_cart_bundle` and `negotiate_price` strictly reject any offer below floor price across all merchants.

### **Verification Criteria**:
- [ ] `go test ./server/... -v` passes 100%.
- [ ] Multi-merchant query execution verified under 5ms.

---

## Phase 5: Submission Video Recording & Repository Packaging

### **Goal**:
Record the definitive 5-minute video presentation following the dual-screen script, and finalize the repository for submission.

### **Tasks**:
1. **Side-by-Side Screen Setup**:
   * Left: 📱 **Customer UPI App Simulator** (`http://localhost:3000/upi-circle`).
   * Center: 🤖 **Claude AI Desktop** (talking to MCP Server on `:8080`).
   * Right: 🏪 **Merchant Control Plane** (`http://localhost:3000`).
2. **Record the 5-Minute Script**:
   * Minute 1: Problem statement & Customer UPI Circle setup.
   * Minute 2: Merchant Control Plane, secret floor margins & AI campaigns.
   * Minute 3: Autonomous ₹1,783 bundle purchase (Fast Path - Zero Clicks).
   * Minute 4: Flagship ₹12,999 Projector purchase (Razorpay Step-Up 2FA & instant auto-redirect).
   * Minute 5: Razorpay value proposition & architectural recap.
3. **Documentation Finalization**:
   * Re-populate `README.md` with final screenshots and architecture diagrams.
   * Publish GitHub Release `v1.0.0` with the updated `.dmg` installer.

---

## Phase Progression Status

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Customer UPI Circle App Simulator (`/upi-circle`) | ⏳ READY TO START |
| **Phase 2** | Razorpay 2FA Auto-Redirect & Invoice Page (`/order/success`) | ⏸️ Queued |
| **Phase 3** | Rich Formatted Receipts in Go MCP Tool (`check_order_status`) | ⏸️ Queued |
| **Phase 4** | Multi-Store Category Partitioning & Latency Benchmarks | ⏸️ Queued |
| **Phase 5** | Video Recording, README Finalization & Submission | ⏸️ Queued |
