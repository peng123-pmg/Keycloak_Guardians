ALTER TABLE users
    ADD COLUMN last_sync_source VARCHAR(32) NULL AFTER last_login_at,
    ADD COLUMN last_sync_at TIMESTAMP NULL AFTER last_sync_source,
    ADD COLUMN sync_attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER last_sync_at,
    ADD UNIQUE KEY uk_users_realm_username (realm, username);

