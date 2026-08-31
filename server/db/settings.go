package db

import (
	"context"
	"strconv"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DefaultDemoMerchantID is the constant UUID for Demo Store 1
const DefaultDemoMerchantID = "00000000-0000-0000-0000-000000000001"

// StoreSetting represents a dynamic runtime configuration or feature flag.
type StoreSetting struct {
	MerchantID  string    `json:"merchant_id"`
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	UpdatedAt   time.Time `json:"updated_at"`
}

var (
	settingsCacheMu sync.RWMutex
	// merchantID -> (key -> value)
	merchantSettingsCache = make(map[string]map[string]string)
	merchantCacheExpiry   = make(map[string]time.Time)
	cacheTTL              = 3 * time.Second
)

// GetAllMerchantStoreSettings retrieves all settings for a specific merchant from DB (cached with 3s TTL).
func GetAllMerchantStoreSettings(ctx context.Context, pool *pgxpool.Pool, merchantID string) (map[string]string, error) {
	if pool == nil {
		return map[string]string{}, nil
	}
	if merchantID == "" {
		merchantID = DefaultDemoMerchantID
	}

	settingsCacheMu.RLock()
	if exp, ok := merchantCacheExpiry[merchantID]; ok && time.Now().Before(exp) {
		if cache, ok := merchantSettingsCache[merchantID]; ok && len(cache) > 0 {
			cachedCopy := make(map[string]string, len(cache))
			for k, v := range cache {
				cachedCopy[k] = v
			}
			settingsCacheMu.RUnlock()
			return cachedCopy, nil
		}
	}
	settingsCacheMu.RUnlock()

	settingsCacheMu.Lock()
	defer settingsCacheMu.Unlock()

	// Double check inside write lock
	if exp, ok := merchantCacheExpiry[merchantID]; ok && time.Now().Before(exp) {
		if cache, ok := merchantSettingsCache[merchantID]; ok && len(cache) > 0 {
			cachedCopy := make(map[string]string, len(cache))
			for k, v := range cache {
				cachedCopy[k] = v
			}
			return cachedCopy, nil
		}
	}

	rows, err := pool.Query(ctx, `SELECT key, value FROM store_settings WHERE merchant_id = $1;`, merchantID)
	if err != nil {
		return map[string]string{}, err
	}
	defer rows.Close()

	newMap := make(map[string]string)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err == nil {
			newMap[k] = v
		}
	}

	merchantSettingsCache[merchantID] = newMap
	merchantCacheExpiry[merchantID] = time.Now().Add(cacheTTL)

	cachedCopy := make(map[string]string, len(newMap))
	for k, v := range newMap {
		cachedCopy[k] = v
	}
	return cachedCopy, nil
}

// GetMerchantSettingBool dynamically retrieves a boolean setting for a merchant.
func GetMerchantSettingBool(ctx context.Context, pool *pgxpool.Pool, merchantID, key string, fallback bool) bool {
	settings, err := GetAllMerchantStoreSettings(ctx, pool, merchantID)
	if err != nil || len(settings) == 0 {
		return fallback
	}

	valStr, ok := settings[key]
	if !ok {
		return fallback
	}

	parsed, err := strconv.ParseBool(valStr)
	if err != nil {
		return fallback
	}
	return parsed
}

// GetMerchantSettingInt dynamically retrieves an integer setting for a merchant.
func GetMerchantSettingInt(ctx context.Context, pool *pgxpool.Pool, merchantID, key string, fallback int) int {
	settings, err := GetAllMerchantStoreSettings(ctx, pool, merchantID)
	if err != nil || len(settings) == 0 {
		return fallback
	}

	valStr, ok := settings[key]
	if !ok {
		return fallback
	}

	parsed, err := strconv.Atoi(valStr)
	if err != nil {
		return fallback
	}
	return parsed
}

// GetMerchantSettingString dynamically retrieves a string setting for a merchant.
func GetMerchantSettingString(ctx context.Context, pool *pgxpool.Pool, merchantID, key, fallback string) string {
	settings, err := GetAllMerchantStoreSettings(ctx, pool, merchantID)
	if err != nil || len(settings) == 0 {
		return fallback
	}

	valStr, ok := settings[key]
	if !ok {
		return fallback
	}
	return valStr
}

// UpdateMerchantStoreSetting updates a setting for a merchant and invalidates cache.
func UpdateMerchantStoreSetting(ctx context.Context, pool *pgxpool.Pool, merchantID, key, value string) error {
	if pool == nil {
		return nil
	}
	if merchantID == "" {
		merchantID = DefaultDemoMerchantID
	}

	_, err := pool.Exec(ctx, `
		INSERT INTO store_settings (merchant_id, key, value, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (merchant_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
	`, merchantID, key, value)

	if err == nil {
		settingsCacheMu.Lock()
		delete(merchantCacheExpiry, merchantID)
		settingsCacheMu.Unlock()
	}

	return err
}

// Backwards-compatible legacy helpers defaulting to DefaultDemoMerchantID
func GetAllStoreSettings(ctx context.Context, pool *pgxpool.Pool) (map[string]string, error) {
	return GetAllMerchantStoreSettings(ctx, pool, DefaultDemoMerchantID)
}

func GetSettingBool(ctx context.Context, pool *pgxpool.Pool, key string, fallback bool) bool {
	return GetMerchantSettingBool(ctx, pool, DefaultDemoMerchantID, key, fallback)
}

func GetSettingInt(ctx context.Context, pool *pgxpool.Pool, key string, fallback int) int {
	return GetMerchantSettingInt(ctx, pool, DefaultDemoMerchantID, key, fallback)
}

func GetSettingString(ctx context.Context, pool *pgxpool.Pool, key, fallback string) string {
	return GetMerchantSettingString(ctx, pool, DefaultDemoMerchantID, key, fallback)
}

func UpdateStoreSetting(ctx context.Context, pool *pgxpool.Pool, key, value string) error {
	return UpdateMerchantStoreSetting(ctx, pool, DefaultDemoMerchantID, key, value)
}
