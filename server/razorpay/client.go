package razorpay

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// CreateOrderRequest defines payload for POST /v1/orders
type CreateOrderRequest struct {
	Amount   int    `json:"amount"` // in paise (e.g. 165000 = ₹1,650.00)
	Currency string `json:"currency"`
	Receipt  string `json:"receipt"`
}

// OrderResponse defines Razorpay Order response
type OrderResponse struct {
	ID       string `json:"id"`
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
	Status   string `json:"status"` // "created", "paid", "attempted"
	Receipt  string `json:"receipt"`
}

// CreatePaymentLinkRequest defines payload for POST /v1/payment_links
type CreatePaymentLinkRequest struct {
	Amount        int    `json:"amount"` // in paise
	Currency      string `json:"currency"`
	Description   string `json:"description"`
	CustomerName  string `json:"customer_name,omitempty"`
	CustomerEmail string `json:"customer_email,omitempty"`
	CustomerPhone string `json:"customer_phone,omitempty"`
	UPILink       bool   `json:"upi_link"`
}

// PaymentLinkResponse defines Razorpay Payment Link response
type PaymentLinkResponse struct {
	ID       string `json:"id"`
	ShortURL string `json:"short_url"`
	Status   string `json:"status"` // "created", "paid", "expired"
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

// Client interacts directly with the live Razorpay REST API without fallbacks.
type Client struct {
	keyID     string
	keySecret string
	baseURL   string
	client    *http.Client
}

// NewClient creates a new Razorpay API client.
func NewClient(keyID, keySecret string) *Client {
	return &Client{
		keyID:     keyID,
		keySecret: keySecret,
		baseURL:   "https://api.razorpay.com/v1",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) validateCredentials() error {
	if c.keyID == "" || c.keySecret == "" {
		return fmt.Errorf("razorpay: API credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")
	}
	return nil
}

// CreateOrder creates a Razorpay order via POST /v1/orders.
func (c *Client) CreateOrder(ctx context.Context, req CreateOrderRequest) (*OrderResponse, error) {
	if err := c.validateCredentials(); err != nil {
		return nil, err
	}
	if req.Currency == "" {
		req.Currency = "INR"
	}
	if req.Amount <= 0 {
		return nil, fmt.Errorf("razorpay: invalid order amount (%d paise)", req.Amount)
	}

	url := fmt.Sprintf("%s/orders", c.baseURL)
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("razorpay: failed to marshal order request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("razorpay: failed to create http request: %w", err)
	}

	c.setAuthHeader(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("razorpay: http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("razorpay: order API returned HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	var orderResp OrderResponse
	if err := json.Unmarshal(respBody, &orderResp); err != nil {
		return nil, fmt.Errorf("razorpay: failed to unmarshal order response: %w", err)
	}

	return &orderResp, nil
}

// CreatePaymentLink creates a Razorpay payment link via POST /v1/payment_links.
func (c *Client) CreatePaymentLink(ctx context.Context, req CreatePaymentLinkRequest) (*PaymentLinkResponse, error) {
	if err := c.validateCredentials(); err != nil {
		return nil, err
	}
	if req.Currency == "" {
		req.Currency = "INR"
	}
	if req.Amount <= 0 {
		return nil, fmt.Errorf("razorpay: invalid payment link amount (%d paise)", req.Amount)
	}

	url := fmt.Sprintf("%s/payment_links", c.baseURL)
	payload := map[string]any{
		"amount":      req.Amount,
		"currency":    req.Currency,
		"description": req.Description,
		"notify": map[string]bool{
			"sms":   false,
			"email": false,
		},
	}
	if req.UPILink {
		payload["upi_link"] = true
	}
	if req.CustomerPhone != "" || req.CustomerEmail != "" {
		payload["customer"] = map[string]string{
			"name":    req.CustomerName,
			"email":   req.CustomerEmail,
			"contact": req.CustomerPhone,
		}
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("razorpay: failed to marshal payment link payload: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("razorpay: failed to create request: %w", err)
	}

	c.setAuthHeader(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("razorpay: http call failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("razorpay: payment_links API returned HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	var linkResp PaymentLinkResponse
	if err := json.Unmarshal(respBody, &linkResp); err != nil {
		return nil, fmt.Errorf("razorpay: failed to unmarshal link response: %w", err)
	}

	return &linkResp, nil
}

// FetchOrder fetches order details by order ID from GET /v1/orders/{order_id}.
func (c *Client) FetchOrder(ctx context.Context, orderID string) (*OrderResponse, error) {
	if err := c.validateCredentials(); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/orders/%s", c.baseURL, orderID)
	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	c.setAuthHeader(httpReq)
	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("razorpay: fetch order failed with HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	var orderResp OrderResponse
	if err := json.Unmarshal(respBody, &orderResp); err != nil {
		return nil, err
	}

	return &orderResp, nil
}

func (c *Client) setAuthHeader(req *http.Request) {
	auth := fmt.Sprintf("%s:%s", c.keyID, c.keySecret)
	encoded := base64.StdEncoding.EncodeToString([]byte(auth))
	req.Header.Set("Authorization", fmt.Sprintf("Basic %s", encoded))
}
