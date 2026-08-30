# AgenticCheckout MCP Gateway and Control Plane

> **Turn any merchant into an AI-accessible, Razorpay-powered store.**  
> Built for the **Razorpay AI Buildathon 2026** (Track 1: AI Growth & Agentic Commerce).

[![Release](https://img.shields.io/github/v/release/sohampawar1866/merchant-mcp?color=0284c7&label=Release)](https://github.com/sohampawar1866/merchant-mcp/releases/latest)
[![GitHub Packages](https://img.shields.io/badge/Docker%20Packages-GHCR-24292e?logo=github)](https://github.com/sohampawar1866/merchant-mcp/pkgs/container/merchant-mcp-server)
[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live%20Test%20Mode-0284c7)](https://razorpay.com)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)]()

---

## Quickstart

You can run AgenticCheckout in three ways: via **Pre-built GitHub Container Packages**, **Docker Compose**, or **Local Source Code**.

### Option 1: Run Pre-built Packages from GitHub Container Registry (Fastest)

Pull the official pre-built production container images directly without compiling from source:

```bash
# Pull official gateway server and merchant dashboard images
docker pull ghcr.io/sohampawar1866/merchant-mcp-server:latest
docker pull ghcr.io/sohampawar1866/merchant-mcp-dashboard:latest
```

Launch all services using the pre-built packages (defaults to `streamablehttp` transport):
```bash
docker compose up -d
```
- **Merchant Dashboard**: `http://localhost:3000`
- **MCP Gateway Endpoint**: `http://localhost:8080/mcp` (StreamableHTTP, default)

Override transport at run time without changing any code:
```bash
MCP_TRANSPORT=sse docker compose up -d      # SSE transport
MCP_TRANSPORT=stdio docker compose up -d    # stdio (Claude Desktop)
```

---

### Option 2: Download the Official Release

Download the validated production release archive from [**GitHub Releases v1.0.0**](https://github.com/sohampawar1866/merchant-mcp/releases/latest):
```bash
# Clone the latest release tag
git clone --branch v1.0.0 https://github.com/sohampawar1866/merchant-mcp.git
cd merchant-mcp
docker compose up -d
```

---

### Option 3: Local Go and Dashboard Development

1. Ensure Go 1.24+, Node 20+, and PostgreSQL are installed.
2. Configure `.env.local` or `.env` with your Razorpay test credentials:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=agentic_checkout_secret_2026
   ```
3. Start the Go MCP server (defaults to `streamablehttp` on `:8080`):
   ```bash
   go run ./server/cmd/
   ```
   Override transport via `--transport` flag (takes highest precedence):
   ```bash
   go run ./server/cmd/ --transport=streamablehttp   # default
   go run ./server/cmd/ --transport=sse
   go run ./server/cmd/ --transport=stdio            # for Claude Desktop
   go run ./server/cmd/ --transport=sse --port=9090  # custom port
   ```
4. Start the Next.js Dashboard in another terminal:
   ```bash
   cd dashboard && npm run dev
   ```

---

## Overview

As autonomous AI agents (ChatGPT, Claude, Gemini, custom buyer agents) increasingly discover and purchase products on behalf of consumers, merchants require a secure, standard gateway to expose their catalog, accept negotiated purchase offers, and finalize checkout without leaking profit margins or enabling financial hallucinations.

**AgenticCheckout** is a high-performance Model Context Protocol (MCP) server written in Go with a Next.js Merchant Control Plane that acts as the merchant's programmatic front door:

1. **Deterministic Pricing Engine ("LLM never decides money")**: Pure integer arithmetic rules engine evaluates discount proposals against product floor prices with an escalating 3-stage concession ladder.
2. **Zero Margin Leakage Guarantee**: Strict separation of public DTOs guarantees internal `floor_price` and ladder states are NEVER exposed in tool responses.
3. **Live Razorpay Payments and Idempotency**: Strictly executes against Razorpay REST APIs (`POST /v1/payment_links`, `POST /v1/orders`) with Redis-backed idempotency guards preventing duplicate charges. No synthetic fallbacks.
4. **HMAC-Verified Webhooks**: Constant-time HMAC-SHA256 signature verification updates order statuses to `paid` upon bank confirmation.
5. **Append-Only Audit Trail**: Every tool call, negotiation proposal, checkout, and webhook event is recorded in PostgreSQL with UUID correlation IDs and timing metrics.
6. **Merchant Dashboard (Blade Design System)**: Full Next.js 14 web UI with real-time KPI aggregations, searchable audit log inspector, transaction history, catalog CRUD, and AI-assisted tagger with vocabulary reuse.

---

## MCP Tools Reference

| Tool Name | Type | Description |
|-----------|------|-------------|
| `find_and_price` | Composite | Resolves natural language intent (e.g. *"earbuds under 2000 with ANC"*), extracts budget in paise, filters catalog, and returns ranked options with explainable match reasons in a single call. |
| `search_catalog` | Core Discovery | PostgreSQL full-text search across product name, description, tags, and category with optional price ceilings. |
| `get_product_details` | Core Discovery | Retrieves detailed product attributes, specifications, and real-time inventory count. |
| `negotiate_offer` | Gated Action | Evaluates buyer agent discount proposals against merchant floor prices using a 3-stage concession ladder (33%, 66%, 100% floor) with hard attempt lockout (`MAX_ATTEMPTS_EXCEEDED`). |
| `create_checkout` | Gated Action | Verifies price gating (agreed price >= floor price), checks Redis idempotency, creates Razorpay Payment Link, and persists order. |
| `check_order_status` | Status Inquiry | Queries database and polls Razorpay API for live payment capture status. |

---

## Architecture

```mermaid
flowchart LR
    subgraph Buyer ["Autonomous Buyer Agent"]
        LLM["AI Agent\n(Claude / Cursor / ChatGPT)"]
    end

    subgraph Gateway ["Merchant MCP Gateway (Go :8080)"]
        MCP["MCP Server\n(mark3labs/mcp-go)"]
        Composite["find_and_price"]
        Catalog["search_catalog\nget_product_details"]
        Pricing["Pricing Engine\n(Deterministic Rules)"]
        Checkout["create_checkout\ncheck_order_status"]
        Audit["Audit Logger\n(Correlation IDs)"]
    end

    subgraph Dashboard ["Merchant Dashboard (Next.js :3000)"]
        UI["Blade Control Plane\n(Overview, Audit, Orders, Catalog)"]
        Tagger["AI Tagger and Import"]
    end

    subgraph Storage ["Infrastructure"]
        PG[("PostgreSQL 16\nCatalog + Orders + Audit")]
        RD[("Redis 7\nIdempotency + Rate Limiter")]
    end

    subgraph Razorpay ["Razorpay Ecosystem"]
        RZP_API["Razorpay REST API\n(Orders & Payment Links)"]
        Webhook["Razorpay Webhook\n(HMAC-SHA256)"]
    end

    LLM <-->|StreamableHTTP / SSE / stdio| MCP
    MCP --> Composite
    MCP --> Catalog
    MCP --> Pricing
    MCP --> Checkout
    Composite --> PG
    Catalog --> PG
    Pricing --> PG
    Checkout --> PG
    Checkout --> RD
    Checkout --> RZP_API
    Webhook -->|POST /webhook/razorpay| Gateway
    Gateway --> Audit --> PG
    UI --> PG
    Tagger --> PG
```

---

## Testing and Verification

Run the full automated test suite (including live Razorpay sandbox integration, deliberate below-floor failure cases, idempotency verification, HMAC webhooks, and 8-step E2E commerce journey):

```bash
go test ./... -v
```

Run only the 8-step End-to-End Agent Commerce Journey:
```bash
go test ./server/tools/ -run TestE2E -v
```

---

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server HTTP port (also overridable via `--port` flag) |
| `MCP_TRANSPORT` | `streamablehttp` | Transport: `streamablehttp` \| `sse` \| `stdio` (also overridable via `--transport` flag) |
| `DATABASE_URL` | `postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable` | PostgreSQL connection URI |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URI |
| `RAZORPAY_KEY_ID` | `""` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `""` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | `""` | Webhook HMAC secret |
| `ENABLE_FIND_AND_PRICE` | `true` | Enable `find_and_price` composite tool |
| `ENABLE_NEGOTIATION` | `true` | Enable `negotiate_offer` tool |
| `ENABLE_HUMAN_APPROVAL` | `false` | Require merchant approval on negotiation |
| `MAX_NEGOTIATION_ATTEMPTS` | `3` | Maximum negotiation rounds per product session |
| `MAX_TOOL_CALLS_PER_MINUTE` | `30` | Session rate limiting threshold |
| `WEBHOOK_STRICT_MODE` | `true` | Reject invalid webhook HMAC signatures with HTTP 400 |
| `AUDIT_LOG_LEVEL` | `full` | Audit logging level (`full` or `decisions_only`) |

### Transport Precedence

```
--transport flag  >  MCP_TRANSPORT env var  >  default (streamablehttp)
```

| Transport | Endpoint | Recommended For |
|-----------|----------|-----------------|
| `streamablehttp` *(default)* | `POST http://localhost:8080/mcp` | Claude.ai, Cursor, remote agents |
| `sse` | `http://localhost:8080/sse` | Older web-based MCP clients |
| `stdio` | stdin/stdout (no HTTP) | Claude Desktop local install |

---

## Security and Safety Properties

- **Integer Arithmetic in Paise**: All prices are stored and computed in integer paise (₹1 = 100 paise), avoiding floating-point precision flaws.
- **Zero Margin Leakage**: DB entity `Product` contains `floor_price`, but MCP tool outputs serialize through `PublicProduct` and `MatchOption` DTOs where internal margin fields are structurally omitted.
- **Gated Checkout**: Attempting to execute `create_checkout` below merchant floor price is strictly rejected with `BELOW_FLOOR`.
- **Constant-Time Cryptography**: Webhook HMAC signatures are verified with `crypto/subtle.ConstantTimeCompare` to mitigate timing attacks.
- **Zero Synthetic Fallbacks**: Live production-grade REST calls to Razorpay sandbox with explicit, actionable UI diagnostics.

---

## Documentation Links
- [Comprehensive Architecture Specification (ARCHITECTURE.md)](ARCHITECTURE.md)

---

## License
MIT License. Built for the Razorpay AI Buildathon 2026.
