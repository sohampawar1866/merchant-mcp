package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Config holds all server configuration loaded from environment variables.
type Config struct {
	// Razorpay
	RazorpayKeyID         string
	RazorpayKeySecret     string
	RazorpayWebhookSecret string

	// Database
	DatabaseURL string

	// Redis
	RedisURL string

	// Server
	Port         string
	MCPTransport string // "stdio", "sse", "streamablehttp"

	// Feature Flags
	EnableFindAndPrice     bool
	EnableNegotiation      bool
	EnableHumanApproval    bool
	MaxNegotiationAttempts int
	EnableCatalogCache     bool
	AuditLogLevel          string // "full" or "decisions_only"
	CheckoutDeliveryMode   string // "payment_link" or "qr_code"
	MaxToolCallsPerMinute  int
	WebhookStrictMode      bool
}

func autoLoadEnv() {
	// Search up to 5 parent directories for .env.local and .env
	wd, err := os.Getwd()
	if err != nil {
		wd = "."
	}

	dir := wd
	for i := 0; i < 5; i++ {
		for _, name := range []string{".env.local", ".env"} {
			target := filepath.Join(dir, name)
			file, err := os.Open(target)
			if err == nil {
				scanner := bufio.NewScanner(file)
				for scanner.Scan() {
					line := strings.TrimSpace(scanner.Text())
					if line == "" || strings.HasPrefix(line, "#") {
						continue
					}
					parts := strings.SplitN(line, "=", 2)
					if len(parts) == 2 {
						k := strings.TrimSpace(parts[0])
						v := strings.TrimSpace(parts[1])
						if (strings.HasPrefix(v, "\"") && strings.HasSuffix(v, "\"")) ||
							(strings.HasPrefix(v, "'") && strings.HasSuffix(v, "'")) {
							v = v[1 : len(v)-1]
						}
						if os.Getenv(k) == "" {
							_ = os.Setenv(k, v)
						}
					}
				}
				file.Close()
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
}

// Load reads configuration from environment variables and .env / .env.local with sensible defaults.
func Load() *Config {
	autoLoadEnv()

	return &Config{
		// Razorpay
		RazorpayKeyID:         envStr("RAZORPAY_KEY_ID", ""),
		RazorpayKeySecret:     envStr("RAZORPAY_KEY_SECRET", ""),
		RazorpayWebhookSecret: envStr("RAZORPAY_WEBHOOK_SECRET", ""),

		// Database
		DatabaseURL: envStr("DATABASE_URL", "postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable"),

		// Redis
		RedisURL: envStr("REDIS_URL", "redis://localhost:6379"),

		// Server
		Port:         envStr("PORT", "8080"),
		MCPTransport: envStr("MCP_TRANSPORT", "streamablehttp"), // default: streamablehttp (use --transport flag or MCP_TRANSPORT env to override)

		// Feature Flags
		EnableFindAndPrice:     envBool("ENABLE_FIND_AND_PRICE", true),
		EnableNegotiation:      envBool("ENABLE_NEGOTIATION", true),
		EnableHumanApproval:    envBool("ENABLE_HUMAN_APPROVAL", false),
		MaxNegotiationAttempts: envInt("MAX_NEGOTIATION_ATTEMPTS", 3),
		EnableCatalogCache:     envBool("ENABLE_CATALOG_CACHE", true),
		AuditLogLevel:          envStr("AUDIT_LOG_LEVEL", "full"),
		CheckoutDeliveryMode:   envStr("CHECKOUT_DELIVERY_MODE", "payment_link"),
		MaxToolCallsPerMinute:  envInt("MAX_TOOL_CALLS_PER_MINUTE", 30),
		WebhookStrictMode:      envBool("WEBHOOK_STRICT_MODE", true),
	}
}

func envStr(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func envBool(key string, defaultVal bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	parsed, err := strconv.ParseBool(val)
	if err != nil {
		return defaultVal
	}
	return parsed
}

func envInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return parsed
}
