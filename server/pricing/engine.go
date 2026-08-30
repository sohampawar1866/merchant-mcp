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
