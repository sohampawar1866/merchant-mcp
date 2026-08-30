package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SeedProduct represents a product record loaded from seed JSON.
type SeedProduct struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Category    string         `json:"category"`
	Tags        []string       `json:"tags"`
	TagsSource  string         `json:"tags_source"`
	BasePrice   int            `json:"base_price"`
	FloorPrice  int            `json:"floor_price"`
	Stock       int            `json:"stock"`
	Attributes  map[string]any `json:"attributes"`
}

// AutoSeed populates the products table with seed catalog data if the table is currently empty.
func AutoSeed(ctx context.Context, pool *pgxpool.Pool, seedFilePath string) error {
	var count int
	err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		return fmt.Errorf("db: failed to check products count: %w", err)
	}

	if count > 0 {
		log.Printf("db: products table already has %d entries, skipping auto-seed", count)
		return nil
	}

	data, err := os.ReadFile(seedFilePath)
	if err != nil {
		return fmt.Errorf("db: failed to read seed file %s: %w", seedFilePath, err)
	}

	var products []SeedProduct
	if err := json.Unmarshal(data, &products); err != nil {
		return fmt.Errorf("db: failed to unmarshal seed file %s: %w", seedFilePath, err)
	}

	query := `
		INSERT INTO products (
			id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
		) ON CONFLICT (id) DO NOTHING;
	`

	inserted := 0
	for _, p := range products {
		attrJSON, err := json.Marshal(p.Attributes)
		if err != nil {
			attrJSON = []byte("{}")
		}

		tagsSource := p.TagsSource
		if tagsSource == "" {
			tagsSource = "ai"
		}

		_, err = pool.Exec(ctx, query,
			p.ID,
			p.Name,
			p.Description,
			p.Category,
			p.Tags,
			tagsSource,
			p.BasePrice,
			p.FloorPrice,
			p.Stock,
			attrJSON,
		)
		if err != nil {
			return fmt.Errorf("db: failed to insert seed product %s: %w", p.ID, err)
		}
		inserted++
	}

	log.Printf("db: successfully seeded %d products from %s", inserted, seedFilePath)
	return nil
}
