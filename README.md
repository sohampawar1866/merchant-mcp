# AgenticCheckout Multi-Tenant MCP Gateway & Platform Control Plane

> **Turn any merchant into an AI-accessible, Razorpay-powered storefront on a unified multi-tenant platform.**  
> Built for the **Razorpay AI Buildathon 2026** (Track 1: AI Growth & Agentic Commerce).

[![Release](https://img.shields.io/github/v/release/sohampawar1866/merchant-mcp?color=0284c7&label=Release)](https://github.com/sohampawar1866/merchant-mcp/releases/latest)
[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20pgcrypto-336791?logo=postgresql)](https://www.postgresql.org)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live%20Test%20Mode-0284c7)](https://razorpay.com)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](https://github.com/sohampawar1866/merchant-mcp/actions)

---

## Architecture at a Glance

AgenticCheckout operates as a **Multi-Tenant Gateway & Operator Control Plane**:
1. **Platform Operator** deploys the backend infrastructure once (`docker compose up -d`).
2. **Merchants** self-onboard in seconds via `http://localhost:3000/onboard` — entering their Razorpay test keys once into the PostgreSQL Cryptographic Vault (`pgcrypto`) and receiving a 1-time `api_key`. No `.env` files are ever touched by merchants.
3. **AI Buyer Agents** (Claude, Cursor, ChatGPT, custom agents) connect to the MCP Gateway over `streamablehttp`, `sse`, or `stdio` with their merchant's API key.
4. **Platform Kill Switch**: The platform admin (`http://localhost:3001`) can instantly suspend any store with a single click, immediately blocking all incoming agent tool calls with `MERCHANT_SUSPENDED`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AGENTICCHECKOUT MULTI-TENANT PORTS                     │
├────────────────────────────┬───────────────┬────────────────────────────────┤
│ Service                    │ Port          │ Description                    │
├────────────────────────────┼───────────────┼────────────────────────────────┤
│ Platform Admin Console     │ :3001         │ Cross-store GMV & Kill Switch  │
│ Merchant Control Plane     │ :3000         │ Store Catalog, Orders, Audit   │
│ MCP Gateway Endpoint       │ :8080/mcp     │ StreamableHTTP JSON-RPC        │
│ Razorpay Webhook Listener  │ :8080/webhook │ HMAC SHA-256 Webhook Receiver  │
└────────────────────────────┴───────────────┴────────────────────────────────┘
```

---

## Quickstart for Platform Operators

### 1. Launch Platform with Docker Compose

```bash
git clone https://github.com/sohampawar1866/merchant-mcp.git
cd merchant-mcp
docker compose up -d
```

- **Platform Admin Console**: `http://localhost:3001`
- **Merchant Control Plane**: `http://localhost:3000`
- **Merchant Onboarding**: `http://localhost:3000/onboard`
- **MCP Gateway Endpoint**: `http://localhost:8080/mcp` (StreamableHTTP)

---

## For Merchants: Self-Serve Onboarding (Zero `.env` Setup)

1. Open `http://localhost:3000/onboard`.
2. Enter your Store Name, Razorpay Key ID, and Razorpay Key Secret.
3. Click **"Generate Store API Key & Launch"**.
4. Save your 1-time API key (e.g. `mc_live_...`). Your keys are encrypted at rest in PostgreSQL and never written to disk.
5. Provide this key to your autonomous buyer agents via the `merchant_api_key` tool argument or `X-Merchant-Key` header.

---

## MCP Tools Reference

| Tool Name | Type | Description |
|-----------|------|-------------|
| `find_and_price` | Composite | Resolves natural language intent (e.g. *"earbuds under 2000 with ANC"*), extracts budget in paise, filters catalog for authenticated store, and returns explainable match reasons. |
| `search_catalog` | Discovery | Scoped PostgreSQL full-text search across product name, description, tags, and category. |
| `get_product_details` | Discovery | Retrieves detailed product attributes, specifications, and real-time inventory count. |
| `negotiate_offer` | Gated Action | Evaluates buyer agent discount proposals against merchant floor prices using a 3-stage concession ladder (33%, 66%, 100% floor) with hard attempt lockout. |
| `create_checkout` | Gated Action | Verifies price gating (agreed price >= floor price), checks Redis 24h idempotency, decrypts merchant Razorpay credentials, and creates live Razorpay Payment Link. |
| `check_order_status` | Inquiry | Queries database and polls Razorpay API for live payment capture status. |

---

## Security and Safety Properties

- **Integer Arithmetic in Paise**: All prices are stored and computed in integer paise (₹1 = 100 paise), eliminating floating-point rounding errors.
- **Zero Margin Leakage Guarantee**: DB entity `Product` stores `floor_price`, but all tool outputs serialize through `PublicProduct` and `MatchOption` DTOs where internal margin fields are structurally omitted.
- **Cryptographic Vault at Rest**: Merchant secrets are symmetrically encrypted using PostgreSQL `pgcrypto` (`pgp_sym_encrypt`) with `ENCRYPTION_PASSPHRASE`.
- **Platform Kill Switch**: If a merchant's status is toggled to `suspended` in the Admin Console, all tool calls immediately return `MERCHANT_SUSPENDED`.
- **Constant-Time HMAC Webhooks**: Webhook signatures are verified with `crypto/subtle.ConstantTimeCompare` against the merchant's decrypted secret to eliminate timing side-channel attacks.

---

## Automated Testing & Verification

Run the full automated test suite (including Multi-Tenant Isolation, Platform Kill Switch, Deliberate Below-Floor Rejections, and 8-Step E2E Commerce Journey):

```bash
go test ./... -v
```

Run only multi-tenant isolation and kill switch tests:
```bash
go test ./server/tools/ -run TestMultiTenant -v
```

Run the 8-step End-to-End Agent Commerce Journey:
```bash
go test ./server/tools/ -run TestE2E -v
```

---

## License

MIT License. Built for the Razorpay AI Buildathon 2026.
