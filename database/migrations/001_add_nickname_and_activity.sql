-- =============================================================================
-- Migration 001: Add nickname to users + ensure user_activity_log exists
-- Run this once if your database was created before these columns/tables existed.
-- =============================================================================
USE jmfitnesspal;

-- Add nickname to users (safe to run only once; omit if you already have it)
ALTER TABLE users ADD COLUMN nickname VARCHAR(100) NULL DEFAULT NULL AFTER last_name;

-- Create user_activity_log for admin Recent Activity (login/logout/signup)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type ENUM('login', 'logout', 'signup') NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_activity_created (created_at DESC)
);
