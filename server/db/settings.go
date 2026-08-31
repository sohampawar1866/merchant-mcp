package db

import (
	"context"
	"strconv"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// StoreSetting represents a dynamic runtime configuration or feature flag.
type StoreSetting struct {
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	UpdatedAt   time.Time `json:"updated_at"`
}

var (
	settingsCacheMu sync.RWMutex
	settingsCache   = make(map[string]string)
	cacheExpiry     time.Time
	cacheTTL        = 3 * time.Second // Short TTL ensures sub-second propagation without hammering DB
)

// GetAllStoreSettings retrieves all settings from DB (cached with 3s TTL).
func GetAllStoreSettings(ctx context.Context, pool *pgxpool.Pool) (map[string]string, error) {
	if pool == nil {
		return map[string]string{}, nil
	}

	settingsCacheMu.RLock()
	if time.Now().Before(cacheExpiry) && len(settingsCache) > 0 {
		cachedCopy := make(map[string]string, len(settingsCache))
		for k, v := range settingsCache {
			cachedCopy[k] = v
		}
		settingsCacheMu.RUnlock()
		return cachedCopy, nil
	}
	settingsCacheMu.RUnlock()

	settingsCacheMu.Lock()
	defer settingsCacheMu.Unlock()

	// Double check
	if time.Now().Before(cacheExpiry) && len(settingsCache) > 0 {
		cachedCopy := make(map[string]string, len(settingsCache))
		for k, v := range settingsCache {
			cachedCopy[k] = v
		}
		return cachedCopy, nil
	}

	rows, err := pool.Query(ctx, `SELECT key, value FROM store_settings;`)
	if err != nil {
		return settingsCache, err
	}
	defer rows.Close()

	newMap := make(map[string]string)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err == nil {
			newMap[k] = v
		}
	}

	settingsCache = newMap
	cacheExpiry = time.Now().Add(cacheTTL)

	cachedCopy := make(map[string]string, len(settingsCache))
	for k, v := range settingsCache {
		cachedCopy[k] = v
	}
	return cachedCopy, nil
}

// GetSettingBool dynamically retrieves a boolean feature flag from store_settings.
func GetSettingBool(ctx context.Context, pool *pgxpool.Pool, key string, fallback bool) bool {
	settings, err := GetAllStoreSettings(ctx, pool)
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

// GetSettingInt dynamically retrieves an integer configuration from store_settings.
func GetSettingInt(ctx context.Context, pool *pgxpool.Pool, key string, fallback int) int {
	settings, err := GetAllStoreSettings(ctx, pool)
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

// GetSettingString dynamically retrieves a string configuration from store_settings.
func GetSettingString(ctx context.Context, pool *pgxpool.Pool, key string, fallback string) string {
	settings, err := GetAllStoreSettings(ctx, pool)
	if err != nil || len(settings) == 0 {
		return fallback
	}

	valStr, ok := settings[key]
	if !ok {
		return fallback
	}
	return valStr
}

// UpdateStoreSetting updates a setting key and invalidates the local in-memory cache.
func UpdateStoreSetting(ctx context.Context, pool *pgxpool.Pool, key, value string) error {
	if pool == nil {
		return nil
	}

	_, err := pool.Exec(ctx, `
		INSERT INTO store_settings (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
	`, key, value)

	if err == nil {
		settingsCacheMu.Lock()
		cacheExpiry = time.Time{} // Invalidate immediately
		settingsCacheMu.Unlock()
	}

	return err
}
