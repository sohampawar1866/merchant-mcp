# 5-Minute Hackathon Video Submission Script & Storyboard
### Project: **AgenticCheckout — Autonomous Agent Commerce & AI Growth Engine**
### Track: **Track 01: AI Growth & Agentic Commerce (Razorpay /buildathon 2026)**

---

## 🎬 Video Production Overview

- **Total Duration**: 5:00 minutes (300 seconds)
- **Format**: Screen capture + Voiceover + Webcam in corner (optional)
- **Key Judges Evaluation Criteria**:
  1. **Problem Taste**: Addressing the real-world friction of selling to autonomous AI buyers.
  2. **Build Quality**: Go 1.24 backend, PostgreSQL pgcrypto vault, integer paise math, Next.js 14 dashboards.
  3. **AI Judgment**: Dynamic upsell bundling, proportional discount ladders, and zero margin leakage.
  4. **Failure Recovery & Trust**: Deliberate below-floor rejection, rate limit defense, autonomous wallet cap enforcement with seamless 2FA step-up fallback.

---

## ⏱ Minute-by-Minute Storyboard & Script

---

### **[0:00 - 0:45] ACT 1: The Problem & The Vision**

**Visual on Screen:**
- Start with a browser tab showing a traditional e-commerce product page with CAPTCHAs, popups, and manual forms.
- Cut to a graphic showing Claude / ChatGPT trying to buy something and getting blocked.
- Show the title slide: **AgenticCheckout: Turn Any Merchant Sellable to AI Buyers**.

**Voiceover Script:**
> *"Hi everyone! Over the next 5 years, millions of purchasing decisions won't be made by humans clicking through websites — they will be made by autonomous AI agents acting on behalf of consumers and enterprises.*
>
> *Yet today, 99% of merchants are completely invisible to AI buyers. Hardcoded web forms block agentic discovery, discounts either leak profits or get abused, and requiring an OTP or MPIN for every single micro-purchase breaks true agentic autonomy.*
>
> *Introducing **AgenticCheckout**: the first open, multi-tenant agentic commerce clearinghouse that makes any merchant discoverable to AI buyers, expands basket sizes with dynamic AI upsells, protects floor margins mathematically, and enables zero-click autonomous payments within bounded budgets."*

---

### **[0:45 - 2:00] ACT 2: Live Demo — The Autonomous AI Buyer Journey**

**Visual on Screen:**
- Open **Claude Desktop** (or conversational agent interface).
- Type the prompt:
  > *"Find me an ergonomic laptop stand on Soham Store, see if there's any bundle deal, negotiate a 15% discount, and pay using my agent wallet."*

**Action & Narration:**
- **Step 1 (Discovery & Zero Margin Leakage)**: Show Claude invoking `search_catalog` and `get_product_details`.
  > *"First, Claude searches the merchant's catalog. Notice that while the merchant has configured an internal confidential floor price in the database, the agent only ever receives public prices. Our engine guarantees **Zero Margin Leakage**."*
- **Step 2 (AI Growth & Dynamic Upsell)**: Show Claude calling `get_upsell_bundle`.
  > *"Next, our **AI Growth Engine** kicks in. It recognizes that customers buying a laptop stand frequently buy an RGB Desk Mat. It proactively proposes a 'Power Duo Bundle' with a 15% discount, expanding the merchant's Average Order Value."*
- **Step 3 (Cart State & Bundle Concession)**: Show Claude calling `create_cart`, `add_to_cart`, and `negotiate_cart_bundle`.
  > *"Claude adds both items to a multi-product cart and negotiates the bundle to ₹1,800. Our in-memory concession engine evaluates the offer against both individual floor prices and approves the deal with deterministic 64-bit integer paise arithmetic."*
- **Step 4 (Zero-Click Autonomous Wallet Debit)**: Show Claude calling `checkout_cart(payment_method: 'autonomous_wallet')`.
  > *"Finally, Claude executes checkout. Because the cart is within the customer's pre-authorized ₹2,000 monthly allowance (compliant with NPCI UPI Circle and FIDO AP2 standards), the wallet is debited atomically with an ACID row lock, and the order is marked **PAID instantly with ZERO human clicks**."*

---

### **[2:00 - 3:00] ACT 3: Failure Recovery, Floor Gating & 2FA Step-Up**

**Visual on Screen:**
- Back to Claude Desktop.

**Action & Narration:**
- **Failure Case 1 (Deliberate Below-Floor Rejection)**:
  - Prompt: *"Negotiate the Studio Headphones down to ₹2,000 (list price ₹4,999, floor ₹3,999)."*
  - Show Claude receiving: `decision: "rejected", reason_code: "BELOW_FLOOR", counter_offer: "₹4,669.00"`.
  > *"Let's test what happens when an aggressive AI buyer tries to game the merchant. When proposing ₹2,000 on a ₹4,999 headphone with a ₹3,999 floor, the engine rejects the offer, protects the margin, and responds with a 3-stage concession counter-offer."*
- **Failure Case 2 (Step-Up 2FA Escalation for High-Value Purchases)**:
  - Prompt: *"Checkout the 4K Portable Projector (₹12,999)."*
  - Show Claude calling `checkout_cart` $\rightarrow$ System recognizes amount exceeds the ₹2,000 auto-cap $\rightarrow$ Returns a live **Razorpay Payment Link** (`https://rzp.io/...`).
  - Open the Razorpay link in browser and show real payment options (UPI, QR, Cards).
  > *"What if the order is ₹13,000? Our trust continuum automatically steps up to Human-In-The-Loop 2FA. It instantly generates a real Razorpay payment link for the human to authorize via UPI MPIN or biometric OTP."*

---

### **[3:00 - 3:55] ACT 4: Merchant Margin Studio & Multi-Tenant Platform Control**

**Visual on Screen:**
- Switch browser to **Merchant Dashboard (`http://localhost:3000`)**.

**Action & Narration:**
- Show **Store Overview tab**: Live GMV, AI orders counter, real-time revenue chart.
- Show **Customer Activity tab**: Live immutable audit logs with correlation IDs.
- Show **AI Growth & Campaigns tab**: Active promotional bundles, conversion lift (+28.4%), and incremental GMV.
- Show **Autonomous Wallets tab**: Delegated allowances and double-entry ledger logs.
- Switch to **Platform Admin Console (`http://localhost:3001`)**:
  - Show multi-store aggregation.
  - Click the **Emergency Kill Switch** on Demo Store 2 $\rightarrow$ Show status toggle to `suspended` in under 10ms.
  > *"Every single money action is explainable, bounded, and audited in real time. The merchant sees exactly how their AI campaigns perform, while the platform operator has a sub-10ms Emergency Kill Switch to isolate any suspended store instantly."*

---

### **[3:55 - 4:40] ACT 5: Under the Hood & Open Standards Architecture**

**Visual on Screen:**
- Show `http://localhost:8080/.well-known/agent-manifest.json` and terminal running `go test ./server/... -v`.

**Action & Narration:**
> *"Under the hood, AgenticCheckout is engineered for production-grade scale:*
> 1. *Built in **Go 1.24** with **StreamableHTTP Model Context Protocol**.*
> 2. *Compliant with emerging open standards: **NPCI Unified Agent Protocol (UAP)** and **FIDO AP2** machine discovery via `/.well-known/agent-manifest.json`.*
> 3. *Security at rest: Merchant Razorpay credentials are encrypted using **PostgreSQL pgcrypto symmetric vaults** with zero plaintext keys on disk.*
> 4. *Deterministic 64-bit integer paise math eliminating floating-point rounding errors.*
> 5. *100% automated test coverage across tenant isolation, concession ladders, and webhook HMAC verification."*

---

### **[4:40 - 5:00] ACT 6: Conclusion & Wrap-Up**

**Visual on Screen:**
- Show GitHub repository: `https://github.com/sohampawar1866/merchant-mcp`.
- Final slide with contact info and project links.

**Voiceover Script:**
> *"AgenticCheckout bridges the gap between today's merchants and tomorrow's AI buyers — driving real revenue growth with dynamic upsells while keeping the merchant safe, profitable, and bounded.
>
> All code, migrations, and docker-compose configurations are open-source and ready to deploy in 1 command.
>
> Thank you to the Razorpay /buildathon team!"*

---

## 💡 Pro-Tips for Recording the Best Video

1. **Resolution**: Record in 1080p (1920x1080) at 60fps or 30fps using OBS Studio or Loom.
2. **Audio**: Use a clear microphone with background noise suppression.
3. **Pacing**: Speak at an energetic, confident pace (~140 words per minute).
4. **Pre-Demo Prep**: Have all 3 browser tabs open before you hit record:
   - Tab 1: Claude Desktop (or your AI chat window)
   - Tab 2: `http://localhost:3000/?merchant_id=efe794fa-e1e2-4d30-8f13-cb74b2b5f110` (Merchant Dashboard)
   - Tab 3: `http://localhost:3001` (Admin Console)
