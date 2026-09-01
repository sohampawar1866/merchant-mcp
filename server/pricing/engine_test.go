package pricing

import (
	"testing"
)

func TestEvaluateOffer_BaseAndHigher(t *testing.T) {
	// Base: ₹1,799 (179900 paise), Floor: ₹1,499 (149900 paise)
	input := EvaluationInput{
		BasePrice:          179900,
		FloorPrice:         149900,
		ProposedPrice:      179900,
		AttemptNumber:      1,
		MaxAttempts:        3,
		MaxDiscountPercent: 20,
	}

	res := EvaluateOffer(input)
	if res.Decision != "approved" || res.ReasonCode != "ACCEPTED_BASE_OR_HIGHER" || res.FinalPrice != 179900 {
		t.Fatalf("unexpected result: %+v", res)
	}

	// Higher than base price should still succeed at base price
	input.ProposedPrice = 200000
	res = EvaluateOffer(input)
	if res.Decision != "approved" || res.FinalPrice != 179900 {
		t.Fatalf("unexpected result for higher price: %+v", res)
	}
}

func TestEvaluateOffer_WithinBounds(t *testing.T) {
	input := EvaluationInput{
		BasePrice:          179900,
		FloorPrice:         149900,
		ProposedPrice:      160000,
		AttemptNumber:      1,
		MaxAttempts:        3,
		MaxDiscountPercent: 20,
	}

	res := EvaluateOffer(input)
	if res.Decision != "approved" || res.ReasonCode != "WITHIN_BOUNDS" || res.FinalPrice != 160000 {
		t.Fatalf("unexpected result: %+v", res)
	}

	// Exact floor price
	input.ProposedPrice = 149900
	res = EvaluateOffer(input)
	if res.Decision != "approved" || res.ReasonCode != "WITHIN_BOUNDS" || res.FinalPrice != 149900 {
		t.Fatalf("unexpected result for exact floor price: %+v", res)
	}
}

func TestEvaluateOffer_BelowFloor_DiscountLadder(t *testing.T) {
	base := 179900
	floor := 149900
	discountRange := base - floor // 30000 paise

	// Attempt 1: Below floor (propose 100000)
	input := EvaluationInput{
		BasePrice:          base,
		FloorPrice:         floor,
		ProposedPrice:      100000,
		AttemptNumber:      1,
		MaxAttempts:        3,
		MaxDiscountPercent: 20,
	}

	res1 := EvaluateOffer(input)
	if res1.Decision != "rejected" || res1.ReasonCode != "BELOW_FLOOR" {
		t.Fatalf("attempt 1: expected rejection with BELOW_FLOOR, got %+v", res1)
	}
	expectedCounter1 := base - (discountRange * 33 / 100) // 179900 - 9900 = 170000
	if res1.CounterOffer != expectedCounter1 {
		t.Errorf("attempt 1: expected counter %d, got %d", expectedCounter1, res1.CounterOffer)
	}

	// Attempt 2: Propose 100000
	input.AttemptNumber = 2
	res2 := EvaluateOffer(input)
	if res2.Decision != "rejected" || res2.ReasonCode != "BELOW_FLOOR" {
		t.Fatalf("attempt 2: expected rejection with BELOW_FLOOR, got %+v", res2)
	}
	expectedCounter2 := base - (discountRange * 66 / 100) // 179900 - 19800 = 160100
	if res2.CounterOffer != expectedCounter2 {
		t.Errorf("attempt 2: expected counter %d, got %d", expectedCounter2, res2.CounterOffer)
	}
	if res2.CounterOffer >= res1.CounterOffer {
		t.Errorf("attempt 2 counter (%d) should be lower than attempt 1 counter (%d)", res2.CounterOffer, res1.CounterOffer)
	}

	// Attempt 3: Propose 100000
	input.AttemptNumber = 3
	res3 := EvaluateOffer(input)
	if res3.Decision != "rejected" || res3.ReasonCode != "BELOW_FLOOR" {
		t.Fatalf("attempt 3: expected rejection with BELOW_FLOOR, got %+v", res3)
	}
	if res3.CounterOffer != floor {
		t.Errorf("attempt 3: expected counter at floor (%d), got %d", floor, res3.CounterOffer)
	}
}

func TestEvaluateOffer_MaxAttemptsExceeded(t *testing.T) {
	input := EvaluationInput{
		BasePrice:          179900,
		FloorPrice:         149900,
		ProposedPrice:      160000, // Even if price is good, attempt count lockout takes precedence
		AttemptNumber:      4,
		MaxAttempts:        3,
		MaxDiscountPercent: 20,
	}

	res := EvaluateOffer(input)
	if res.Decision != "rejected" || res.ReasonCode != "MAX_ATTEMPTS_EXCEEDED" {
		t.Fatalf("expected MAX_ATTEMPTS_EXCEEDED, got %+v", res)
	}
}

func TestEvaluateOffer_InvalidPrice(t *testing.T) {
	input := EvaluationInput{
		BasePrice:     179900,
		FloorPrice:    149900,
		ProposedPrice: -500,
		AttemptNumber: 1,
		MaxAttempts:   3,
	}

	res := EvaluateOffer(input)
	if res.Decision != "rejected" || res.ReasonCode != "INVALID_PRICE" {
		t.Fatalf("expected INVALID_PRICE for negative price, got %+v", res)
	}

	input.ProposedPrice = 0
	res = EvaluateOffer(input)
	if res.Decision != "rejected" || res.ReasonCode != "INVALID_PRICE" {
		t.Fatalf("expected INVALID_PRICE for 0 price, got %+v", res)
	}
}

func TestEvaluateOffer_GlobalMaxDiscountPercentCeiling(t *testing.T) {
	// Base: 100000 paise (₹1,000)
	// Floor: 50000 paise (₹500 - 50% discount)
	// But Global MaxDiscountPercent: 10% -> Effective floor must be 90000 paise (₹900)
	input := EvaluationInput{
		BasePrice:          100000,
		FloorPrice:         50000,
		ProposedPrice:      80000, // ₹800 (below 10% global max discount)
		AttemptNumber:      1,
		MaxAttempts:        3,
		MaxDiscountPercent: 10,
	}

	res := EvaluateOffer(input)
	if res.Decision != "rejected" || res.ReasonCode != "BELOW_FLOOR" {
		t.Fatalf("expected rejection due to global discount ceiling, got %+v", res)
	}

	// Propose ₹900 (exact 10% ceiling)
	input.ProposedPrice = 90000
	res = EvaluateOffer(input)
	if res.Decision != "approved" || res.FinalPrice != 90000 {
		t.Fatalf("expected approval at global discount ceiling, got %+v", res)
	}
}

func TestEvaluateOffer_RequireHumanReview(t *testing.T) {
	input := EvaluationInput{
		BasePrice:          179900,
		FloorPrice:         149900,
		ProposedPrice:      160000,
		AttemptNumber:      1,
		MaxAttempts:        3,
		MaxDiscountPercent: 20,
		RequireHumanReview: true,
	}

	res := EvaluateOffer(input)
	if res.Decision != "pending_approval" || res.ReasonCode != "WITHIN_BOUNDS" || res.FinalPrice != 160000 {
		t.Fatalf("expected pending_approval when RequireHumanReview is true, got %+v", res)
	}
}

func TestEvaluateBundleOffer_MultiItem(t *testing.T) {
	// Item 1: Laptop Stand (Base: ₹899 = 89900 paise, Floor: ₹750 = 75000 paise, Qty: 1)
	// Item 2: Desk Mat (Base: ₹1,199 = 119900 paise, Floor: ₹900 = 90000 paise, Qty: 1)
	// Total Base = 209800 paise (₹2,098.00)
	// Total Floor = 165000 paise (₹1,650.00)
	items := []BundleItemInput{
		{ID: "prod_laptop_stand", BasePrice: 89900, FloorPrice: 75000, Quantity: 1},
		{ID: "prod_desk_mat", BasePrice: 119900, FloorPrice: 90000, Quantity: 1},
	}

	// 1. Proposed ₹2,098 (Full price)
	res1 := EvaluateBundleOffer(BundleEvaluationInput{
		Items:              items,
		ProposedTotalPrice: 209800,
		AttemptNumber:      1,
		MaxAttempts:        3,
	})
	if res1.Decision != "approved" || res1.ReasonCode != "ACCEPTED_BASE_OR_HIGHER" {
		t.Fatalf("expected approved base price, got %+v", res1)
	}

	// 2. Proposed ₹1,800 (Within allowable bounds: ₹1,650 to ₹2,098)
	res2 := EvaluateBundleOffer(BundleEvaluationInput{
		Items:              items,
		ProposedTotalPrice: 180000,
		AttemptNumber:      1,
		MaxAttempts:        3,
	})
	if res2.Decision != "approved" || res2.ReasonCode != "WITHIN_BOUNDS" || res2.FinalTotalPrice != 180000 {
		t.Fatalf("expected approved bundle discount, got %+v", res2)
	}
	if len(res2.Allocations) != 2 {
		t.Fatalf("expected 2 allocations, got %d", len(res2.Allocations))
	}
	// Verify neither item went below floor
	for _, alloc := range res2.Allocations {
		if alloc.ID == "prod_laptop_stand" && alloc.UnitAgreedPrice < 75000 {
			t.Fatalf("laptop stand violated floor: %d", alloc.UnitAgreedPrice)
		}
		if alloc.ID == "prod_desk_mat" && alloc.UnitAgreedPrice < 90000 {
			t.Fatalf("desk mat violated floor: %d", alloc.UnitAgreedPrice)
		}
	}

	// 3. Proposed ₹1,200 (Below floor ₹1,650) -> Concession Ladder
	res3 := EvaluateBundleOffer(BundleEvaluationInput{
		Items:              items,
		ProposedTotalPrice: 120000,
		AttemptNumber:      1,
		MaxAttempts:        3,
	})
	if res3.Decision != "rejected" || res3.ReasonCode != "BELOW_FLOOR" {
		t.Fatalf("expected below floor rejection, got %+v", res3)
	}
	// Attempt 1 counter-offer should concede 33% of (209800 - 165000 = 44800) -> counter = 209800 - 14784 = 195016
	if res3.CounterOfferPrice <= 165000 || res3.CounterOfferPrice >= 209800 {
		t.Fatalf("unexpected counter offer: %d", res3.CounterOfferPrice)
	}
}

