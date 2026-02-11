-- =============================================================================
-- Migration 002: Extend user_activity_log for deactivate, delete_user, save_food
-- Run once after 001. Adds description, target_user_id, and new action types.
-- =============================================================================
USE jmfitnesspal;

-- Add optional columns for richer activity (e.g. "Deactivated user X", "Saved food: Apple")
-- Run each ALTER once; omit if column already exists.
ALTER TABLE user_activity_log ADD COLUMN description VARCHAR(500) NULL AFTER user_name;
ALTER TABLE user_activity_log ADD COLUMN target_user_id INT NULL AFTER description;

-- Extend action_type enum (MySQL: list all values including new ones)
-- If your table was created by 001 or schema, run this once:
ALTER TABLE user_activity_log 
  MODIFY COLUMN action_type ENUM('login', 'logout', 'signup', 'deactivate', 'delete_user', 'save_food') NOT NULL;
