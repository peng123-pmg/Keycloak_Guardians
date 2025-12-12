ALTER TABLE files
    ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'other' AFTER mime_type,
    ADD INDEX idx_files_category (category);

UPDATE files SET category = COALESCE(NULLIF(category, ''), 'other');
