package wallet

import (
	"testing"
)

func TestCheckAllowance_Bounds(t *testing.T) {
	w := AgentWallet{
		BalancePaise:           500000,  // ₹5,000.00
		MonthlyAllowancePaise:  1500000, // ₹15,000.00
		MonthlySpentPaise:      200000,  // ₹2,000.00
		PerTransactionCapPaise: 200000,  // ₹2,000.00
		WhitelistedCategories:  []string{"Audio", "Desk Accessories"},
		Status:                 "active",
	}

	// 1. Valid purchase under cap (₹750 = 75000 paise in "Desk Accessories")
	res1 := w.CheckAllowance(75000, []string{"Desk Accessories"})
	if !res1.Allowed || res1.ReasonCode != "WITHIN_ALLOWANCE" {
		t.Fatalf("expected approved allowance, got %+v", res1)
	}

	// 2. Exceeds per-transaction cap (₹2,500 = 250000 paise)
	res2 := w.CheckAllowance(250000, []string{"Audio"})
	if res2.Allowed || res2.ReasonCode != "EXCEEDS_TXN_CAP" {
		t.Fatalf("expected EXCEEDS_TXN_CAP, got %+v", res2)
	}

	// 3. Category not whitelisted
	res3 := w.CheckAllowance(50000, []string{"Luxury Jewelry"})
	if res3.Allowed || res3.ReasonCode != "CATEGORY_NOT_WHITELISTED" {
		t.Fatalf("expected CATEGORY_NOT_WHITELISTED, got %+v", res3)
	}

	// 4. Wallet frozen
	wFrozen := w
	wFrozen.Status = "frozen"
	res4 := wFrozen.CheckAllowance(50000, []string{"Audio"})
	if res4.Allowed || res4.ReasonCode != "WALLET_FROZEN" {
		t.Fatalf("expected WALLET_FROZEN, got %+v", res4)
	}
}
