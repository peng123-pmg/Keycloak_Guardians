CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(256) NOT NULL,
    content TEXT NULL,
    link_url VARCHAR(512) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'UNREAD',
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notifications_user_status (user_id, status),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS search_audit (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    user_id BIGINT UNSIGNED NULL,
    keyword VARCHAR(256) NOT NULL,
    filter JSON NULL,
    result_count INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_search_audit_user (user_id),
    CONSTRAINT fk_search_audit_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trash_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    deleted_by BIGINT UNSIGNED NULL,
    original_category VARCHAR(64) NULL,
    delete_reason VARCHAR(255) NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_trash_file (file_id),
    CONSTRAINT fk_trash_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_trash_deleted_by FOREIGN KEY (deleted_by) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backup_jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(128) NOT NULL,
    schedule VARCHAR(64) NOT NULL,
    scope VARCHAR(32) NOT NULL,
    retention_days INT UNSIGNED NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    last_run_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_backup_jobs_user (user_id),
    CONSTRAINT fk_backup_jobs_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    user_id BIGINT UNSIGNED NOT NULL,
    scope VARCHAR(32) NOT NULL,
    plan_id BIGINT UNSIGNED NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retention_days INT UNSIGNED NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    location VARCHAR(256) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_backups_user_status (user_id, status),
    CONSTRAINT fk_backups_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_backups_plan FOREIGN KEY (plan_id) REFERENCES `backup_jobs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backup_notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    backup_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    channel VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_backup_notifications_user (user_id),
    CONSTRAINT fk_backup_notifications_backup FOREIGN KEY (backup_id) REFERENCES `backups`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_backup_notifications_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_versions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    version_number INT UNSIGNED NOT NULL,
    size_bytes BIGINT UNSIGNED NULL,
    checksum VARCHAR(128) NULL,
    diff_pointer VARCHAR(256) NULL,
    remark VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_file_version (file_id, version_number),
    CONSTRAINT fk_file_versions_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_file_versions_user FOREIGN KEY (created_by) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    group_id BIGINT UNSIGNED NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    due_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tasks_group_status (group_id, status),
    CONSTRAINT fk_tasks_group FOREIGN KEY (group_id) REFERENCES `groups`(`id`) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_assignments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'RESPONSIBLE',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_assignment (task_id, user_id, role),
    CONSTRAINT fk_task_assignments_task FOREIGN KEY (task_id) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_task_assignments_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NULL,
    attempt SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    note VARCHAR(255) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_submissions_task_user (task_id, user_id),
    CONSTRAINT fk_submissions_task FOREIGN KEY (task_id) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submission_reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    submission_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(32) NOT NULL,
    reason TEXT NULL,
    reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_submission_reviews_submission (submission_id),
    CONSTRAINT fk_submission_reviews_submission FOREIGN KEY (submission_id) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_submission_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_favorites_user_file (user_id, file_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    realm VARCHAR(64) NOT NULL DEFAULT 'guardians',
    name VARCHAR(64) NOT NULL,
    color VARCHAR(16) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tags_realm_name (realm, name),
    CONSTRAINT fk_tags_creator FOREIGN KEY (created_by) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_file_tag (file_id, tag_id),
    CONSTRAINT fk_file_tags_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_file_tags_tag FOREIGN KEY (tag_id) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sharing_links (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    share_token VARCHAR(128) NOT NULL,
    access_level VARCHAR(32) NOT NULL DEFAULT 'READ',
    password_hash VARCHAR(255) NULL,
    max_downloads INT UNSIGNED NULL,
    expire_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sharing_links_token (share_token),
    CONSTRAINT fk_sharing_links_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_sharing_links_creator FOREIGN KEY (created_by) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_shares (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    from_user_id BIGINT UNSIGNED NOT NULL,
    target_user_id BIGINT UNSIGNED NULL,
    target_group_id BIGINT UNSIGNED NULL,
    permission VARCHAR(32) NOT NULL DEFAULT 'READ',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_file_shares_file FOREIGN KEY (file_id) REFERENCES `files`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_file_shares_from_user FOREIGN KEY (from_user_id) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT fk_file_shares_target_user FOREIGN KEY (target_user_id) REFERENCES `users`(`id`) ON DELETE SET NULL,
    CONSTRAINT fk_file_shares_target_group FOREIGN KEY (target_group_id) REFERENCES `groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
