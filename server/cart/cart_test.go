package cart

import (
	"testing"
)

func TestCalculateLineTax(t *testing.T) {
	// 18% on ₹1,000 (100000 paise) = 18000 paise (₹180.00)
	tax := CalculateLineTax(100000, 1800)
	if tax != 18000 {
		t.Fatalf("expected 18000 paise, got %d", tax)
	}

	// 18% on ₹899 (89900 paise) = 16182 paise (₹161.82)
	// (89900 * 1800 + 5000) / 10000 = (161820000 + 5000) / 10000 = 16182
	tax2 := CalculateLineTax(89900, 1800)
	if tax2 != 16182 {
		t.Fatalf("expected 16182 paise, got %d", tax2)
	}

	// 18% on ₹599 (59900 paise) = 10782 paise (₹107.82)
	tax3 := CalculateLineTax(59900, 1800)
	if tax3 != 10782 {
		t.Fatalf("expected 10782 paise, got %d", tax3)
	}

	// Zero & Negative edge cases
	if taxZero := CalculateLineTax(0, 1800); taxZero != 0 {
		t.Fatalf("expected 0 tax, got %d", taxZero)
	}
	if taxNeg := CalculateLineTax(-100, 1800); taxNeg != 0 {
		t.Fatalf("expected 0 tax for negative, got %d", taxNeg)
	}
}

func TestRecalculateCartTotals(t *testing.T) {
	items := []CartItem{
		{
			UnitAgreedPricePaise: 89900, // ₹899.00
			Quantity:             1,
			TaxRateBps:           1800, // 18%
		},
		{
			UnitAgreedPricePaise: 59900, // ₹599.00
			Quantity:             2,     // ₹1,198.00
			TaxRateBps:           1800, // 18%
		},
	}

	subtotal, tax, total := RecalculateCartTotals(items, 0)

	// Expected subtotal = 89900 + 2*59900 = 89900 + 119800 = 209700 (₹2,097.00)
	if subtotal != 209700 {
		t.Fatalf("expected subtotal 209700, got %d", subtotal)
	}

	// Expected tax item 1 = 16182, item 2 = 119800 * 1800 = 21564 => total tax = 37746 (₹377.46)
	if tax != 37746 {
		t.Fatalf("expected tax 37746, got %d", tax)
	}

	// Total = 209700 + 37746 = 247446 (₹2,474.46)
	if total != 247446 {
		t.Fatalf("expected total 247446, got %d", total)
	}
}
