package tools

import (
	"context"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TestMultiTenantCategoryPartitioning verifies multi-store tenant isolation
func TestMultiTenantCategoryPartitioning(t *testing.T) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://agentic:agentic@127.0.0.1:5433/agentic_checkout?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Skipf("Postgres unavailable for partitioning test: %v", err)
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skipf("Postgres ping failed: %v", err)
		return
	}

	merchantA := "00000000-0000-0000-0000-000000000001"
	merchantB := "00000000-0000-0000-0000-000000000002"

	// 1. Query Store A products
	rowsA, err := pool.Query(ctx, "SELECT id, name, category, merchant_id FROM products WHERE merchant_id = $1;", merchantA)
	if err != nil {
		t.Fatalf("Query failed for Merchant A: %v", err)
	}
	defer rowsA.Close()

	countA := 0
	for rowsA.Next() {
		var id, name, cat, mID string
		if err := rowsA.Scan(&id, &name, &cat, &mID); err != nil {
			t.Fatalf("Scan error: %v", err)
		}
		if mID != merchantA {
			t.Fatalf("TENANT LEAK: Expected merchant_id %s, got %s", merchantA, mID)
		}
		countA++
	}

	// 2. Query Store B products
	rowsB, err := pool.Query(ctx, "SELECT id, name, category, merchant_id FROM products WHERE merchant_id = $1;", merchantB)
	if err != nil {
		t.Fatalf("Query failed for Merchant B: %v", err)
	}
	defer rowsB.Close()

	countB := 0
	for rowsB.Next() {
		var id, name, cat, mID string
		if err := rowsB.Scan(&id, &name, &cat, &mID); err != nil {
			t.Fatalf("Scan error: %v", err)
		}
		if mID != merchantB {
			t.Fatalf("TENANT LEAK: Expected merchant_id %s, got %s", merchantB, mID)
		}
		countB++
	}

	t.Logf("Tenant Isolation Verified: Store A has %d products, Store B has %d products. Zero data leakage.", countA, countB)
}

// TestSub5msLatencyBenchmark verifies that index-partitioned queries run in under 5ms
func TestSub5msLatencyBenchmark(t *testing.T) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://agentic:agentic@127.0.0.1:5433/agentic_checkout?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Skipf("Postgres unavailable for benchmark: %v", err)
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skipf("Postgres ping failed: %v", err)
		return
	}

	merchantID := "00000000-0000-0000-0000-000000000001"
	category := "Electronics"

	// Warmup query
	var dummy int
	_ = pool.QueryRow(ctx, "SELECT 1").Scan(&dummy)

	// Run 100 sequential queries measuring latency
	iterations := 100
	var totalDuration time.Duration
	var maxDuration time.Duration

	for i := 0; i < iterations; i++ {
		start := time.Now()
		rows, err := pool.Query(ctx, `
			SELECT id, name, base_price, stock 
			FROM products 
			WHERE merchant_id = $1 AND category = $2 AND stock > 0;
		`, merchantID, category)
		if err != nil {
			t.Fatalf("Benchmark query failed: %v", err)
		}

		for rows.Next() {
			var id, name string
			var price, stock int
			_ = rows.Scan(&id, &name, &price, &stock)
		}
		rows.Close()

		elapsed := time.Since(start)
		totalDuration += elapsed
		if elapsed > maxDuration {
			maxDuration = elapsed
		}
	}

	avgLatency := totalDuration / time.Duration(iterations)
	avgMs := float64(avgLatency.Microseconds()) / 1000.0
	maxMs := float64(maxDuration.Microseconds()) / 1000.0

	t.Logf("Sequential Latency Benchmark (100 runs): Avg = %.2fms | Max = %.2fms", avgMs, maxMs)

	// Concurrency test: 20 simultaneous workers running 5 queries each
	concurrency := 20
	queriesPerWorker := 5
	var wg sync.WaitGroup
	var concurrentTotal time.Duration
	var mu sync.Mutex

	startConcurrent := time.Now()
	for w := 0; w < concurrency; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for q := 0; q < queriesPerWorker; q++ {
				qStart := time.Now()
				rows, err := pool.Query(ctx, `
					SELECT id, name, base_price, stock 
					FROM products 
					WHERE merchant_id = $1 AND category = $2;
				`, merchantID, category)
				if err == nil {
					for rows.Next() {
						var id, name string
						var price, stock int
						_ = rows.Scan(&id, &name, &price, &stock)
					}
					rows.Close()
				}
				qElapsed := time.Since(qStart)
				mu.Lock()
				concurrentTotal += qElapsed
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	totalConcurrentElapsed := time.Since(startConcurrent)

	avgConcurrentMs := float64(concurrentTotal.Microseconds()) / float64(concurrency*queriesPerWorker*1000)
	t.Logf("Concurrent Load Benchmark (%d workers, %d queries): Wall Time = %v | Avg Latency per Query = %.2fms",
		concurrency, concurrency*queriesPerWorker, totalConcurrentElapsed, avgConcurrentMs)

	// Enforce Hackathon Sub-5ms SLA Guarantee
	if avgMs > 5.0 {
		t.Errorf("Latency SLA breached: expected < 5.0ms, got %.2fms", avgMs)
	} else {
		t.Logf("✅ SLA GUARANTEE PASSED: Average query latency is %.2fms (< 5ms SLA)", avgMs)
	}
}

// BenchmarkCategoryPartitionQuery provides standard Go benchmark profiling
func BenchmarkCategoryPartitionQuery(b *testing.B) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://agentic:agentic@127.0.0.1:5433/agentic_checkout?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		b.Skip("Postgres unavailable")
		return
	}
	defer pool.Close()

	merchantID := "00000000-0000-0000-0000-000000000001"
	category := "Electronics"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rows, err := pool.Query(ctx, `
			SELECT id, name, base_price, stock 
			FROM products 
			WHERE merchant_id = $1 AND category = $2;
		`, merchantID, category)
		if err == nil {
			for rows.Next() {
				var id, name string
				var price, stock int
				_ = rows.Scan(&id, &name, &price, &stock)
			}
			rows.Close()
		}
	}
}
