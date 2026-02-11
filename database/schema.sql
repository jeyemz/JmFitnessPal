-- =============================================================================
-- JmFitnessPal - Calorie Tracking System Database Schema
-- MySQL Database Schema
-- =============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS jmfitnesspal;
USE jmfitnesspal;

-- =============================================================================
-- AUTHENTICATION & USER MANAGEMENT TABLES
-- =============================================================================

-- Roles table for user role management (Admin, User, etc.)
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table for authentication (Login/Signup)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100) NULL,
    role_id INT NOT NULL DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_token_expires TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- User sessions table for managing active sessions
CREATE TABLE user_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- USER PROFILE & SETTINGS TABLES
-- =============================================================================

-- User profiles table for additional user information
CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    profile_picture_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User daily calorie/macro goals
CREATE TABLE user_goals (
    goal_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_type ENUM('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle') NOT NULL,
    daily_calorie_goal INT NOT NULL,
    protein_goal_g INT,
    carbs_goal_g INT,
    fat_goal_g INT,
    fiber_goal_g INT,
    sugar_limit_g INT,
    sodium_limit_mg INT,
    water_goal_ml INT DEFAULT 2000,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Weight tracking history
CREATE TABLE weight_history (
    weight_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    recorded_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, recorded_date)
);

-- =============================================================================
-- FOOD DATABASE TABLES
-- =============================================================================

-- Food categories
CREATE TABLE food_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    parent_category_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES food_categories(category_id) ON DELETE SET NULL
);

-- Food items database
CREATE TABLE foods (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    food_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    category_id INT,
    barcode VARCHAR(50),
    serving_size DECIMAL(10,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories_per_serving DECIMAL(10,2) NOT NULL,
    protein_g DECIMAL(10,2) DEFAULT 0,
    carbohydrates_g DECIMAL(10,2) DEFAULT 0,
    fat_g DECIMAL(10,2) DEFAULT 0,
    fiber_g DECIMAL(10,2) DEFAULT 0,
    sugar_g DECIMAL(10,2) DEFAULT 0,
    sodium_mg DECIMAL(10,2) DEFAULT 0,
    cholesterol_mg DECIMAL(10,2) DEFAULT 0,
    saturated_fat_g DECIMAL(10,2) DEFAULT 0,
    trans_fat_g DECIMAL(10,2) DEFAULT 0,
    potassium_mg DECIMAL(10,2) DEFAULT 0,
    vitamin_a_mcg DECIMAL(10,2) DEFAULT 0,
    vitamin_c_mg DECIMAL(10,2) DEFAULT 0,
    calcium_mg DECIMAL(10,2) DEFAULT 0,
    iron_mg DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(500),
    source ENUM('system', 'user', 'api', 'ai_scanned') DEFAULT 'system',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    created_by INT,
    verified_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES food_categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_food_name (food_name),
    INDEX idx_barcode (barcode)
);

-- User's custom/favorite foods
CREATE TABLE user_custom_foods (
    custom_food_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    custom_name VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_food (user_id, food_id)
);

-- =============================================================================
-- MEAL LOGGING TABLES
-- =============================================================================

-- Meal types (Breakfast, Lunch, Dinner, Snacks)
CREATE TABLE meal_types (
    meal_type_id INT PRIMARY KEY AUTO_INCREMENT,
    meal_type_name VARCHAR(50) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    default_time TIME,
    icon_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily food logs
CREATE TABLE food_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    meal_type_id INT NOT NULL,
    log_date DATE NOT NULL,
    log_time TIME,
    servings DECIMAL(5,2) NOT NULL DEFAULT 1,
    calories_consumed DECIMAL(10,2) NOT NULL,
    protein_consumed DECIMAL(10,2),
    carbs_consumed DECIMAL(10,2),
    fat_consumed DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(meal_type_id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_log_date (log_date)
);

-- Daily summary (cached calculations for performance)
CREATE TABLE daily_summaries (
    summary_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    summary_date DATE NOT NULL,
    total_calories DECIMAL(10,2) DEFAULT 0,
    total_protein_g DECIMAL(10,2) DEFAULT 0,
    total_carbs_g DECIMAL(10,2) DEFAULT 0,
    total_fat_g DECIMAL(10,2) DEFAULT 0,
    total_fiber_g DECIMAL(10,2) DEFAULT 0,
    total_sugar_g DECIMAL(10,2) DEFAULT 0,
    total_sodium_mg DECIMAL(10,2) DEFAULT 0,
    calorie_goal INT,
    goal_percentage DECIMAL(5,2),
    meals_logged INT DEFAULT 0,
    water_intake_ml INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, summary_date)
);

-- Water intake tracking
CREATE TABLE water_logs (
    water_log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    amount_ml INT NOT NULL,
    log_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, log_date)
);

-- =============================================================================
-- AI FOOD SCANNING TABLES
-- =============================================================================

-- AI scan history for food recognition
CREATE TABLE ai_scan_logs (
    scan_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(500),
    scan_type ENUM('image', 'barcode', 'text') NOT NULL,
    detected_food_name VARCHAR(255),
    matched_food_id INT,
    confidence_score DECIMAL(5,4),
    raw_response JSON,
    status ENUM('success', 'failed', 'pending_review', 'manual_override') DEFAULT 'success',
    processing_time_ms INT,
    was_added_to_log BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (matched_food_id) REFERENCES foods(food_id) ON DELETE SET NULL,
    INDEX idx_user_scans (user_id, created_at),
    INDEX idx_scan_status (status)
);

-- =============================================================================
-- USER ACTIVITY LOG (login, logout, signup for admin Recent Activity)
-- =============================================================================
CREATE TABLE user_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type ENUM('login', 'logout', 'signup') NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_activity_created (created_at DESC)
);

-- =============================================================================
-- ADMIN MANAGEMENT TABLES
-- =============================================================================

-- Admin activity logs for audit trail
CREATE TABLE admin_activity_logs (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('create', 'update', 'delete', 'approve', 'reject', 'suspend', 'restore', 'login', 'logout', 'other') NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    description TEXT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin_actions (admin_id, created_at),
    INDEX idx_action_type (action_type)
);

-- System notifications for admins
CREATE TABLE system_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role_id INT,
    target_user_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Support tickets/queue
CREATE TABLE support_tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assigned_admin_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('bug_report', 'feature_request', 'account_issue', 'food_database', 'billing', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'pending_user', 'resolved', 'closed') DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- =============================================================================
-- ANALYTICS & REPORTING TABLES
-- =============================================================================

-- Platform analytics (for admin dashboard)
CREATE TABLE platform_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    analytics_date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_food_logs INT DEFAULT 0,
    total_ai_scans INT DEFAULT 0,
    successful_ai_scans INT DEFAULT 0,
    avg_scan_confidence DECIMAL(5,4),
    total_foods_added INT DEFAULT 0,
    total_foods_pending INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User engagement metrics
CREATE TABLE user_engagement (
    engagement_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    engagement_date DATE NOT NULL,
    login_count INT DEFAULT 0,
    food_logs_count INT DEFAULT 0,
    ai_scans_count INT DEFAULT 0,
    session_duration_minutes INT DEFAULT 0,
    features_used JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, engagement_date)
);

-- =============================================================================
-- INSERT DEFAULT DATA
-- =============================================================================

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'System administrator with full access'),
('user', 'Regular user with standard access');

-- Insert default meal types
INSERT INTO meal_types (meal_type_name, display_order, default_time, icon_name) VALUES
('Breakfast', 1, '08:00:00', 'sunrise'),
('Lunch', 2, '12:00:00', 'sun'),
('Dinner', 3, '18:00:00', 'moon'),
('Snacks', 4, NULL, 'cookie');

-- Insert default food categories
INSERT INTO food_categories (category_name, description) VALUES
('Fruits', 'Fresh and dried fruits'),
('Vegetables', 'Fresh and cooked vegetables'),
('Grains & Cereals', 'Bread, rice, pasta, and cereals'),
('Protein', 'Meat, fish, poultry, eggs, and legumes'),
('Dairy', 'Milk, cheese, yogurt, and dairy products'),
('Beverages', 'Drinks and beverages'),
('Snacks', 'Chips, nuts, and snack foods'),
('Desserts', 'Sweets, cakes, and desserts'),
('Fast Food', 'Restaurant and fast food items'),
('Condiments', 'Sauces, dressings, and seasonings');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_food_logs_user_meal_date ON food_logs(user_id, meal_type_id, log_date);
CREATE INDEX idx_foods_category_status ON foods(category_id, status, is_active);
CREATE INDEX idx_ai_scans_date_status ON ai_scan_logs(created_at, status);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for user dashboard data
CREATE VIEW vw_user_daily_progress AS
SELECT 
    u.user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    COALESCE(ds.summary_date, CURDATE()) AS date,
    COALESCE(ds.total_calories, 0) AS calories_consumed,
    COALESCE(ug.daily_calorie_goal, 2000) AS calorie_goal,
    COALESCE(ds.total_protein_g, 0) AS protein_consumed,
    COALESCE(ug.protein_goal_g, 50) AS protein_goal,
    COALESCE(ds.total_carbs_g, 0) AS carbs_consumed,
    COALESCE(ug.carbs_goal_g, 250) AS carbs_goal,
    COALESCE(ds.total_fat_g, 0) AS fat_consumed,
    COALESCE(ug.fat_goal_g, 65) AS fat_goal,
    ds.meals_logged,
    ds.water_intake_ml
FROM users u
LEFT JOIN daily_summaries ds ON u.user_id = ds.user_id AND ds.summary_date = CURDATE()
LEFT JOIN user_goals ug ON u.user_id = ug.user_id AND ug.is_active = TRUE
WHERE u.is_active = TRUE;

-- View for admin user management
CREATE VIEW vw_admin_user_list AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    r.role_name,
    u.is_active,
    u.is_verified,
    u.last_login,
    u.created_at,
    up.current_weight_kg,
    up.activity_level,
    (SELECT COUNT(*) FROM food_logs fl WHERE fl.user_id = u.user_id) AS total_food_logs,
    (SELECT MAX(log_date) FROM food_logs fl WHERE fl.user_id = u.user_id) AS last_activity
FROM users u
JOIN roles r ON u.role_id = r.role_id
LEFT JOIN user_profiles up ON u.user_id = up.user_id;

-- View for food database management
CREATE VIEW vw_food_database AS
SELECT 
    f.food_id,
    f.food_name,
    f.brand_name,
    fc.category_name,
    f.serving_size,
    f.serving_unit,
    f.calories_per_serving,
    f.protein_g,
    f.carbohydrates_g,
    f.fat_g,
    f.source,
    f.status,
    f.is_active,
    CONCAT(creator.first_name, ' ', creator.last_name) AS created_by_name,
    CONCAT(verifier.first_name, ' ', verifier.last_name) AS verified_by_name,
    f.created_at,
    (SELECT COUNT(*) FROM food_logs fl WHERE fl.food_id = f.food_id) AS times_logged
FROM foods f
LEFT JOIN food_categories fc ON f.category_id = fc.category_id
LEFT JOIN users creator ON f.created_by = creator.user_id
LEFT JOIN users verifier ON f.verified_by = verifier.user_id;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
