CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    keycloak_user_id VARCHAR(64) NOT NULL,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    username VARCHAR(128) NOT NULL,
    email VARCHAR(255) NULL,
    display_name VARCHAR(255) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    total_storage_quota BIGINT UNSIGNED NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_keycloak_id (keycloak_user_id),
    INDEX idx_users_realm (realm),
    INDEX idx_users_email (email),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS storage_usage_daily (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    usage_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    file_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    stat_date DATE NOT NULL,
    recalculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_storage_user_date (user_id, stat_date),
    INDEX idx_storage_stat_date (stat_date),
    INDEX idx_storage_realm (realm),
    CONSTRAINT fk_storage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

