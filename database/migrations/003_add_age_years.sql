-- Add age_years to user_profiles for BMR-based calorie goal calculation
ALTER TABLE user_profiles ADD COLUMN age_years INT NULL AFTER date_of_birth;
