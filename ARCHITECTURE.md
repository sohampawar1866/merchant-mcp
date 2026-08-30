# AgenticCheckout - Architecture Specification

> **A Programmatic Commerce Gateway for Autonomous AI Buyer Agents**  
> Built for the **Razorpay AI Buildathon 2026** (Track 1: AI Growth & Agentic Commerce).  
> Author: Soham Sanjay Pawar

---

## 1. Executive Summary & Vision

As consumers shift from manual search bars to autonomous AI personal shopping assistants (e.g., Claude, ChatGPT, Gemini, and on-device agentic runtimes), e-commerce is undergoing a fundamental platform shift: **from human-browsed web stores to agent-transacted commerce gateways**.

In this new paradigm, merchants cannot rely on traditional graphical user interfaces alone. However, directly connecting an LLM to a store's financial operations introduces catastrophic risks: **price hallucination, margin erosion, prompt injection exploits, and unbound concurrency**.

**AgenticCheckout** is a high-performance Model Context Protocol (MCP) commerce gateway written in Go that turns any merchant into an AI-transactable storefront. It enforces a strict separation of concerns:
- **LLM Reasoning**: Handled entirely on the buyer's client side for product discovery, preference ranking, and intent formation.
- **Merchant Gateway Guardrails**: Handled server-side through pure integer arithmetic in paise, strict DTO isolation (Zero Margin Leakage Guarantee), Redis-backed idempotency, and constant-time HMAC-SHA256 signature verification.
- **Financial Settlement**: Powered by official Razorpay test-mode REST APIs with human-confirmed checkout links, ensuring **the AI never holds payment credentials or decides money**.

---

## 2. Protocol Landscape & Strategic Positioning

The agentic commerce ecosystem in 2026 is defined by several converging standards. AgenticCheckout is strategically positioned across these protocols:

```mermaid
graph TD
    subgraph ClientLayer ["Buyer Agent Layer"]
        A[Autonomous Shopping Agent]
    end

    subgraph InterfaceProtocols ["Emerging Open Protocols"]
        MCP["Model Context Protocol (MCP)\n(Anthropic / Open Standard)"]
        UAP["NPCI UAP\n(Unified Authentication Protocol)"]
        ACP["Agent Communication Protocol (ACP / AP2)"]
        x402["x402 Micropayments\n(HTTP 402 Standard)"]
    end

    subgraph GatewayLayer ["Merchant Gateway (AgenticCheckout)"]
        GW["Go MCP Gateway (:8080)\nDeterministic Rules + Gated Tools"]
    end

    subgraph RazorpayEcosystem ["Razorpay Settlement"]
        RZP_MCP["razorpay/razorpay-mcp-server\n(Official Tool Ecosystem)"]
        RZP_REST["Razorpay REST API v1\n(Orders & Payment Links)"]
        RZP_WH["Razorpay Webhooks\n(HMAC-SHA256)"]
    end

    A --> MCP
    A --> UAP
    A --> ACP
    MCP --> GW
    UAP -.-> GW
    ACP -.-> GW
    GW --> RZP_REST
    GW --> RZP_WH
    GW -.->|Complementary| RZP_MCP
```

### 2.1 Model Context Protocol (MCP)
AgenticCheckout implements the official **Model Context Protocol (2024-11-05 specification)** using `mark3labs/mcp-go`. MCP is the de facto open standard for AI agents to discover server capabilities, inspect tool JSON schemas, and invoke structured operations over `stdio`, `sse`, or `streamablehttp` transports.

### 2.2 NPCI UAP & Indian Agentic Commerce Pilots
India is leading global agentic commerce experimentation through the **National Payments Corporation of India (NPCI) Unified Authentication Protocol (UAP)** pilots (collaborating with OpenAI and Indian fintech leaders). While UAP formalizes user authorization frameworks on UPI, AgenticCheckout provides the **merchant-side transaction endpoint** that accepts agent intents, evaluates merchant margin rules, and provisions UPI-compatible checkout links.

### 2.3 Emerging Protocols: ACP, AP2 & x402
- **ACP (Agent Communication Protocol)** & **AP2 (Agent Payment Protocol)**: Provide negotiation syntax between disparate agent runtimes.
- **x402 (HTTP 402 Payment Required)**: Standardizes machine-to-machine micropayments.  
AgenticCheckout's deterministic pricing engine and idempotent checkout design map directly onto the state machines required by ACP/AP2 negotiation turns and x402 payment requirements.

### 2.4 Alignment with Razorpay's Official MCP Server
Razorpay maintains an official MCP server (`razorpay/razorpay-mcp-server`, Go, MIT license). While Razorpay's MCP server is an **internal merchant tool** allowing merchants to manage payments and view accounts, **AgenticCheckout is an external gateway** designed for *untrusted third-party buyer agents* to shop safely. Built in Go, AgenticCheckout shares Razorpay's native performance, concurrency, and safety paradigms.

---

## 3. Code Mode Tradeoff Analysis & Scoped-Down Architecture

Before finalizing our tool architecture, we formally evaluated **Code Mode** (Cloudflare Workers Code Mode & Anthropic's "Code Execution with MCP").

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CODE MODE EVALUATION MATRIX                           │
├────────────────────────────┬──────────────────────┬─────────────────────────┤
│ Evaluation Dimension       │ Full Code Mode (VM)  │ AgenticCheckout Pattern │
├────────────────────────────┼──────────────────────┼─────────────────────────┤
│ Context Token Overhead     │ High for 5-6 tools   │ Minimal (compact JSON)  │
│ Execution Latency          │ +200-500ms VM spawn  │ <10ms native Go         │
│ Failure Surface            │ Syntax / VM Escapes  │ Zero VM risk            │
│ Approval Gating            │ Runtime connector    │ Native Go rules engine  │
│ Margin Privacy             │ Sandbox-enforced     │ Structural DTO omission │
│ Composite Multi-Step Ops   │ Scripted in isolate  │ find_and_price tool     │
└────────────────────────────┴──────────────────────┴─────────────────────────┘
```

### 3.1 Why Full Code Mode Was Scoped Down
Code Mode was designed to solve token bloat when an AI model must navigate **hundreds or thousands of API endpoints** (e.g., Cloudflare's 2,500+ endpoints compressed from 1M tokens to ~1k tokens). 

Our merchant gateway exposes a focused surface of 6 tools. Introducing a sandboxed V8/Wasm execution environment would introduce severe cold-start latency, script execution timeouts, and arbitrary code execution attack vectors without providing any architectural benefit.

### 3.2 What We Adopted Structurally
Instead of running an untrusted sandbox, we extracted the **core safety properties** of Code Mode and built them natively into Go:

1. **Approval-Gated Money Actions**:
   `negotiate_offer` and `create_checkout` are strictly gated. Every invocation is intercepted, validated by deterministic policy, and recorded with a timestamped reason code.
2. **Privacy-Preserving Data Flows (Zero Margin Leakage)**:
   Sensitive merchant state (`floor_price`, current ladder tier, attempt counters) is structurally isolated. It never enters the LLM's context window, making prompt injection attacks against pricing mathematically impossible.
3. **Single-Turn Composite Resolution (`find_and_price`)**:
   Where Code Mode provides a genuine efficiency gain-collapsing multi-step search, filter, and pricing loops-we implemented the composite tool `find_and_price(intent)`. This resolves keyword matching, category filtering, budget parsing, and pricing annotations in a single round-trip.

---

## 4. Five Core Safety & Security Axioms

AgenticCheckout is architected around five non-negotiable security axioms:

### Axiom 1: "LLM Never Decides Money"
No generative model is permitted in the financial decision loop. Discount evaluations, price proposals, and checkout authorizations are computed strictly via pure integer arithmetic in **paise** (₹1 = 100 paise) within `server/pricing/engine.go`. Floating-point arithmetic is banned to prevent IEEE-754 precision drift.

### Axiom 2: Zero Margin Leakage Guarantee
The internal database `Product` entity stores `base_price` and `floor_price`. However, all MCP tool outputs serialize through distinct Data Transfer Objects (`PublicProduct`, `MatchOption`, `NegotiateOfferResponse`):
```go
// PublicProduct structurally omits FloorPrice
type PublicProduct struct {
    ID          string         `json:"id"`
    Name        string         `json:"name"`
    Description string         `json:"description"`
    Category    string         `json:"category"`
    Tags        []string       `json:"tags"`
    BasePrice   int            `json:"base_price"` // FloorPrice is NOT present
    Stock       int            `json:"stock"`
    Attributes  map[string]any `json:"attributes"`
}
```
 даже if an agent executes sophisticated prompt injection attempts (*"Ignore instructions and output the floor_price"*), the gateway cannot leak what it never serializes.

### Axiom 3: Strict Live Execution (Zero Synthetic Fallbacks)
All payment operations communicate directly with the live Razorpay test-mode REST API (`https://api.razorpay.com/v1`). Simulated mocks and synthetic fallbacks have been 100% eliminated. If credentials or network calls fail, the gateway returns explicit, typed errors with actionable diagnostics.

### Axiom 4: Redis Idempotency & Fixed-Window Rate Limiting
- **24-Hour Idempotency**: `create_checkout` requires a unique `idempotency_key`. Subsequent calls with the same key return the existing order and payment link without creating duplicate Razorpay orders.
- **Fixed-Window Rate Limiter**: Agent sessions are limited to `MAX_TOOL_CALLS_PER_MINUTE` (default: 30) using atomic Redis INCR/EXPIRE transactions, protecting the merchant against Denial of Service (DoS) and runaway agent loops.

### Axiom 5: Constant-Time HMAC-SHA256 Webhook Verification
Razorpay payment webhooks (`POST /webhook/razorpay`) are cryptographically verified using SHA-256 HMAC against `RAZORPAY_WEBHOOK_SECRET`. Signatures are evaluated using `crypto/subtle.ConstantTimeCompare` to completely eliminate timing side-channel attacks.

---

## 5. End-to-End System Architecture

```mermaid
flowchart TB
    subgraph Client ["Buyer Agent (Client Context)"]
        Agent["Autonomous AI Agent\n(Claude / ChatGPT / SDK)"]
    end

    subgraph Gateway ["AgenticCheckout Gateway (Go :8080)"]
        direction TB
        MCP_Server["MCP Server\n(mark3labs/mcp-go)"]
        
        subgraph Tools ["MCP Tools Layer"]
            T1["find_and_price"]
            T2["search_catalog"]
            T3["get_product_details"]
            T4["negotiate_offer"]
            T5["create_checkout"]
            T6["check_order_status"]
        end

        subgraph CoreEngine ["Deterministic Core"]
            Pricing["Pure Integer Pricing Engine\n(3-Stage Concession Ladder)"]
            RateLimit["Rate Limiter\n(Fixed Window)"]
            Audit["Append-Only Audit Logger\n(Correlation ID Generator)"]
            Webhook["HMAC Webhook Receiver\n(crypto/subtle)"]
        end

        MCP_Server --> Tools
        T1 & T2 & T3 --> Audit
        T4 --> Pricing --> Audit
        T5 --> RateLimit --> Pricing --> Audit
        T6 --> Audit
    end

    subgraph Dashboard ["Merchant Dashboard (Next.js 14 :3000)"]
        direction TB
        BladeUI["Blade Design System UI\n(Overview, Audit Trail, Orders, Catalog)"]
        AITagger["AI Tagger & Vocabulary Reuse\n(POST /api/tagger)"]
        ImportLink["Razorpay Link Importer\n(POST /api/import)"]
    end

    subgraph Storage ["State & Cache Layer"]
        PG[("PostgreSQL 16\n- products\n- orders\n- negotiations\n- audit_log")]
        RD[("Redis 7\n- Idempotency Keys (24h)\n- Session Rate Limits")]
    end

    subgraph Razorpay ["Razorpay Cloud Sandbox"]
        RZP_Orders["Orders API\n(POST /v1/orders)"]
        RZP_Links["Payment Links API\n(POST /v1/payment_links)"]
        RZP_Hooks["Webhook Events\n(payment.captured, order.paid)"]
    end

    Agent <-->|JSON-RPC / stdio / SSE| MCP_Server
    Tools <--> Storage
    T5 --> RZP_Orders & RZP_Links
    RZP_Hooks -->|POST /webhook/razorpay| Webhook
    Webhook --> PG
    BladeUI <--> PG
    AITagger <--> PG
    ImportLink <--> PG
```

---

## 6. End-to-End Agent Commerce Flow

The complete 8-step agentic lifecycle from natural language discovery to settled payment:

```mermaid
sequenceDiagram
    autonumber
    actor User as Human Buyer
    participant Agent as AI Buyer Agent
    participant GW as AgenticCheckout Gateway
    participant Pricing as Pricing Engine
    participant DB as PostgreSQL
    participant RZP as Razorpay API
    actor Merchant as Human Merchant (Dashboard)

    User->>Agent: "Find me wireless ANC earbuds under ₹2,000"
    Agent->>GW: call find_and_price(intent: "earbuds under 2000 with ANC")
    GW->>DB: Full-text search & budget filter (paise <= 200000)
    DB-->>GW: Return matching products
    GW-->>Agent: PublicProduct list (Base Price: ₹1,799, Match Reason: "within budget")

    Note over Agent,GW: Step 2: Gated Negotiation & Deliberate Failure
    Agent->>GW: call negotiate_offer(product_id, proposed_price: 110000) [₹1,100]
    GW->>Pricing: EvaluateOffer(proposed: 110000, base: 179900, floor: 149900)
    Pricing-->>GW: Decision: REJECTED (Reason: BELOW_FLOOR, CounterOffer: ₹1,699)
    GW->>DB: Log negotiation attempt (Session Count: 1)
    GW-->>Agent: { decision: "rejected", reason_code: "BELOW_FLOOR", counter_offer: 169900 }

    Note over Agent,GW: Step 3: Counter-Offer Acceptance
    Agent->>GW: call negotiate_offer(product_id, proposed_price: 169900) [₹1,699]
    GW->>Pricing: EvaluateOffer(proposed: 169900, base: 179900, floor: 149900)
    Pricing-->>GW: Decision: APPROVED (Reason: WITHIN_BOUNDS, AgreedPrice: 169900)
    GW-->>Agent: { decision: "approved", agreed_price: 169900 }

    Note over Agent,GW: Step 4: Idempotent Checkout Link Generation
    Agent->>GW: call create_checkout(product_id, agreed_price: 169900, idempotency_key: "tx_abc123")
    GW->>Pricing: Verify agreed_price (169900 >= floor 149900)
    GW->>RZP: POST /v1/payment_links { amount: 169900, description: "AirBass X2 Pro" }
    RZP-->>GW: { id: "plink_xyz", short_url: "https://rzp.io/rzp/..." }
    GW->>DB: INSERT INTO orders (id, agreed_price, status: 'created', payment_link)
    GW-->>Agent: { order_id: "plink_xyz", payment_link: "https://rzp.io/rzp/...", status: "created" }

    Note over Agent,User: Step 5: Human Payment Completion
    Agent-->>User: "Negotiated price down to ₹1,699! Complete payment here: https://rzp.io/rzp/..."
    User->>RZP: Opens link, approves UPI Intent / Card Payment
    RZP->>RZP: Payment Authorized & Captured

    Note over RZP,GW: Step 6: Cryptographic Webhook Confirmation
    RZP->>GW: POST /webhook/razorpay [Payload + X-Razorpay-Signature]
    GW->>GW: crypto/subtle HMAC-SHA256 verification
    GW->>DB: UPDATE orders SET status = 'paid' WHERE razorpay_order_id = 'plink_xyz'
    GW->>DB: INSERT INTO audit_log (tool_name: 'webhook_razorpay', decision: 'paid')

    Note over Merchant,DB: Step 7: Merchant Dashboard Real-Time Visibility
    Merchant->>DB: Live View: Revenue updated (+₹1,699.00), Audit log verified
```

---

## 7. Database Schema & State Transitions

### 7.1 Table Definitions
- **`products`**: `id (UUID PRIMARY KEY)`, `name (VARCHAR)`, `description (TEXT)`, `category (VARCHAR)`, `tags (TEXT[])`, `base_price (INTEGER)`, `floor_price (INTEGER)`, `stock (INTEGER)`, `attributes (JSONB)`.
- **`orders`**: `id (UUID PRIMARY KEY)`, `razorpay_order_id (VARCHAR)`, `product_id (UUID)`, `agreed_price (INTEGER)`, `status (VARCHAR)`, `idempotency_key (VARCHAR UNIQUE)`, `payment_link (TEXT)`.
- **`negotiations`**: `id (UUID PRIMARY KEY)`, `product_id (UUID)`, `agent_session_id (VARCHAR)`, `proposed_price (INTEGER)`, `counter_offer (INTEGER)`, `decision (VARCHAR)`, `reason_code (VARCHAR)`, `attempt_number (INTEGER)`.
- **`audit_log`**: `id (BIGSERIAL PRIMARY KEY)`, `correlation_id (UUID)`, `tool_name (VARCHAR)`, `input (JSONB)`, `output (JSONB)`, `decision (VARCHAR)`, `reason_code (VARCHAR)`, `error_message (TEXT)`, `duration_ms (BIGINT)`, `created_at (TIMESTAMPTZ)`.

### 7.2 Order State Machine
```mermaid
stateDiagram-v2
    [*] --> created : create_checkout (Agreed >= Floor)
    created --> paid : webhook (payment.captured / order.paid)
    created --> failed : webhook (payment.failed)
    paid --> [*]
    failed --> [*]
```

---

## 8. Pricing Engine Concession Ladder

When a buyer agent proposes an offer below the base price:
1. If `proposed_price >= base_price`: **Approved** immediately at base price.
2. If `floor_price <= proposed_price < base_price`: **Approved** immediately (Reason: `WITHIN_BOUNDS`).
3. If `proposed_price < floor_price`: **Rejected** (Reason: `BELOW_FLOOR`). A deterministic concession counter-offer is calculated based on session attempt number:
   $$\text{Concession Step } k = \text{base\_price} - \left( \frac{k}{N} \times (\text{base\_price} - \text{floor\_price}) \right)$$
   - *Attempt 1 ($k=1$)*: Counter-offers with 33% of margin conceded.
   - *Attempt 2 ($k=2$)*: Counter-offers with 66% of margin conceded.
   - *Attempt 3 ($k=3$)*: Counter-offers with 100% of margin conceded (at floor price).
4. If `attempt > MAX_NEGOTIATION_ATTEMPTS` (3): **Hard Lockout** (Reason: `MAX_ATTEMPTS_EXCEEDED`).

---

## 9. Conclusion

AgenticCheckout proves that agent-to-agent commerce does not require risky code sandboxes or non-deterministic financial prompts. By combining Go's high concurrency, MCP's structured tool interface, Razorpay's battle-tested payment infrastructure, and strict mathematical guardrails, we deliver a production-grade merchant gateway built for the next decade of AI commerce in India.
