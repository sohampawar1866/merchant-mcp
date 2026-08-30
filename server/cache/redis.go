package cache

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache manages Redis operations for idempotency and rate limiting with an in-memory fallback.
type Cache struct {
	client      *redis.Client
	memStore    map[string]string
	memCounters map[string]int
	memMu       sync.RWMutex
}

// NewCache initializes a new Redis client connection or falls back to in-memory mode.
func NewCache(redisURL string) (*Cache, error) {
	c := &Cache{
		memStore:    make(map[string]string),
		memCounters: make(map[string]int),
	}

	if redisURL == "" {
		log.Println("cache: REDIS_URL not configured, running with in-memory cache")
		return c, nil
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("cache: failed to parse REDIS_URL (%s): %v, falling back to in-memory", redisURL, err)
		return c, nil
	}

	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("cache: unable to connect to Redis at %s: %v, falling back to in-memory", redisURL, err)
		return c, nil
	}

	c.client = client
	log.Println("cache: Redis connection established successfully")
	return c, nil
}

// SetIdempotencyKey stores an order ID or order JSON associated with an idempotency key.
func (c *Cache) SetIdempotencyKey(ctx context.Context, key string, orderPayload string, ttl time.Duration) error {
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}

	redisKey := fmt.Sprintf("idempotency:checkout:%s", key)

	if c.client != nil {
		err := c.client.Set(ctx, redisKey, orderPayload, ttl).Err()
		if err != nil {
			log.Printf("cache: redis Set error for key %s: %v", redisKey, err)
		}
	}

	c.memMu.Lock()
	defer c.memMu.Unlock()
	c.memStore[redisKey] = orderPayload
	return nil
}

// GetIdempotencyKey retrieves cached order payload for a given idempotency key.
func (c *Cache) GetIdempotencyKey(ctx context.Context, key string) (string, error) {
	redisKey := fmt.Sprintf("idempotency:checkout:%s", key)

	if c.client != nil {
		val, err := c.client.Get(ctx, redisKey).Result()
		if err == nil {
			return val, nil
		}
		if err != redis.Nil {
			log.Printf("cache: redis Get error for key %s: %v", redisKey, err)
		}
	}

	c.memMu.RLock()
	defer c.memMu.RUnlock()
	if val, ok := c.memStore[redisKey]; ok {
		return val, nil
	}

	return "", nil
}

// AllowToolCall checks and increments a fixed-window rate limiter per session ID.
func (c *Cache) AllowToolCall(ctx context.Context, sessionID string, maxPerMinute int) (bool, int, error) {
	if maxPerMinute <= 0 {
		maxPerMinute = 30
	}

	minuteBucket := time.Now().Unix() / 60
	rateKey := fmt.Sprintf("ratelimit:%s:%d", sessionID, minuteBucket)

	if c.client != nil {
		pipe := c.client.TxPipeline()
		incrCmd := pipe.Incr(ctx, rateKey)
		pipe.Expire(ctx, rateKey, 120*time.Second)
		_, err := pipe.Exec(ctx)
		if err == nil {
			count := int(incrCmd.Val())
			return count <= maxPerMinute, count, nil
		}
		log.Printf("cache: redis rate limit exec failed: %v, using in-memory fallback", err)
	}

	c.memMu.Lock()
	defer c.memMu.Unlock()
	c.memCounters[rateKey]++
	count := c.memCounters[rateKey]
	return count <= maxPerMinute, count, nil
}
