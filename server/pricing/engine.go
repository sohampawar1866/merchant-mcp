package pricing

// EvaluationInput holds all parameters for deterministic discount evaluation.
type EvaluationInput struct {
	BasePrice          int  // in paise (e.g. 179900)
	FloorPrice         int  // in paise (e.g. 149900)
	ProposedPrice      int  // in paise (e.g. 150000)
	AttemptNumber      int  // 1-indexed (1, 2, 3...)
	MaxAttempts        int  // e.g. 3
	MaxDiscountPercent int  // global ceiling, e.g. 20 (meaning price cannot drop below 80% of base)
	RequireHumanReview bool // if true, returns "pending_approval" instead of immediate "approved"
}

// EvaluationResult contains the outcome of the deterministic evaluation.
type EvaluationResult struct {
	Decision     string `json:"decision"` // "approved", "rejected", "pending_approval"
	ReasonCode   string `json:"reason_code"`
	FinalPrice   int    `json:"final_price,omitempty"`   // in paise (if approved/pending)
	CounterOffer int    `json:"counter_offer,omitempty"` // in paise (if rejected with counter-offer)
}

// EvaluateOffer evaluates a proposed price deterministically without any LLM inference.
func EvaluateOffer(input EvaluationInput) EvaluationResult {
	// 1. Input validation
	if input.ProposedPrice <= 0 || input.BasePrice <= 0 {
		return EvaluationResult{
			Decision:   "rejected",
			ReasonCode: "INVALID_PRICE",
		}
	}

	maxAttempts := input.MaxAttempts
	if maxAttempts <= 0 {
		maxAttempts = 3
	}

	// 2. Max attempts lock-out
	if input.AttemptNumber > maxAttempts {
		return EvaluationResult{
			Decision:   "rejected",
			ReasonCode: "MAX_ATTEMPTS_EXCEEDED",
		}
	}

	// 3. Compute effective floor price considering global MaxDiscountPercent ceiling
	effectiveFloor := input.FloorPrice
	if input.MaxDiscountPercent > 0 && input.MaxDiscountPercent < 100 {
		globalFloor := input.BasePrice * (100 - input.MaxDiscountPercent) / 100
		// Effective floor is the more conservative (higher) price
		if globalFloor > effectiveFloor {
			effectiveFloor = globalFloor
		}
	}

	// 4. Proposed price meets or exceeds base price
	if input.ProposedPrice >= input.BasePrice {
		return EvaluationResult{
			Decision:   "approved",
			ReasonCode: "ACCEPTED_BASE_OR_HIGHER",
			FinalPrice: input.BasePrice,
		}
	}

	// 5. Proposed price is within acceptable range (>= effectiveFloor)
	if input.ProposedPrice >= effectiveFloor {
		decision := "approved"
		if input.RequireHumanReview {
			decision = "pending_approval"
		}
		return EvaluationResult{
			Decision:   decision,
			ReasonCode: "WITHIN_BOUNDS",
			FinalPrice: input.ProposedPrice,
		}
	}

	// 6. Proposed price is below effective floor -> Compute step-ladder counter-offer
	// Ladder step based on attempt number:
	// Attempt 1: Concede 33% of allowable discount range
	// Attempt 2: Concede 66% of allowable discount range
	// Attempt 3+: Concede 100% of allowable discount range (counter at effectiveFloor)
	discountRange := input.BasePrice - effectiveFloor
	var counterOffer int

	switch {
	case input.AttemptNumber <= 1:
		counterOffer = input.BasePrice - (discountRange * 33 / 100)
	case input.AttemptNumber == 2:
		counterOffer = input.BasePrice - (discountRange * 66 / 100)
	default:
		counterOffer = effectiveFloor
	}

	// Guarantee counter offer never violates effective floor
	if counterOffer < effectiveFloor {
		counterOffer = effectiveFloor
	}

	return EvaluationResult{
		Decision:     "rejected",
		ReasonCode:   "BELOW_FLOOR",
		CounterOffer: counterOffer,
	}
}

// BundleItemInput holds details for a single line item in a bundle.
type BundleItemInput struct {
	ID         string `json:"id"`
	BasePrice  int    `json:"base_price"`  // in paise
	FloorPrice int    `json:"floor_price"` // in paise
	Quantity   int    `json:"quantity"`
}

// BundleEvaluationInput holds all parameters for evaluating a multi-item bundle proposal.
type BundleEvaluationInput struct {
	Items              []BundleItemInput `json:"items"`
	ProposedTotalPrice int               `json:"proposed_total_price"` // in paise
	AttemptNumber      int               `json:"attempt_number"`
	MaxAttempts        int               `json:"max_attempts"`
	MaxDiscountPercent int               `json:"max_discount_percent"`
	RequireHumanReview bool              `json:"require_human_review"`
}

// ItemPriceAllocation describes the final negotiated price allocated to an individual line item.
type ItemPriceAllocation struct {
	ID                string `json:"id"`
	Quantity          int    `json:"quantity"`
	UnitBasePrice     int    `json:"unit_base_price"`
	UnitAgreedPrice   int    `json:"unit_agreed_price"`
	LineDiscountPaise int    `json:"line_discount_paise"`
	LineTotalPaise    int    `json:"line_total_paise"`
}

// BundleEvaluationResult holds the evaluated outcome of a bundle negotiation.
type BundleEvaluationResult struct {
	Decision          string                `json:"decision"` // "approved", "rejected", "pending_approval"
	ReasonCode        string                `json:"reason_code"`
	FinalTotalPrice   int                   `json:"final_total_price,omitempty"`
	TaxPaise          int                   `json:"tax_paise,omitempty"`
	TotalWithTaxPaise int                   `json:"total_with_tax_paise,omitempty"`
	FinalTotalINR     string                `json:"final_total_inr,omitempty"`
	TotalWithTaxINR   string                `json:"total_with_tax_inr,omitempty"`
	CounterOfferPrice int                   `json:"counter_offer_price,omitempty"`
	TotalBasePrice    int                   `json:"total_base_price"`
	TotalFloorPrice   int                   `json:"total_floor_price"`
	TotalSavingsPaise int                   `json:"total_savings_paise"`
	TotalSavingsINR   string                `json:"total_savings_inr,omitempty"`
	Allocations       []ItemPriceAllocation `json:"allocations,omitempty"`
	CampaignID        *string               `json:"campaign_id,omitempty"`
	CampaignName      string                `json:"campaign_name,omitempty"`
}

// EvaluateBundleOffer evaluates a multi-item bundle proposal deterministically with proportional floor-safe distribution.
func EvaluateBundleOffer(input BundleEvaluationInput) BundleEvaluationResult {
	if len(input.Items) == 0 || input.ProposedTotalPrice <= 0 {
		return BundleEvaluationResult{
			Decision:   "rejected",
			ReasonCode: "INVALID_PRICE",
		}
	}

	maxAttempts := input.MaxAttempts
	if maxAttempts <= 0 {
		maxAttempts = 3
	}
	if input.AttemptNumber > maxAttempts {
		return BundleEvaluationResult{
			Decision:   "rejected",
			ReasonCode: "MAX_ATTEMPTS_EXCEEDED",
		}
	}

	// Compute aggregate base and floor prices
	totalBase := 0
	totalFloor := 0
	for _, it := range input.Items {
		if it.Quantity <= 0 || it.BasePrice <= 0 {
			return BundleEvaluationResult{
				Decision:   "rejected",
				ReasonCode: "INVALID_ITEM_SPEC",
			}
		}
		totalBase += it.BasePrice * it.Quantity
		totalFloor += it.FloorPrice * it.Quantity
	}

	// Compute effective bundle floor considering MaxDiscountPercent ceiling
	effectiveBundleFloor := totalFloor
	if input.MaxDiscountPercent > 0 && input.MaxDiscountPercent < 100 {
		globalFloor := totalBase * (100 - input.MaxDiscountPercent) / 100
		if globalFloor > effectiveBundleFloor {
			effectiveBundleFloor = globalFloor
		}
	}

	// Case 1: Proposed price meets or exceeds base total
	if input.ProposedTotalPrice >= totalBase {
		allocations := distributeBundleDiscount(input.Items, totalBase, totalBase)
		return BundleEvaluationResult{
			Decision:          "approved",
			ReasonCode:        "ACCEPTED_BASE_OR_HIGHER",
			FinalTotalPrice:   totalBase,
			TotalBasePrice:    totalBase,
			TotalFloorPrice:   totalFloor,
			TotalSavingsPaise: 0,
			Allocations:       allocations,
		}
	}

	// Case 2: Proposed price is within bounds (>= effectiveBundleFloor)
	if input.ProposedTotalPrice >= effectiveBundleFloor {
		decision := "approved"
		if input.RequireHumanReview {
			decision = "pending_approval"
		}
		allocations := distributeBundleDiscount(input.Items, totalBase, input.ProposedTotalPrice)
		return BundleEvaluationResult{
			Decision:          decision,
			ReasonCode:        "WITHIN_BOUNDS",
			FinalTotalPrice:   input.ProposedTotalPrice,
			TotalBasePrice:    totalBase,
			TotalFloorPrice:   totalFloor,
			TotalSavingsPaise: totalBase - input.ProposedTotalPrice,
			Allocations:       allocations,
		}
	}

	// Case 3: Proposed price is below floor -> compute 3-stage concession ladder
	discountRange := totalBase - effectiveBundleFloor
	var counterOffer int
	switch {
	case input.AttemptNumber <= 1:
		counterOffer = totalBase - (discountRange * 33 / 100)
	case input.AttemptNumber == 2:
		counterOffer = totalBase - (discountRange * 66 / 100)
	default:
		counterOffer = effectiveBundleFloor
	}

	if counterOffer < effectiveBundleFloor {
		counterOffer = effectiveBundleFloor
	}

	return BundleEvaluationResult{
		Decision:          "rejected",
		ReasonCode:        "BELOW_FLOOR",
		CounterOfferPrice: counterOffer,
		TotalBasePrice:    totalBase,
		TotalFloorPrice:   totalFloor,
	}
}

// distributeBundleDiscount proportionally distributes total agreed discount across items based on available margin capacity.
func distributeBundleDiscount(items []BundleItemInput, totalBase, agreedTotal int) []ItemPriceAllocation {
	totalDiscount := totalBase - agreedTotal
	if totalDiscount <= 0 {
		allocations := make([]ItemPriceAllocation, len(items))
		for i, it := range items {
			allocations[i] = ItemPriceAllocation{
				ID:                it.ID,
				Quantity:          it.Quantity,
				UnitBasePrice:     it.BasePrice,
				UnitAgreedPrice:   it.BasePrice,
				LineDiscountPaise: 0,
				LineTotalPaise:    it.BasePrice * it.Quantity,
			}
		}
		return allocations
	}

	// Calculate total margin capacity across items
	totalCapacity := 0
	capacities := make([]int, len(items))
	for i, it := range items {
		cap := (it.BasePrice - it.FloorPrice) * it.Quantity
		if cap < 0 {
			cap = 0
		}
		capacities[i] = cap
		totalCapacity += cap
	}

	allocations := make([]ItemPriceAllocation, len(items))
	allocatedDiscountTotal := 0

	for i, it := range items {
		lineDiscount := 0
		if totalCapacity > 0 {
			lineDiscount = totalDiscount * capacities[i] / totalCapacity
		}
		if lineDiscount > capacities[i] {
			lineDiscount = capacities[i]
		}
		allocatedDiscountTotal += lineDiscount

		unitDiscount := lineDiscount / it.Quantity
		unitAgreed := it.BasePrice - unitDiscount

		allocations[i] = ItemPriceAllocation{
			ID:                it.ID,
			Quantity:          it.Quantity,
			UnitBasePrice:     it.BasePrice,
			UnitAgreedPrice:   unitAgreed,
			LineDiscountPaise: lineDiscount,
			LineTotalPaise:    unitAgreed * it.Quantity,
		}
	}

	// Allocate any remainder paise to first item with capacity
	remainder := totalDiscount - allocatedDiscountTotal
	if remainder > 0 && len(allocations) > 0 {
		allocations[0].LineDiscountPaise += remainder
		allocations[0].UnitAgreedPrice = allocations[0].UnitBasePrice - (allocations[0].LineDiscountPaise / allocations[0].Quantity)
		allocations[0].LineTotalPaise = allocations[0].UnitAgreedPrice * allocations[0].Quantity
	}

	return allocations
}

