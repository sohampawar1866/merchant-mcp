package cart

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Cart represents a shopping cart session for an agent/customer.
type Cart struct {
	ID               uuid.UUID  `json:"id"`
	MerchantID       uuid.UUID  `json:"merchant_id"`
	AgentSessionID   string     `json:"agent_session_id"`
	CustomerID       string     `json:"customer_id,omitempty"`
	Status           string     `json:"status"` // active, negotiating, locked, checked_out, expired
	Currency         string     `json:"currency"`
	SubtotalPaise    int        `json:"subtotal_paise"`
	TaxPaise         int        `json:"tax_paise"`
	DiscountPaise    int        `json:"discount_paise"`
	TotalPaise       int        `json:"total_paise"`
	NegotiatedBundle bool       `json:"negotiated_bundle"`
	IdempotencyKey   string     `json:"idempotency_key,omitempty"`
	Items            []CartItem `json:"items"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	ExpiresAt        time.Time  `json:"expires_at"`
}

// CartItem represents an itemized line entry inside a cart.
type CartItem struct {
	ID                   uuid.UUID `json:"id"`
	CartID               uuid.UUID `json:"cart_id"`
	ProductID            uuid.UUID `json:"product_id"`
	ProductName          string    `json:"product_name"`
	MerchantID           uuid.UUID `json:"merchant_id"`
	Quantity             int       `json:"quantity"`
	UnitBasePricePaise   int       `json:"unit_base_price_paise"`
	UnitAgreedPricePaise int       `json:"unit_agreed_price_paise"`
	UnitFloorPricePaise  int       `json:"unit_floor_price_paise,omitempty"` // Omitted in public responses
	TaxRateBps           int       `json:"tax_rate_bps"`                     // e.g. 1800 for 18.00% GST
	TaxAmountPaise       int       `json:"tax_amount_paise"`
	LineTotalPaise       int       `json:"line_total_paise"`
}

// CalculateLineTax computes integer half-up rounded tax in paise for a given taxable amount and basis points rate.
// Formula: floor((taxable * rate_bps + 5000) / 10000)
func CalculateLineTax(taxablePaise int, rateBps int) int {
	if taxablePaise <= 0 || rateBps <= 0 {
		return 0
	}
	return (taxablePaise*rateBps + 5000) / 10000
}

// RecalculateCartTotals recomputes subtotal, tax, and total strictly in 64-bit integer paise.
func RecalculateCartTotals(items []CartItem, discountPaise int) (subtotal, tax, total int) {
	subtotal = 0
	tax = 0
	for i := range items {
		lineTaxable := items[i].UnitAgreedPricePaise * items[i].Quantity
		lineTax := CalculateLineTax(lineTaxable, items[i].TaxRateBps)
		items[i].TaxAmountPaise = lineTax
		items[i].LineTotalPaise = lineTaxable + lineTax
		subtotal += lineTaxable
		tax += lineTax
	}

	netSubtotal := subtotal - discountPaise
	if netSubtotal < 0 {
		netSubtotal = 0
	}
	total = netSubtotal + tax
	return subtotal, tax, total
}

// CreateCart initializes a new active cart session.
func CreateCart(ctx context.Context, pool *pgxpool.Pool, merchantID uuid.UUID, agentSessionID, customerID string) (*Cart, error) {
	if pool == nil {
		return nil, fmt.Errorf("cart: database pool is nil")
	}

	cartID := uuid.New()
	now := time.Now()
	expiresAt := now.Add(24 * time.Hour)

	query := `
		INSERT INTO carts (
			id, merchant_id, agent_session_id, customer_id, status, currency,
			subtotal_paise, tax_paise, discount_paise, total_paise,
			created_at, updated_at, expires_at
		) VALUES (
			$1, $2, $3, $4, 'active', 'INR', 0, 0, 0, 0, $5, $5, $6
		) RETURNING id;
	`
	_, err := pool.Exec(ctx, query, cartID, merchantID, agentSessionID, customerID, now, expiresAt)
	if err != nil {
		return nil, fmt.Errorf("cart: failed to create cart: %w", err)
	}

	return &Cart{
		ID:             cartID,
		MerchantID:     merchantID,
		AgentSessionID: agentSessionID,
		CustomerID:     customerID,
		Status:         "active",
		Currency:       "INR",
		Items:          []CartItem{},
		CreatedAt:      now,
		UpdatedAt:      now,
		ExpiresAt:      expiresAt,
	}, nil
}

// GetCart retrieves a cart and its itemized line items.
func GetCart(ctx context.Context, pool *pgxpool.Pool, cartID uuid.UUID, merchantID uuid.UUID) (*Cart, error) {
	if pool == nil {
		return nil, fmt.Errorf("cart: database pool is nil")
	}

	cartQuery := `
		SELECT id, merchant_id, agent_session_id, COALESCE(customer_id, ''), status, currency,
		       subtotal_paise, tax_paise, discount_paise, total_paise, negotiated_bundle,
		       COALESCE(idempotency_key, ''), created_at, updated_at, expires_at
		FROM carts
		WHERE id = $1 AND (merchant_id = $2 OR $2 = '00000000-0000-0000-0000-000000000000'::uuid);
	`
	var c Cart
	err := pool.QueryRow(ctx, cartQuery, cartID, merchantID).Scan(
		&c.ID, &c.MerchantID, &c.AgentSessionID, &c.CustomerID, &c.Status, &c.Currency,
		&c.SubtotalPaise, &c.TaxPaise, &c.DiscountPaise, &c.TotalPaise, &c.NegotiatedBundle,
		&c.IdempotencyKey, &c.CreatedAt, &c.UpdatedAt, &c.ExpiresAt,
	)
	if err != nil {
		return nil, err
	}

	itemsQuery := `
		SELECT ci.id, ci.cart_id, ci.product_id, p.name, ci.merchant_id, ci.quantity,
		       ci.unit_base_price_paise, ci.unit_agreed_price_paise, p.floor_price,
		       ci.tax_rate_bps, ci.tax_amount_paise, ci.line_total_paise
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.cart_id = $1
		ORDER BY ci.created_at ASC;
	`
	rows, err := pool.Query(ctx, itemsQuery, cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	c.Items = make([]CartItem, 0)
	for rows.Next() {
		var item CartItem
		err := rows.Scan(
			&item.ID, &item.CartID, &item.ProductID, &item.ProductName, &item.MerchantID, &item.Quantity,
			&item.UnitBasePricePaise, &item.UnitAgreedPricePaise, &item.UnitFloorPricePaise,
			&item.TaxRateBps, &item.TaxAmountPaise, &item.LineTotalPaise,
		)
		if err != nil {
			return nil, err
		}
		c.Items = append(c.Items, item)
	}

	return &c, nil
}

// AddItemToCart adds or increments a product in the cart, recalculating integer totals.
func AddItemToCart(ctx context.Context, pool *pgxpool.Pool, cartID, productID, merchantID uuid.UUID, quantity int) (*Cart, error) {
	if pool == nil {
		return nil, fmt.Errorf("cart: database pool is nil")
	}
	if quantity <= 0 {
		return nil, fmt.Errorf("cart: quantity must be greater than zero")
	}

	// 1. Query product details and stock
	var productName string
	var basePrice, floorPrice, stock int
	prodQuery := `SELECT name, base_price, floor_price, stock FROM products WHERE id = $1 AND merchant_id = $2;`
	err := pool.QueryRow(ctx, prodQuery, productID, merchantID).Scan(&productName, &basePrice, &floorPrice, &stock)
	if err != nil {
		return nil, fmt.Errorf("cart: product lookup failed: %w", err)
	}
	if stock < quantity {
		return nil, fmt.Errorf("cart: insufficient stock for '%s' (requested: %d, available: %d)", productName, quantity, stock)
	}

	// 2. Insert or update line item
	var existingItemID uuid.UUID
	var existingQty int
	checkQuery := `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2;`
	err = pool.QueryRow(ctx, checkQuery, cartID, productID).Scan(&existingItemID, &existingQty)

	taxRateBps := 1800 // 18% standard GST rate
	if err == pgx.ErrNoRows {
		// New item
		lineTaxable := basePrice * quantity
		lineTax := CalculateLineTax(lineTaxable, taxRateBps)
		lineTotal := lineTaxable + lineTax

		insertItemQuery := `
			INSERT INTO cart_items (
				id, cart_id, product_id, merchant_id, quantity, unit_base_price_paise,
				unit_agreed_price_paise, tax_rate_bps, tax_amount_paise, line_total_paise
			) VALUES (
				gen_random_uuid(), $1, $2, $3, $4, $5, $5, $6, $7, $8
			);
		`
		_, err = pool.Exec(ctx, insertItemQuery, cartID, productID, merchantID, quantity, basePrice, taxRateBps, lineTax, lineTotal)
		if err != nil {
			return nil, fmt.Errorf("cart: failed to add item: %w", err)
		}
	} else if err == nil {
		// Update quantity
		newQty := existingQty + quantity
		lineTaxable := basePrice * newQty
		lineTax := CalculateLineTax(lineTaxable, taxRateBps)
		lineTotal := lineTaxable + lineTax

		updateItemQuery := `
			UPDATE cart_items
			SET quantity = $1, tax_amount_paise = $2, line_total_paise = $3
			WHERE id = $4;
		`
		_, err = pool.Exec(ctx, updateItemQuery, newQty, lineTax, lineTotal, existingItemID)
		if err != nil {
			return nil, fmt.Errorf("cart: failed to update item: %w", err)
		}
	} else {
		return nil, err
	}

	// 3. Recompute cart totals
	c, err := GetCart(ctx, pool, cartID, merchantID)
	if err != nil {
		return nil, err
	}

	subtotal, tax, total := RecalculateCartTotals(c.Items, c.DiscountPaise)
	_, err = pool.Exec(ctx, `UPDATE carts SET subtotal_paise = $1, tax_paise = $2, total_paise = $3, updated_at = NOW() WHERE id = $4;`,
		subtotal, tax, total, cartID)
	if err != nil {
		return nil, err
	}

	c.SubtotalPaise = subtotal
	c.TaxPaise = tax
	c.TotalPaise = total
	return c, nil
}

// RemoveItemFromCart removes or decrements a line item from the cart.
func RemoveItemFromCart(ctx context.Context, pool *pgxpool.Pool, cartID, productID, merchantID uuid.UUID, quantity int) (*Cart, error) {
	if pool == nil {
		return nil, fmt.Errorf("cart: database pool is nil")
	}

	if quantity <= 0 {
		// Remove entire line
		_, err := pool.Exec(ctx, `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2;`, cartID, productID)
		if err != nil {
			return nil, err
		}
	} else {
		var itemID uuid.UUID
		var currentQty, unitPrice, taxRateBps int
		err := pool.QueryRow(ctx, `SELECT id, quantity, unit_agreed_price_paise, tax_rate_bps FROM cart_items WHERE cart_id = $1 AND product_id = $2;`,
			cartID, productID).Scan(&itemID, &currentQty, &unitPrice, &taxRateBps)
		if err != nil {
			return nil, err
		}

		if currentQty <= quantity {
			_, err = pool.Exec(ctx, `DELETE FROM cart_items WHERE id = $1;`, itemID)
			if err != nil {
				return nil, err
			}
		} else {
			newQty := currentQty - quantity
			lineTaxable := unitPrice * newQty
			lineTax := CalculateLineTax(lineTaxable, taxRateBps)
			lineTotal := lineTaxable + lineTax
			_, err = pool.Exec(ctx, `UPDATE cart_items SET quantity = $1, tax_amount_paise = $2, line_total_paise = $3 WHERE id = $4;`,
				newQty, lineTax, lineTotal, itemID)
			if err != nil {
				return nil, err
			}
		}
	}

	c, err := GetCart(ctx, pool, cartID, merchantID)
	if err != nil {
		return nil, err
	}

	subtotal, tax, total := RecalculateCartTotals(c.Items, c.DiscountPaise)
	_, _ = pool.Exec(ctx, `UPDATE carts SET subtotal_paise = $1, tax_paise = $2, total_paise = $3, updated_at = NOW() WHERE id = $4;`,
		subtotal, tax, total, cartID)

	c.SubtotalPaise = subtotal
	c.TaxPaise = tax
	c.TotalPaise = total
	return c, nil
}
