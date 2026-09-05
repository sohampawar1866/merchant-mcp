-- ==============================================================================
-- SEED SCRIPT: 20 AUTHENTIC INDIAN BRAND MERCHANTS & 80 DIVERSE PRODUCTS
-- Idempotent setup with PGP encrypted secrets & Category whitelists
-- ==============================================================================

-- 1. Insert 20 Indian Brand Merchants

INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'boAt Lifestyle',
    'rzp_test_boat9011',
    pgp_sym_encrypt('rzp_test_secret_boat9011', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('boat_wh_secret_9011', 'agentic_platform_master_passphrase_2026'),
    'active',
    'boat_live_key_9011'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Noise',
    'rzp_test_noise9012',
    pgp_sym_encrypt('rzp_test_secret_noise9012', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('noise_wh_secret_9012', 'agentic_platform_master_passphrase_2026'),
    'active',
    'noise_live_key_9012'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'The Whole Truth Foods',
    'rzp_test_twt9013',
    pgp_sym_encrypt('rzp_test_secret_twt9013', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('twt_wh_secret_9013', 'agentic_platform_master_passphrase_2026'),
    'active',
    'twt_live_key_9013'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'Blue Tokai Coffee Roasters',
    'rzp_test_bluetokai9014',
    pgp_sym_encrypt('rzp_test_secret_bluetokai9014', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('bluetokai_wh_secret_9014', 'agentic_platform_master_passphrase_2026'),
    'active',
    'bluetokai_live_key_9014'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'Sleepy Owl Coffee',
    'rzp_test_sleepyowl9015',
    pgp_sym_encrypt('rzp_test_secret_sleepyowl9015', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('sleepyowl_wh_secret_9015', 'agentic_platform_master_passphrase_2026'),
    'active',
    'sleepyowl_live_key_9015'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'Licious',
    'rzp_test_licious9016',
    pgp_sym_encrypt('rzp_test_secret_licious9016', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('licious_wh_secret_9016', 'agentic_platform_master_passphrase_2026'),
    'active',
    'licious_live_key_9016'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000007',
    'Epigamia',
    'rzp_test_epigamia9017',
    pgp_sym_encrypt('rzp_test_secret_epigamia9017', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('epigamia_wh_secret_9017', 'agentic_platform_master_passphrase_2026'),
    'active',
    'epigamia_live_key_9017'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000008',
    'Mamaearth',
    'rzp_test_mamaearth9018',
    pgp_sym_encrypt('rzp_test_secret_mamaearth9018', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('mamaearth_wh_secret_9018', 'agentic_platform_master_passphrase_2026'),
    'active',
    'mamaearth_live_key_9018'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000009',
    'Sugar Cosmetics',
    'rzp_test_sugar9019',
    pgp_sym_encrypt('rzp_test_secret_sugar9019', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('sugar_wh_secret_9019', 'agentic_platform_master_passphrase_2026'),
    'active',
    'sugar_live_key_9019'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000010',
    'Bombay Shaving Company',
    'rzp_test_bsc9020',
    pgp_sym_encrypt('rzp_test_secret_bsc9020', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('bsc_wh_secret_9020', 'agentic_platform_master_passphrase_2026'),
    'active',
    'bsc_live_key_9020'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000011',
    'FabIndia',
    'rzp_test_fabindia9021',
    pgp_sym_encrypt('rzp_test_secret_fabindia9021', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('fabindia_wh_secret_9021', 'agentic_platform_master_passphrase_2026'),
    'active',
    'fabindia_live_key_9021'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000012',
    'Mokobara',
    'rzp_test_mokobara9022',
    pgp_sym_encrypt('rzp_test_secret_mokobara9022', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('mokobara_wh_secret_9022', 'agentic_platform_master_passphrase_2026'),
    'active',
    'mokobara_live_key_9022'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000013',
    'Portronics',
    'rzp_test_portronics9023',
    pgp_sym_encrypt('rzp_test_secret_portronics9023', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('portronics_wh_secret_9023', 'agentic_platform_master_passphrase_2026'),
    'active',
    'portronics_live_key_9023'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000014',
    'Chaayos',
    'rzp_test_chaayos9024',
    pgp_sym_encrypt('rzp_test_secret_chaayos9024', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('chaayos_wh_secret_9024', 'agentic_platform_master_passphrase_2026'),
    'active',
    'chaayos_live_key_9024'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000015',
    'Haldiram''s',
    'rzp_test_haldirams9025',
    pgp_sym_encrypt('rzp_test_secret_haldirams9025', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('haldirams_wh_secret_9025', 'agentic_platform_master_passphrase_2026'),
    'active',
    'haldirams_live_key_9025'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000016',
    'Cult.fit Essentials',
    'rzp_test_cultfit9026',
    pgp_sym_encrypt('rzp_test_secret_cultfit9026', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('cultfit_wh_secret_9026', 'agentic_platform_master_passphrase_2026'),
    'active',
    'cultfit_live_key_9026'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000017',
    'Paper Boat',
    'rzp_test_paperboat9027',
    pgp_sym_encrypt('rzp_test_secret_paperboat9027', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('paperboat_wh_secret_9027', 'agentic_platform_master_passphrase_2026'),
    'active',
    'paperboat_live_key_9027'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000018',
    'Pharmeasy Essentials',
    'rzp_test_pharmeasy9028',
    pgp_sym_encrypt('rzp_test_secret_pharmeasy9028', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('pharmeasy_wh_secret_9028', 'agentic_platform_master_passphrase_2026'),
    'active',
    'pharmeasy_live_key_9028'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000019',
    'Bira 91 Merchandise',
    'rzp_test_bira919029',
    pgp_sym_encrypt('rzp_test_secret_bira919029', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('bira91_wh_secret_9029', 'agentic_platform_master_passphrase_2026'),
    'active',
    'bira91_live_key_9029'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, status, api_key)
VALUES (
    'a0000000-0000-0000-0000-000000000020',
    'Urban Company Essentials',
    'rzp_test_uc9030',
    pgp_sym_encrypt('rzp_test_secret_uc9030', 'agentic_platform_master_passphrase_2026'),
    pgp_sym_encrypt('uc_wh_secret_9030', 'agentic_platform_master_passphrase_2026'),
    'active',
    'uc_live_key_9030'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    razorpay_key_id = EXCLUDED.razorpay_key_id,
    razorpay_key_secret = EXCLUDED.razorpay_key_secret,
    razorpay_webhook_secret = EXCLUDED.razorpay_webhook_secret,
    api_key = EXCLUDED.api_key;


-- 2. Insert Store Settings for 20 Merchants

INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000001', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000001', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000001', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000001', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000001', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000001', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000002', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000002', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000002', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000002', 'max_negotiation_attempts', '4', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000002', 'max_discount_percent', '25', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000002', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000002', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000003', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000003', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000003', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000003', 'max_negotiation_attempts', '2', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000003', 'max_discount_percent', '15', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000003', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000003', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000004', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000004', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000004', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000004', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000004', 'max_discount_percent', '15', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000004', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000004', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000005', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000005', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000005', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000005', 'max_negotiation_attempts', '4', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000005', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000005', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000005', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000006', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000006', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000006', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000006', 'max_negotiation_attempts', '2', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000006', 'max_discount_percent', '15', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000006', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000006', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000007', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000007', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000007', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000007', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000007', 'max_discount_percent', '18', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000007', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000007', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000008', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000008', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000008', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000008', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000008', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000008', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000008', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000009', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000009', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000009', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000009', 'max_negotiation_attempts', '4', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000009', 'max_discount_percent', '25', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000009', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000009', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000010', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000010', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000010', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000010', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000010', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000010', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000010', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000011', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000011', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000011', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000011', 'max_negotiation_attempts', '2', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000011', 'max_discount_percent', '15', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000011', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000011', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000012', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000012', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000012', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000012', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000012', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000012', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000012', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000013', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000013', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000013', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000013', 'max_negotiation_attempts', '4', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000013', 'max_discount_percent', '25', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000013', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000013', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000014', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000014', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000014', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000014', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000014', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000014', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000014', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000015', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000015', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000015', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000015', 'max_negotiation_attempts', '2', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000015', 'max_discount_percent', '15', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000015', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000015', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000016', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000016', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000016', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000016', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000016', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000016', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000016', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000017', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000017', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000017', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000017', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000017', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000017', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000017', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000018', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000018', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000018', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000018', 'max_negotiation_attempts', '2', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000018', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000018', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000018', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000019', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000019', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000019', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000019', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000019', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000019', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000019', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


INSERT INTO store_settings (merchant_id, key, value, description, category) VALUES
    ('a0000000-0000-0000-0000-000000000020', 'enable_find_and_price', 'true', 'Enable find_and_price composite tool', 'features'),
    ('a0000000-0000-0000-0000-000000000020', 'enable_negotiation', 'true', 'Enable negotiate_offer tool', 'features'),
    ('a0000000-0000-0000-0000-000000000020', 'enable_human_approval', 'false', 'Require human approval', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000020', 'max_negotiation_attempts', '3', 'Max rounds before final offer', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000020', 'max_discount_percent', '20', 'Maximum allowed discount margin', 'guardrails'),
    ('a0000000-0000-0000-0000-000000000020', 'max_tool_calls_per_minute', '60', 'Rate limit ceiling', 'security'),
    ('a0000000-0000-0000-0000-000000000020', 'enable_catalog_cache', 'true', 'Cache product catalog in Redis', 'performance')
ON CONFLICT (merchant_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category;


-- 3. Insert 80 Distinct and Overlapping Products Across All Merchants

INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'boAt Nirvana Ion ANC Wireless Earbuds',
    'Premium 32dB active noise cancelling earbuds with Crystal Bionic Sound, 120-hour monster playback, dual EQ modes, and quad mics with ENx tech.',
    'audio',
    ARRAY['audio', 'earbuds', 'wireless', 'anc', 'bluetooth', 'long-battery'],
    'merchant_edited',
    249900,
    199900,
    60,
    '{"brand": "boAt", "playback_hours": 120, "noise_cancellation": "32dB ANC", "drivers": "10mm dual", "water_resistance": "IPX4"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'boAt Airdopes 141 ANC True Wireless',
    'Everyday budget wireless earbuds with 32dB active noise cancellation, low latency Beast Mode (50ms) for mobile gaming, and 42-hour battery life.',
    'audio',
    ARRAY['audio', 'earbuds', 'wireless', 'anc', 'gaming', 'budget'],
    'merchant_edited',
    149900,
    119900,
    120,
    '{"brand": "boAt", "latency_ms": 50, "battery_hours": 42, "color": "Bold Black"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'boAt Wave Elevate Smartwatch',
    '1.96-inch HD display smartwatch with premium metal finish, functional crown, advanced Bluetooth calling, 100+ sports modes, and SpO2 tracking.',
    'wearables',
    ARRAY['smartwatch', 'wearables', 'fitness', 'bluetooth-calling', 'heart-rate'],
    'merchant_edited',
    229900,
    179900,
    45,
    '{"brand": "boAt", "display_inches": 1.96, "dial_shape": "Square", "battery_days": 7}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'boAt Stone 650 10W Bluetooth Speaker',
    'Rugged IPX5 water-resistant portable bluetooth speaker with 10W stereo sound, punchy subwoofer bass radiator, and 7-hour playback.',
    'audio',
    ARRAY['audio', 'speaker', 'bluetooth', 'bass-heavy', 'waterproof'],
    'merchant_edited',
    199900,
    159900,
    50,
    '{"brand": "boAt", "power_watts": 10, "waterproof_rating": "IPX5", "color": "Navy Blue"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'Noise ColorFit Pulse 3 Smartwatch',
    '1.96-inch curved TFT display smartwatch with Bluetooth calling, 550 nits brightness, 100+ watch faces, smart health monitoring suite, and IP68 water resistance.',
    'wearables',
    ARRAY['wearables', 'smartwatch', 'fitness', 'bluetooth-calling', 'curved-display'],
    'merchant_edited',
    199900,
    149900,
    80,
    '{"brand": "Noise", "display_inches": 1.96, "brightness_nits": 550, "water_resistance": "IP68"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000002',
    'Noise Buds VS104 Truly Wireless Earbuds',
    'Ultra-lightweight TWS earbuds with 45-hour battery playtime, 13mm drivers with Tru Bass technology, Quad Mic ENC, and Instacharge 10min = 200min.',
    'audio',
    ARRAY['audio', 'earbuds', 'wireless', 'budget', 'fast-charging', 'calls'],
    'merchant_edited',
    129900,
    99900,
    110,
    '{"brand": "Noise", "driver_mm": 13, "playtime_hours": 45, "fast_charge": "10min for 200min"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000002',
    'Noise ColorFit Ultra 3 AMOLED Smartwatch',
    'Elite 1.96-inch AMOLED display with Always-On screen, metallic build, functional crown, AI voice assistant integration, and continuous 24/7 heart rate.',
    'wearables',
    ARRAY['wearables', 'smartwatch', 'amoled', 'display', 'premium', 'fitness'],
    'merchant_edited',
    349900,
    289900,
    40,
    '{"brand": "Noise", "display_type": "AMOLED", "body": "Metallic Finish", "always_on": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000002',
    'Noise Pure Pods Open-Ear TWS',
    'AirWave open-ear earphones featuring detachable pure band, 80-hour battery life, 16mm air conduction drivers, and comfortable all-day ergonomic fit.',
    'audio',
    ARRAY['audio', 'earbuds', 'open-ear', 'ergonomic', 'long-battery'],
    'merchant_edited',
    279900,
    229900,
    35,
    '{"brand": "Noise", "type": "Open-Ear", "driver_mm": 16, "playtime_hours": 80}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000003',
    'The Whole Truth Raw Whey Protein Isolate (1kg)',
    '100% pure raw unflavoured whey isolate from grass-fed cows. Zero added sugars, zero artificial sweeteners, zero thickeners. 27g protein per scoop.',
    'health_nutrition',
    ARRAY['health_nutrition', 'protein', 'clean-nutrition', 'fitness', 'preservative-free'],
    'merchant_edited',
    289900,
    249900,
    50,
    '{"brand": "The Whole Truth", "protein_per_serving_g": 27, "weight_kg": 1, "flavours": "Unflavoured Pure"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000003',
    'The Whole Truth Cocoa Cranberry Protein Bar (Box of 6)',
    'Clean protein bar made with only 5 ingredients: dates, cashews, whey protein, cocoa, and dried cranberries. Zero refined sugar, zero preservatives.',
    'packaged_food',
    ARRAY['packaged_food', 'snack', 'protein', 'clean-label', 'healthy-snack'],
    'merchant_edited',
    65000,
    55000,
    95,
    '{"brand": "The Whole Truth", "pack_size": 6, "protein_per_bar_g": 12, "sugar_added": false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000003',
    'The Whole Truth Dark Chocolate Peanut Butter (925g)',
    'Slow-roasted whole peanuts stone ground with artisanal dark chocolate and organic raw jaggery. Zero hydrogenated oil, zero emulsifiers.',
    'packaged_food',
    ARRAY['packaged_food', 'spread', 'peanut-butter', 'organic', 'chocolate'],
    'merchant_edited',
    49900,
    42500,
    70,
    '{"brand": "The Whole Truth", "weight_g": 925, "ingredients": "Peanuts, Dark Chocolate, Jaggery"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000012',
    'a0000000-0000-0000-0000-000000000003',
    'The Whole Truth Sourdough Crackers - Herb & Garlic',
    'Hand-stretched slow-fermented sourdough crackers baked with roasted garlic, Mediterranean rosemary, and extra virgin olive oil.',
    'packaged_food',
    ARRAY['packaged_food', 'snack', 'sourdough', 'crackers', 'baked'],
    'merchant_edited',
    19900,
    17500,
    100,
    '{"brand": "The Whole Truth", "flavour": "Herb & Garlic", "fermentation": "Slow Sourdough"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000013',
    'a0000000-0000-0000-0000-000000000004',
    'Blue Tokai Attikan Estate Dark Roast (250g)',
    'Signature single-origin specialty Arabica from Biligirirangana Hills. Tasting notes of dark chocolate, figs, and roasted almonds.',
    'beverages',
    ARRAY['beverages', 'coffee', 'specialty-coffee', 'dark-roast', 'single-origin'],
    'merchant_edited',
    52000,
    45000,
    85,
    '{"estate": "Attikan Estate", "roast_level": "Dark", "tasting_notes": "Dark Chocolate, Fig, Almond", "grind": "Channi / French Press"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000014',
    'a0000000-0000-0000-0000-000000000004',
    'Blue Tokai Cold Brew Blend Pitcher Bags (Pack of 5)',
    'Coarsely ground specialty Arabica blend packed into breathable brewing filter bags. Steep overnight in water for smooth, low-acid cold brew.',
    'beverages',
    ARRAY['beverages', 'coffee', 'cold-brew', 'artisanal', 'refreshing'],
    'merchant_edited',
    55000,
    47500,
    65,
    '{"pack_count": 5, "yield_liters": 2.5, "acidity": "Low", "roast": "Medium-Dark"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000015',
    'a0000000-0000-0000-0000-000000000004',
    'Blue Tokai Easy Pour Drip Coffee Bags (Assorted 10x)',
    'Single-serve pour-over filter bags loaded with freshly ground specialty coffee. Just anchor over your mug and pour hot water.',
    'beverages',
    ARRAY['beverages', 'coffee', 'pour-over', 'travel-ready', 'specialty-coffee'],
    'merchant_edited',
    45000,
    39000,
    120,
    '{"bags_count": 10, "varieties": "Silver Oak, Vienna Roast, Attikan"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000016',
    'a0000000-0000-0000-0000-000000000004',
    'Blue Tokai Vienna Roast Specialty Beans (500g)',
    'Classic Vienna roast Arabica whole beans with intense cocoa undertones, full body, and syrupy crema for home espresso machines.',
    'beverages',
    ARRAY['beverages', 'coffee', 'espresso', 'whole-beans', 'dark-roast'],
    'merchant_edited',
    89000,
    78000,
    40,
    '{"roast": "Vienna Roast", "weight_g": 500, "bean_type": "100% Arabica"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000017',
    'a0000000-0000-0000-0000-000000000005',
    'Sleepy Owl Cold Brew Pitcher Packs - Dark Roast (Pack of 5)',
    '100% Grade-A Arabica cold brew filter brew bags. Smooth, naturally sweet, chocolatey flavor with zero bitterness. Makes 15 delicious cups.',
    'beverages',
    ARRAY['beverages', 'coffee', 'cold-brew', 'dark-roast', 'easy-brew'],
    'merchant_edited',
    47500,
    39900,
    75,
    '{"brand": "Sleepy Owl", "servings": 15, "flavour": "Original Dark Roast", "brew_time_hrs": 14}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000018',
    'a0000000-0000-0000-0000-000000000005',
    'Sleepy Owl Premium Instant Coffee - Hazelnut (100g)',
    'Microground Soluble Arabica coffee infused with nutty roasted hazelnut aromatics. Dissolves instantly in hot or cold milk with rich froth.',
    'beverages',
    ARRAY['beverages', 'coffee', 'instant-coffee', 'hazelnut', 'caffeine'],
    'merchant_edited',
    39900,
    32900,
    90,
    '{"brand": "Sleepy Owl", "weight_g": 100, "flavour": "Hazelnut", "roast": "Medium"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000019',
    'a0000000-0000-0000-0000-000000000005',
    'Sleepy Owl Enamel Travel Mug (350ml)',
    'Vintage handcrafted steel enamel campfire mug with double-coated durable enamel glaze. Perfect for piping hot coffee or chilled cold brew.',
    'home_kitchen',
    ARRAY['home_kitchen', 'mug', 'coffee-ware', 'travel', 'vintage'],
    'merchant_edited',
    69900,
    54900,
    55,
    '{"brand": "Sleepy Owl", "capacity_ml": 350, "material": "Double-Coated Enamel Steel"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000020',
    'a0000000-0000-0000-0000-000000000005',
    'Sleepy Owl French Vanilla Cold Coffee Cans (Pack of 4)',
    'Ready to drink iced cold brew blended with rich milk and Madagascar French vanilla extract. Refreshingly crisp with 80mg natural caffeine.',
    'beverages',
    ARRAY['beverages', 'coffee', 'rtd', 'cold-coffee', 'vanilla'],
    'merchant_edited',
    50000,
    42000,
    80,
    '{"brand": "Sleepy Owl", "pack_count": 4, "volume_per_can_ml": 250}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000021',
    'a0000000-0000-0000-0000-000000000006',
    'Licious Fresh Chicken Curry Cut (500g)',
    'Tender bone-in chicken pieces from biosecure certified farms, chilled between 0-4°C, antibiotic-residue-free and washed with RO water.',
    'meat_seafood',
    ARRAY['meat_seafood', 'chicken', 'fresh', 'antibiotic-free', 'curry-cut'],
    'merchant_edited',
    18900,
    16500,
    150,
    '{"weight_g": 500, "bone_type": "Bone-in", "temperature": "0-4C Chilled"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000022',
    'a0000000-0000-0000-0000-000000000006',
    'Licious Farm-Fresh Brown Eggs (Pack of 6)',
    'Nutrient-rich brown eggs laid by vegetarian feed hens in stress-free biosecure environments. Cleaned, graded, and UV-sanitized.',
    'meat_seafood',
    ARRAY['meat_seafood', 'eggs', 'fresh', 'protein', 'brown-eggs'],
    'merchant_edited',
    9500,
    8500,
    200,
    '{"count": 6, "yolk_color": "Deep Orange", "packaging": "Bio-degradable Pulp Carton"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000023',
    'a0000000-0000-0000-0000-000000000006',
    'Licious Crispy Panko Prawns (Ready to Cook 200g)',
    'Plump ocean prawns coated in Japanese-style seasoned panko breadcrumbs. Fry or air fry in 4 minutes for restaurant-grade crunch.',
    'meat_seafood',
    ARRAY['meat_seafood', 'prawns', 'ready-to-cook', 'crispy', 'snack'],
    'merchant_edited',
    34900,
    29900,
    45,
    '{"weight_g": 200, "cooking_time_mins": 4, "method": "Deep Fry / Air Fry"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000024',
    'a0000000-0000-0000-0000-000000000006',
    'Licious Kashmiri Chicken Tikka Marinade (450g)',
    'Boneless succulent chicken chunks marinated in traditional Kashmiri red chillies, hung curd, and stone-ground aromatic garam masala.',
    'meat_seafood',
    ARRAY['meat_seafood', 'chicken', 'tikka', 'marinade', 'bbq'],
    'merchant_edited',
    29900,
    25900,
    60,
    '{"spice_level": "Medium Spicy", "marinade": "Kashmiri Spiced Curd", "weight_g": 450}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000025',
    'a0000000-0000-0000-0000-000000000007',
    'Epigamia Greek Yogurt Blueberry (Pack of 4x100g)',
    'Creamy strained Greek yogurt packed with real blueberries and gut-friendly probiotics. 6g protein per cup with zero preservatives.',
    'dairy_fresh',
    ARRAY['dairy_fresh', 'yogurt', 'probiotic', 'high-protein', 'blueberry'],
    'merchant_edited',
    26000,
    22000,
    90,
    '{"brand": "Epigamia", "cups": 4, "protein_per_cup_g": 6, "fruit": "Real Blueberries"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000026',
    'a0000000-0000-0000-0000-000000000007',
    'Epigamia High Protein Milkshake - Chocolate (Pack of 6x200ml)',
    'Delicious lactose-free chocolate milkshake powered with 25g whey protein per bottle. Fortified with essential vitamins and calcium.',
    'dairy_fresh',
    ARRAY['dairy_fresh', 'milkshake', 'protein', 'lactose-free', 'chocolate'],
    'merchant_edited',
    36000,
    30000,
    110,
    '{"brand": "Epigamia", "protein_per_pack_g": 25, "lactose_free": true, "pack_size": 6}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000027',
    'a0000000-0000-0000-0000-000000000007',
    'Epigamia Plant-Based Oat Milk Barista Edition (1L)',
    'Creamy oat beverage crafted for barista latte art and smooth frothing. Unsweetened, dairy-free, nut-free, and rich in dietary beta-glucan.',
    'dairy_fresh',
    ARRAY['dairy_fresh', 'oat-milk', 'vegan', 'dairy-free', 'plant-based'],
    'merchant_edited',
    29000,
    24500,
    70,
    '{"brand": "Epigamia", "volume_liters": 1, "dairy_free": true, "unsweetened": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000028',
    'a0000000-0000-0000-0000-000000000007',
    'Epigamia Artisanal Spiced Curd (400g)',
    'Traditional thick set dahi infused with roasted cumin (jeera), fresh green chillies, and rock salt for wholesome digestive lunches.',
    'dairy_fresh',
    ARRAY['dairy_fresh', 'curd', 'probiotic', 'traditional', 'indian'],
    'merchant_edited',
    8500,
    7500,
    80,
    '{"brand": "Epigamia", "weight_g": 400, "flavour": "Roasted Jeera & Salt"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000029',
    'a0000000-0000-0000-0000-000000000008',
    'Mamaearth Vitamin C Daily Glow Face Serum (30ml)',
    'Brightening facial serum with 10% Vitamin C and 5% Niacinamide to fade dark spots, boost collagen, and deliver radiant illuminated skin.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'serum', 'skincare', 'vitamin-c', 'glow', 'dermatology-tested'],
    'merchant_edited',
    59900,
    49900,
    85,
    '{"brand": "Mamaearth", "actives": "10% Vitamin C + Niacinamide", "volume_ml": 30, "toxin_free": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000030',
    'a0000000-0000-0000-0000-000000000008',
    'Mamaearth Onion Hair Oil with Redensyl (150ml)',
    'Best-selling anti-hair fall oil powered with onion seed extract, Redensyl, castor oil, and almond oil to nourish scalp roots and stimulate regrowth.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'hair-oil', 'anti-hair-fall', 'onion-oil', 'natural'],
    'merchant_edited',
    41900,
    34900,
    100,
    '{"brand": "Mamaearth", "volume_ml": 150, "key_ingredient": "Redensyl + Onion Seed"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000031',
    'a0000000-0000-0000-0000-000000000008',
    'Mamaearth Ubtan Natural Face Wash (100ml)',
    'Gentle daily exfoliating cleanser enriched with turmeric, saffron, and walnut beads to remove stubborn tan and restore radiant complexion.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'face-wash', 'ubtan', 'tan-removal', 'natural'],
    'merchant_edited',
    25900,
    21900,
    140,
    '{"brand": "Mamaearth", "volume_ml": 100, "skin_type": "All Skin Types"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000032',
    'a0000000-0000-0000-0000-000000000008',
    'Mamaearth Ultra Light Indian Sunscreen SPF 50 (80g)',
    'Zero white cast gel sunscreen tailored for Indian tropical weather. Broad spectrum PA+++ protection with turmeric and carrot seed oil.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'sunscreen', 'spf50', 'uv-protection', 'oil-free'],
    'merchant_edited',
    49900,
    41900,
    75,
    '{"spf": 50, "pa_rating": "PA+++", "weight_g": 80, "white_cast": "Zero"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000033',
    'a0000000-0000-0000-0000-000000000009',
    'Sugar Matte As Hell Crayon Lipstick (Cherry Darling)',
    'Ultra-pigmented full-coverage matte crayon lipstick with 12-hour transfer-proof wear and nourishing carnauba wax. Comes with complimentary sharpener.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'lipstick', 'matte', 'makeup', 'long-lasting'],
    'merchant_edited',
    84900,
    69900,
    65,
    '{"brand": "Sugar", "shade": "Cherry Darling (Ruby Red)", "finish": "Matte", "wear_hours": 12}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000034',
    'a0000000-0000-0000-0000-000000000009',
    'Sugar Aquaholic Hyaluronic Acid Face Serum (30ml)',
    'Multi-molecular hyaluronic acid serum with green tea extracts for 72-hour deep skin hydration, soothing plumping effect, and dewy finish.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'serum', 'hyaluronic-acid', 'hydration', 'plump-skin'],
    'merchant_edited',
    69900,
    54900,
    70,
    '{"brand": "Sugar", "actives": "2% Hyaluronic Acid + Green Tea", "volume_ml": 30}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000035',
    'a0000000-0000-0000-0000-000000000009',
    'Sugar Grand Finale Setting Mist Matte (50ml)',
    'Ultra-fine makeup setting spray that locks foundation, blush, and eyeliner for 16 hours while controlling sebum shine and skin oiliness.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'setting-spray', 'matte', 'makeup-fixer', 'oil-control'],
    'merchant_edited',
    69900,
    57900,
    50,
    '{"brand": "Sugar", "finish": "Matte", "hold_hours": 16, "volume_ml": 50}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000036',
    'a0000000-0000-0000-0000-000000000009',
    'Sugar Contour De Force Mini Bronzer',
    'Silky, easy-to-blend micro-powder bronzer that adds natural sun-kissed warmth and chiseled definition to cheekbones and jawline.',
    'beauty_skincare',
    ARRAY['beauty_skincare', 'bronzer', 'contour', 'makeup', 'powder'],
    'merchant_edited',
    44900,
    36900,
    80,
    '{"brand": "Sugar", "shade": "Woody Wonder", "weight_g": 4}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000037',
    'a0000000-0000-0000-0000-000000000010',
    'Bombay Shaving Co. Precision Safety Razor with 10 Blades',
    'Engineered zinc alloy double-edge safety razor for an ultra-smooth barbershop close shave with zero razor burn, ingrown hair, or irritation.',
    'personal_care',
    ARRAY['personal_care', 'razor', 'shaving', 'grooming', 'precision-shave'],
    'merchant_edited',
    149500,
    119500,
    40,
    '{"brand": "Bombay Shaving Company", "material": "Zinc Alloy Chrome", "blades_included": 10}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000038',
    'a0000000-0000-0000-0000-000000000010',
    'Bombay Shaving Co. Charcoal Shaving Foam (200ml)',
    'Activated bamboo charcoal shaving foam with Moroccan argan oil and aloe vera for deep skin detox and smooth glide razor action.',
    'personal_care',
    ARRAY['personal_care', 'shaving-foam', 'charcoal', 'grooming', 'skincare'],
    'merchant_edited',
    29500,
    24500,
    120,
    '{"brand": "Bombay Shaving Company", "volume_ml": 200, "charcoal": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000039',
    'a0000000-0000-0000-0000-000000000010',
    'Bombay Shaving Co. Post Shave Balm - Alcohol Free (100g)',
    'Alcohol-free soothing aftershave balm with witch hazel, vitamin E, and mint to instantly calm skin redness and replenish hydration.',
    'personal_care',
    ARRAY['personal_care', 'after-shave', 'balm', 'soothing', 'alcohol-free'],
    'merchant_edited',
    39500,
    31500,
    85,
    '{"brand": "Bombay Shaving Company", "weight_g": 100, "alcohol_free": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000040',
    'a0000000-0000-0000-0000-000000000010',
    'Bombay Shaving Co. Beard Growth Oil with Cedarwood (30ml)',
    'Premium beard elixir infused with redensyl, cedarwood essential oil, jojoba, and argan oil to repair patchiness and boost beard fullness.',
    'personal_care',
    ARRAY['personal_care', 'beard-oil', 'growth', 'grooming', 'essential-oils'],
    'merchant_edited',
    45000,
    36000,
    90,
    '{"brand": "Bombay Shaving Company", "volume_ml": 30, "fragrance": "Cedarwood"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000041',
    'a0000000-0000-0000-0000-000000000011',
    'FabIndia Hand Block Print Pure Cotton Kurta (Men)',
    'Authentic Jaipur Sanganeri block-printed pure breathable cotton long kurta with mandarin collar, side pockets, and wooden buttons.',
    'mens_apparel',
    ARRAY['mens_apparel', 'kurta', 'cotton', 'ethnic-wear', 'block-print'],
    'merchant_edited',
    189000,
    165000,
    35,
    '{"brand": "FabIndia", "fabric": "100% Pure Cotton", "craft": "Hand Block Print", "color": "Indigo Blue"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000042',
    'a0000000-0000-0000-0000-000000000011',
    'FabIndia Chanderi Silk Embroidered Dupatta',
    'Exquisite handwoven Chanderi silk dupatta with delicate golden zari border detailing and floral kantha hand-embroidery.',
    'womens_apparel',
    ARRAY['womens_apparel', 'dupatta', 'silk', 'ethnic', 'handwoven', 'zari'],
    'merchant_edited',
    249000,
    219000,
    25,
    '{"brand": "FabIndia", "fabric": "Chanderi Silk Blend", "length_meters": 2.5, "color": "Crimson Gold"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000043',
    'a0000000-0000-0000-0000-000000000011',
    'FabIndia Handwoven Cotton Table Runner (6 Seater)',
    'Artisanal handloom woven ribbed cotton dining table runner with fringe tassels to elevate dining and festive table settings.',
    'home_decor',
    ARRAY['home_decor', 'table-runner', 'handloom', 'dining', 'cotton'],
    'merchant_edited',
    89000,
    75000,
    50,
    '{"dimensions": "14x72 inches", "material": "Handloom Cotton", "color": "Natural Ecru"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000044',
    'a0000000-0000-0000-0000-000000000011',
    'FabIndia Brass Dhuna Dhoop Burner',
    'Hand-carved traditional solid brass incense dhuna holder with wooden carved handle for aromatic loban and sambrani dhoop rituals.',
    'home_decor',
    ARRAY['home_decor', 'brass', 'dhoop', 'artisanal', 'pooja-essentials'],
    'merchant_edited',
    129000,
    109000,
    30,
    '{"material": "Solid Brass with Rosewood Handle", "weight_g": 480}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000045',
    'a0000000-0000-0000-0000-000000000012',
    'The Cabin Luggage Polycarbonate Suitcase (55cm)',
    'Indestructible German Makrolon polycarbonate hard-shell carry-on trolley bag with Hinomoto 360-degree whisper-silent wheels and TSA combination lock.',
    'luggage_bags',
    ARRAY['luggage_bags', 'suitcase', 'trolley', 'travel-ready', 'polycarbonate', 'cabin-luggage'],
    'merchant_edited',
    699900,
    599900,
    30,
    '{"brand": "Mokobara", "size": "Cabin 55cm", "wheels": "Japanese Hinomoto 360", "shell": "German Polycarbonate", "lock": "TSA Approved"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000046',
    'a0000000-0000-0000-0000-000000000012',
    'The Backpack - Water Resistant Commuter Bag (22L)',
    'Minimalist urban laptop commuter backpack with padded 16-inch laptop compartment, hidden passport pocket, and luggage trolley sleeve pass-through.',
    'luggage_bags',
    ARRAY['luggage_bags', 'backpack', 'laptop-bag', 'water-resistant', 'commuter'],
    'merchant_edited',
    449900,
    379900,
    45,
    '{"capacity_liters": 22, "laptop_size_inches": 16, "water_resistant": true, "color": "Slate Grey"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000047',
    'a0000000-0000-0000-0000-000000000012',
    'The Transit Duffle - Weekend Gym & Travel Bag',
    'High-durability coated nylon weekender duffel with dedicated ventilated shoe tunnel, detachable shoulder strap, and waterproof toiletries compartment.',
    'luggage_bags',
    ARRAY['luggage_bags', 'duffle', 'gym-bag', 'travel', 'weekend-bag'],
    'merchant_edited',
    399900,
    339900,
    35,
    '{"capacity_liters": 35, "shoe_compartment": true, "color": "Midnight Blue"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000048',
    'a0000000-0000-0000-0000-000000000012',
    'The Packing Cubes Set (Pack of 4)',
    'Ultra-lightweight compression packing organizers with see-through breathable mesh tops, double zippers, and water-repellent ripstop nylon.',
    'luggage_bags',
    ARRAY['luggage_bags', 'packing-cubes', 'organizers', 'travel-ready', 'compression'],
    'merchant_edited',
    199900,
    159900,
    60,
    '{"count": 4, "material": "Ripstop Nylon", "zippers": "YKK Double"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000049',
    'a0000000-0000-0000-0000-000000000013',
    'Portronics Harmonics Twins 28 TWS Earbuds',
    'Budget-friendly true wireless earbuds with Bluetooth 5.3, 50-hour total playback, feather-light 4g earbuds, voice assistant support, and Type-C fast charging.',
    'audio',
    ARRAY['audio', 'earbuds', 'wireless', 'budget', 'fast-charging'],
    'merchant_edited',
    99900,
    79900,
    140,
    '{"brand": "Portronics", "bluetooth": "5.3", "battery_hours": 50, "color": "White"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000050',
    'a0000000-0000-0000-0000-000000000013',
    'Portronics Adapto 65W GaN Fast Charger 3-Port',
    'Next-gen Gallium Nitride 65W charger with dual USB-C Power Delivery and one USB-A Quick Charge. Charges MacBook, iPhone, and Android at full speed.',
    'mobile_accessories',
    ARRAY['mobile_accessories', 'charger', 'fast-charging', 'type-c', 'gan', 'laptop-charger'],
    'merchant_edited',
    179900,
    139900,
    75,
    '{"brand": "Portronics", "watts": 65, "ports": "2x Type-C, 1x Type-A", "gan_tech": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000051',
    'a0000000-0000-0000-0000-000000000013',
    'Portronics Toad 31 Ergonomic Wireless Mouse',
    'Silent click 2.4GHz wireless optical mouse with ergonomic contour palm grip, 1600 adjustable DPI, and auto-sleep power saving mode.',
    'computing',
    ARRAY['computing', 'mouse', 'wireless', 'silent-click', 'ergonomic'],
    'merchant_edited',
    49900,
    39900,
    110,
    '{"brand": "Portronics", "dpi": "800-1200-1600", "connectivity": "2.4GHz Dongle", "clicks": "Silent"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000052',
    'a0000000-0000-0000-0000-000000000013',
    'Portronics Power Plate 7 Power Strip with USB-C',
    'Heavy duty 6 AC power socket extension cord with 4 USB charging ports (including 20W PD Type-C), 2500W spike surge protector, and 3-meter cord.',
    'computing',
    ARRAY['computing', 'mobile_accessories', 'power-strip', 'surge-protector', 'usb-c'],
    'merchant_edited',
    129900,
    99900,
    60,
    '{"sockets": "6 AC + 4 USB", "surge_protection": true, "cable_length_m": 3}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000053',
    'a0000000-0000-0000-0000-000000000014',
    'Chaayos Special Chai Masala (100g Tin)',
    'Authentic fragrant blend of ginger (sonth), green cardamom, cinnamon, cloves, nutmeg, and black pepper. Adds traditional kadak aroma to homemade tea.',
    'beverages',
    ARRAY['beverages', 'chai', 'tea', 'masala', 'traditional', 'indian-flavours'],
    'merchant_edited',
    24900,
    20900,
    100,
    '{"brand": "Chaayos", "ingredients": "Cardamom, Dry Ginger, Cinnamon, Clove, Black Pepper", "weight_g": 100}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000054',
    'a0000000-0000-0000-0000-000000000014',
    'Chaayos Roasted Crispy Bhakarwadi (150g)',
    'Guilt-free non-fried roasted pinwheel bhakarwadi stuffed with sweet, spicy, and tangy coconut-sesame seed masala filling.',
    'packaged_food',
    ARRAY['packaged_food', 'snack', 'bhakarwadi', 'roasted', 'chai-time', 'indian-flavours'],
    'merchant_edited',
    14900,
    12500,
    130,
    '{"brand": "Chaayos", "oil": "100% Roasted Non-Fried", "weight_g": 150}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000055',
    'a0000000-0000-0000-0000-000000000014',
    'Chaayos Premium Darjeeling Whole Leaf Green Tea (100g)',
    'First flush whole leaf unfermented green tea sourced directly from Darjeeling misty organic estates. High in EGCG antioxidants.',
    'beverages',
    ARRAY['beverages', 'tea', 'green-tea', 'antioxidants', 'whole-leaf', 'darjeeling'],
    'merchant_edited',
    39900,
    33900,
    60,
    '{"origin": "Darjeeling", "leaf": "Whole Leaf", "antioxidants": "High EGCG", "weight_g": 100}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000056',
    'a0000000-0000-0000-0000-000000000014',
    'Chaayos Methi Mathri Snack Pack (200g)',
    'Crispy traditional flaky wheat mathri seasoned with sun-dried fenugreek leaves (kasoori methi) and ajwain seeds. Classic Indian tea-time partner.',
    'packaged_food',
    ARRAY['packaged_food', 'snack', 'mathri', 'tea-time', 'crispy'],
    'merchant_edited',
    16900,
    13900,
    90,
    '{"brand": "Chaayos", "flavour": "Methi Ajwain", "weight_g": 200}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000057',
    'a0000000-0000-0000-0000-000000000015',
    'Haldiram''s Nagpur All-In-One Mixture Namkeen (1kg)',
    'India''s legendary crunchy snack blend consisting of chickpea flour noodles, green moong, cashews, raisins, cornflakes, and secret spice blend.',
    'packaged_food',
    ARRAY['packaged_food', 'namkeen', 'snack', 'haldirams', 'indian-flavours', 'crispy'],
    'merchant_edited',
    27500,
    24000,
    200,
    '{"brand": "Haldiram''s", "weight_g": 1000, "shelf_life_months": 6}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000058',
    'a0000000-0000-0000-0000-000000000015',
    'Haldiram''s Tin Gulab Jamun (1kg Canister)',
    'Soft, melt-in-the-mouth cottage cheese and condensed milk dumplings soaked in saffron, rose water, and green cardamom sugar syrup.',
    'packaged_food',
    ARRAY['packaged_food', 'sweets', 'gulab-jamun', 'dessert', 'festive'],
    'merchant_edited',
    26000,
    23000,
    120,
    '{"brand": "Haldiram''s", "weight_g": 1000, "pieces_approx": 16}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000059',
    'a0000000-0000-0000-0000-000000000015',
    'Haldiram''s Kaju Katli Gift Box (500g)',
    'Royal Indian silver foil coated cashew fudge diamonds made with premium Goan cashews and pure desi ghee. Zero adulteration.',
    'packaged_food',
    ARRAY['packaged_food', 'sweets', 'kaju-katli', 'cashew', 'gifting'],
    'merchant_edited',
    55000,
    49000,
    80,
    '{"brand": "Haldiram''s", "cashew_percentage": "65%", "weight_g": 500}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000060',
    'a0000000-0000-0000-0000-000000000015',
    'Haldiram''s Moong Dal Namkeen (400g)',
    'Golden fried yellow lentils lightly salted to perfection. Crunchy, protein-dense classic Indian savoury companion.',
    'packaged_food',
    ARRAY['packaged_food', 'namkeen', 'snack', 'moong-dal', 'crispy'],
    'merchant_edited',
    13000,
    11500,
    180,
    '{"brand": "Haldiram''s", "weight_g": 400, "oil": "Refined Cottonseed"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000061',
    'a0000000-0000-0000-0000-000000000016',
    'Cultsport Raw Whey Protein Concentrate 80% (1kg Unflavoured)',
    'Instantized whey protein concentrate delivering 24g protein and 5.5g BCAAs per 30g serving. Tested for zero banned substances.',
    'health_nutrition',
    ARRAY['health_nutrition', 'protein', 'whey', 'fitness', 'bodybuilding', 'clean-nutrition'],
    'merchant_edited',
    219900,
    184900,
    60,
    '{"brand": "Cultsport", "protein_g": 24, "bcaa_g": 5.5, "weight_kg": 1}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000062',
    'a0000000-0000-0000-0000-000000000016',
    'Cultsport Anti-Skid TPE Yoga Mat (6mm)',
    'Dual-layer eco-friendly TPE exercise mat with body alignment line markings, superior non-slip grip, and high density joint cushioning.',
    'fitness_sports',
    ARRAY['fitness_sports', 'yoga', 'gym', 'workout', 'anti-skid', 'wellness'],
    'merchant_edited',
    129900,
    99900,
    70,
    '{"thickness_mm": 6, "material": "Eco-friendly TPE", "size_cm": "183x61"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000063',
    'a0000000-0000-0000-0000-000000000016',
    'Cultsport Adjustable Dumbbells Set (2x 5kg)',
    'Rubber-coated cast iron hexagonal dumbbell pair with knurled ergonomic chrome handles for home gym strength and hypertrophy training.',
    'fitness_sports',
    ARRAY['fitness_sports', 'dumbbells', 'gym', 'strength-training', 'home-workout'],
    'merchant_edited',
    249900,
    209900,
    35,
    '{"total_weight_kg": 10, "shape": "Hexagonal Anti-Roll", "coating": "Rubber Encased"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000064',
    'a0000000-0000-0000-0000-000000000016',
    'Cultsport High-Speed Skipping Rope with Ball Bearings',
    '360-degree precision ball bearing speed jump rope with tangle-free steel wire cable and non-slip aluminium knurled handles for intense cardio.',
    'fitness_sports',
    ARRAY['fitness_sports', 'skipping-rope', 'cardio', 'endurance', 'crossfit'],
    'merchant_edited',
    39900,
    29900,
    100,
    '{"bearing": "360 Ball Bearing", "cable": "PVC Coated Steel Wire", "adjustable": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000065',
    'a0000000-0000-0000-0000-000000000017',
    'Paper Boat Aamras Mango Juice (Pack of 6x250ml)',
    'Thick, nostalgic Indian mango juice made from luscious Alphonso and Totapuri pulp. Zero GMO, zero synthetic colors, 100% summer bliss.',
    'beverages',
    ARRAY['beverages', 'juice', 'mango', 'aamras', 'nostalgia', 'natural'],
    'merchant_edited',
    21000,
    17500,
    140,
    '{"brand": "Paper Boat", "fruit_pulp_percent": 45, "pack_size": 6}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000066',
    'a0000000-0000-0000-0000-000000000017',
    'Paper Boat Jaljeera Traditional Drink (Pack of 6x250ml)',
    'Digestive cooling cooler crafted with cumin, fresh mint, ginger, and black salt. Relieves acidity and hydrates instantly on hot afternoons.',
    'beverages',
    ARRAY['beverages', 'jaljeera', 'digestive', 'traditional', 'indian'],
    'merchant_edited',
    21000,
    17500,
    110,
    '{"brand": "Paper Boat", "flavour": "Tangy Mint & Cumin", "volume_ml": 250}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000067',
    'a0000000-0000-0000-0000-000000000017',
    'Paper Boat Peanut Chikki Crushed Jaggery (Pack of 12)',
    'Crunchy brittle chikki bar made with crushed golden peanuts and clarified pure sugarcane jaggery. Traditional winter energy booster.',
    'packaged_food',
    ARRAY['packaged_food', 'snack', 'chikki', 'jaggery', 'peanut', 'healthy'],
    'merchant_edited',
    24000,
    19900,
    130,
    '{"brand": "Paper Boat", "sweetener": "100% Jaggery", "pack_count": 12}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000068',
    'a0000000-0000-0000-0000-000000000017',
    'Paper Boat Anar Pomegranate Juice (Pack of 6x250ml)',
    'Antioxidant-dense ruby red pomegranate juice with a dash of spice. Heart-healthy and refreshing without artificial flavours.',
    'beverages',
    ARRAY['beverages', 'juice', 'pomegranate', 'healthy', 'refreshing'],
    'merchant_edited',
    27000,
    22500,
    90,
    '{"brand": "Paper Boat", "pack_count": 6, "volume_ml": 250}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000069',
    'a0000000-0000-0000-0000-000000000018',
    'Pharmeasy Multivitamin with Minerals & Ginseng (60 Tablets)',
    'Complete daily micronutrient formula with 23 essential vitamins, minerals, and Korean Ginseng to combat fatigue and boost daily stamina.',
    'pharmacy_wellness',
    ARRAY['pharmacy_wellness', 'multivitamin', 'supplements', 'immunity', 'wellness', 'vitamins'],
    'merchant_edited',
    49900,
    39900,
    120,
    '{"brand": "Pharmeasy", "tablets_count": 60, "ingredients": "23 Vitamins + Ginseng"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000070',
    'a0000000-0000-0000-0000-000000000018',
    'Pharmeasy Smart Digital Blood Pressure Monitor',
    'Clinical grade automatic upper arm BP monitor with large backlit LCD display, irregular heartbeat indicator, and dual user memory storage.',
    'pharmacy_wellness',
    ARRAY['pharmacy_wellness', 'bp-monitor', 'blood-pressure', 'health-device', 'medical'],
    'merchant_edited',
    159900,
    129900,
    40,
    '{"brand": "Pharmeasy", "display": "Backlit LCD", "cuff_size": "22-42cm", "memory": "2x99 readings"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000071',
    'a0000000-0000-0000-0000-000000000018',
    'Pharmeasy Fish Oil Omega-3 1000mg (60 Softgels)',
    'Purified molecularly distilled deep-sea fish oil containing 180mg EPA and 120mg DHA. Promotes cardiovascular health and joint lubrication.',
    'health_nutrition',
    ARRAY['health_nutrition', 'fish-oil', 'omega-3', 'heart-health', 'supplements'],
    'merchant_edited',
    59900,
    47900,
    85,
    '{"brand": "Pharmeasy", "softgels_count": 60, "epa_mg": 180, "dha_mg": 120}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000072',
    'a0000000-0000-0000-0000-000000000018',
    'Pharmeasy Digital Flexible Tip Thermometer',
    'Fast 10-second oral/armpit fever reading thermometer with waterproof flexible rubber tip, high fever alarm buzzer, and last reading recall.',
    'pharmacy_wellness',
    ARRAY['pharmacy_wellness', 'thermometer', 'fever', 'first-aid', 'health-device'],
    'merchant_edited',
    24900,
    19900,
    150,
    '{"reading_time_secs": 10, "tip": "Flexible Waterproof", "accuracy": "+/- 0.1C"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000073',
    'a0000000-0000-0000-0000-000000000019',
    'Bira 91 Monkey Graphic Oversized T-Shirt (100% Cotton)',
    'Streetwear heavyweight 240 GSM bio-washed French terry t-shirt featuring vibrant screen-printed Bira 91 signature monkey crest artwork.',
    'mens_apparel',
    ARRAY['mens_apparel', 't-shirt', 'streetwear', 'cotton', 'oversized'],
    'merchant_edited',
    119900,
    94900,
    60,
    '{"brand": "Bira 91", "gsm": 240, "fabric": "100% Bio-Washed Cotton", "fit": "Oversized Drop Shoulder"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000074',
    'a0000000-0000-0000-0000-000000000019',
    'Bira 91 Craft Beer Tasting Glasses (Set of 4)',
    'Lead-free crystal clear stemmed craft beer glasses shaped to concentrate hop aromatics and sustain fluffy white froth head.',
    'home_kitchen',
    ARRAY['home_kitchen', 'glassware', 'barware', 'craft-beer', 'party'],
    'merchant_edited',
    89900,
    72000,
    50,
    '{"count": 4, "material": "Lead-Free Crystalline Glass", "capacity_ml": 380}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000075',
    'a0000000-0000-0000-0000-000000000019',
    'Bira 91 Heavy Duty Stainless Steel Bottle Opener',
    'Ergonomic matte black bar blade speed opener made from laser-cut 304 food-grade stainless steel with magnetic cap catcher.',
    'home_kitchen',
    ARRAY['home_kitchen', 'bottle-opener', 'barware', 'stainless-steel'],
    'merchant_edited',
    34900,
    27900,
    110,
    '{"material": "304 Stainless Steel", "finish": "Matte Powder Coated"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000076',
    'a0000000-0000-0000-0000-000000000019',
    'Bira 91 Insulated Cooler Bag for Cans (12-pack)',
    'Thermal leakproof travel cooler bag lined with 8mm EPE insulation foam that maintains drinks ice cold for up to 12 hours on road trips.',
    'luggage_bags',
    ARRAY['luggage_bags', 'cooler-bag', 'travel', 'insulated', 'outdoor'],
    'merchant_edited',
    149900,
    119900,
    40,
    '{"capacity_cans": 12, "ice_retention_hrs": 12, "waterproof_liner": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000077',
    'a0000000-0000-0000-0000-000000000020',
    'Native M2 Water Purifier with 10-Stage RO+UV',
    'Zero maintenance smart home RO+UV alkaline water purifier with 2-year filter replacement guarantee and real-time TDS monitoring app.',
    'home_kitchen',
    ARRAY['home_kitchen', 'purifier', 'water-purifier', 'ro-uv', 'smart-home', 'clean-water'],
    'merchant_edited',
    1499900,
    1299900,
    20,
    '{"brand": "Urban Company", "stages": "10-Stage RO+UV+Copper", "warranty_years": 2, "tank_liters": 8}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000078',
    'a0000000-0000-0000-0000-000000000020',
    'Urban Company Complete Home Deep Cleaning Kit (5-Piece)',
    'Professional grade home cleaning arsenal including citrus bathroom descaler, glass shine spray, grease remover, and heavy-duty sponge pads.',
    'home_kitchen',
    ARRAY['home_kitchen', 'cleaner', 'deep-cleaning', 'home-care', 'disinfectant'],
    'merchant_edited',
    119900,
    94900,
    80,
    '{"kit_items": 5, "chemical_grade": "Eco-Friendly Biodegradable"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000079',
    'a0000000-0000-0000-0000-000000000020',
    'Urban Company Plant-Powered Floor Cleaner Citrus (2L)',
    'Pet-safe and baby-safe natural floor disinfectant cleaner infused with eucalyptus, pine, and orange peel oils. Kills 99.9% germs.',
    'home_kitchen',
    ARRAY['home_kitchen', 'cleaner', 'pet-safe', 'citrus', 'eco-friendly'],
    'merchant_edited',
    44900,
    36900,
    100,
    '{"volume_liters": 2, "germ_kill": "99.9%", "safe_for": "Pets and Babies"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


INSERT INTO products (id, merchant_id, name, description, category, tags, tags_source, base_price, floor_price, stock, attributes)
VALUES (
    'b0000000-0000-0000-0000-000000000080',
    'a0000000-0000-0000-0000-000000000020',
    'Urban Company Antimicrobial Kitchen Microfiber Towels (Pack of 6)',
    'Super absorbent 400 GSM dual-sided lint-free microfiber kitchen wiping towels with silver-ion antibacterial treatment against odor.',
    'home_kitchen',
    ARRAY['home_kitchen', 'towel', 'microfiber', 'kitchen-care', 'lint-free'],
    'merchant_edited',
    39900,
    29900,
    90,
    '{"count": 6, "gsm": 400, "antimicrobial": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    base_price = EXCLUDED.base_price,
    floor_price = EXCLUDED.floor_price,
    stock = EXCLUDED.stock,
    attributes = EXCLUDED.attributes;


-- 4. Enable All Product Categories for Autonomous Agent Wallets
UPDATE agent_wallets 
SET whitelisted_categories = ARRAY['*']
WHERE agent_id = 'claude-buyer-01';
