package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mark3labs/mcp-go/server"
	"github.com/sohampawar1866/merchant-mcp/server/audit"
	"github.com/sohampawar1866/merchant-mcp/server/cache"
	"github.com/sohampawar1866/merchant-mcp/server/config"
	"github.com/sohampawar1866/merchant-mcp/server/db"
	"github.com/sohampawar1866/merchant-mcp/server/razorpay"
	"github.com/sohampawar1866/merchant-mcp/server/tools"
	"github.com/sohampawar1866/merchant-mcp/server/webhook"
)

func main() {
	// Crucial for stdio transport: keep stdout clean for JSON-RPC messages only
	log.SetOutput(os.Stderr)

	// CLI flags — take precedence over env vars and config defaults
	// Precedence: --transport flag > MCP_TRANSPORT env var > default (streamablehttp)
	transportFlag := flag.String("transport", "", "MCP transport to use: streamablehttp | sse | stdio (overrides MCP_TRANSPORT env var)")
	portFlag := flag.String("port", "", "Port to listen on (overrides PORT env var)")
	flag.Parse()

	// Apply CLI flags into env so config.Load() picks them up
	if *transportFlag != "" {
		os.Setenv("MCP_TRANSPORT", *transportFlag)
	}
	if *portFlag != "" {
		os.Setenv("PORT", *portFlag)
	}

	cfg := config.Load()
	log.Printf("AgenticCheckout Multi-Tenant MCP Gateway v1.0.0 starting (transport: %s, port: %s)", cfg.MCPTransport, cfg.Port)
	log.Printf("Configuration: find_and_price=%v, negotiation=%v, human_approval=%v, max_attempts=%d, rate_limit=%d/min, strict_webhook=%v",
		cfg.EnableFindAndPrice, cfg.EnableNegotiation, cfg.EnableHumanApproval, cfg.MaxNegotiationAttempts, cfg.MaxToolCallsPerMinute, cfg.WebhookStrictMode)

	ctx := context.Background()
	var pool *pgxpool.Pool

	// Connect to database, run migrations, and auto-seed if DATABASE_URL is set
	if cfg.DatabaseURL != "" {
		var err error
		pool, err = db.NewPool(ctx, cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		defer pool.Close()
		log.Println("Database connected successfully")

		if err := db.RunMigrations(ctx, pool); err != nil {
			log.Fatalf("Failed to run database migrations: %v", err)
		}
		log.Println("Database migrations completed")

		// Auto-seed catalog if empty for Demo Store 1
		if err := db.AutoSeed(ctx, pool, "data/catalog.seed.json"); err != nil {
			log.Printf("Warning: auto-seeding failed: %v", err)
		}
	} else {
		log.Println("WARNING: DATABASE_URL not set, running without database")
	}

	auditLogger := audit.NewLogger(pool, cfg.AuditLogLevel)
	rzpClient := razorpay.NewClient(cfg.RazorpayKeyID, cfg.RazorpayKeySecret)
	redisCache, _ := cache.NewCache(cfg.RedisURL)
	webhookReceiver := webhook.NewReceiver(pool, auditLogger, cfg.RazorpayWebhookSecret, cfg.WebhookStrictMode, cfg.EncryptionPassphrase)

	// Initialize MCP Server
	s := server.NewMCPServer(
		"agentic-checkout-gateway",
		"1.0.0",
		server.WithToolCapabilities(true),
		server.WithLogging(),
	)

	// Register Core Catalog Tools (scoped per merchant)
	tools.RegisterCatalogTools(s, pool, auditLogger, cfg)

	// Register Composite Tools (dynamically controlled per merchant)
	tools.RegisterCompositeTools(s, pool, auditLogger, cfg)
	log.Println("Feature: find_and_price composite tool registered (multi-tenant enabled)")

	// Register Negotiation Tool (dynamically controlled per merchant)
	tools.RegisterNegotiateTool(s, pool, auditLogger, cfg)
	log.Println("Feature: negotiate_offer tool registered (multi-tenant enabled)")

	// Register Checkout Tools (gated with decrypted credentials & kill switch)
	tools.RegisterCheckoutTools(s, pool, rzpClient, redisCache, auditLogger, cfg)
	log.Println("Feature: create_checkout & check_order_status tools registered (multi-tenant enabled)")

	// Register Multi-Product Cart & Bundle Tools
	tools.RegisterCartTools(s, pool, rzpClient, auditLogger, cfg)
	log.Println("Feature: create_cart, add_to_cart, view_cart, negotiate_cart_bundle, checkout_cart registered")

	// In stdio mode, launch a lightweight background HTTP server on cfg.Port for Razorpay webhooks
	if cfg.MCPTransport == "stdio" {
		go func() {
			mux := http.NewServeMux()
			mux.Handle("/webhook/razorpay", webhookReceiver)
			serverAddr := ":" + cfg.Port
			log.Printf("Webhook listener started on http://localhost%s/webhook/razorpay", serverAddr)
			if err := http.ListenAndServe(serverAddr, mux); err != nil && err != http.ErrServerClosed {
				log.Printf("Warning: webhook server exited: %v", err)
			}
		}()
	}

	// Start configured transport
	switch cfg.MCPTransport {
	case "sse":
		log.Printf("Starting MCP SSE server on :%s", cfg.Port)
		sseServer := server.NewSSEServer(s, server.WithBaseURL(fmt.Sprintf("http://localhost:%s", cfg.Port)))
		if err := sseServer.Start(":" + cfg.Port); err != nil {
			log.Fatalf("SSE Server error: %v", err)
		}

	case "streamablehttp":
		log.Printf("Starting MCP StreamableHTTP server on :%s", cfg.Port)
		httpServer := server.NewStreamableHTTPServer(s)
		if err := httpServer.Start(":" + cfg.Port); err != nil {
			log.Fatalf("StreamableHTTP Server error: %v", err)
		}

	case "stdio":
		if err := server.ServeStdio(s); err != nil {
			log.Fatalf("Stdio Server error: %v", err)
		}

	default:
		log.Fatalf("Unknown MCP_TRANSPORT: %s (expected 'stdio', 'sse', or 'streamablehttp')", cfg.MCPTransport)
	}
}
