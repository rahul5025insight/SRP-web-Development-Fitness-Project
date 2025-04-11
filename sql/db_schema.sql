-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fitness_db;

-- Use the fitness database
USE fitness_db;

-- Users table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255), -- Hashed password
    google_id VARCHAR(100), -- For Google Sign-In users
    profile_picture VARCHAR(255), -- URL to profile picture
    remember_token VARCHAR(100), -- For "Remember Me" functionality
    email_verified_at TIMESTAMP NULL, -- For email verification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);

-- User Profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other'),
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    fitness_level ENUM('beginner', 'intermediate', 'advanced'),
    fitness_goal ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_health'),
    activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Workout Plans table
CREATE TABLE IF NOT EXISTS workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    duration INT, -- in minutes
    frequency INT, -- times per week
    is_custom BOOLEAN DEFAULT TRUE, -- Whether it's a custom plan or system-generated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group ENUM('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'),
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    instructions TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workout Plan Exercises (junction table for workout plans and exercises)
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT,
    repetitions INT,
    duration INT, -- in seconds (for timed exercises)
    rest_time INT, -- in seconds
    day_of_week INT, -- 1-7 for Monday-Sunday
    order_in_workout INT, -- Order of exercise in the workout
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_workout_plan (workout_plan_id),
    INDEX idx_exercise (exercise_id)
);

-- Diet Plans table
CREATE TABLE IF NOT EXISTS diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    calories_per_day INT,
    protein_ratio DECIMAL(4,2), -- percentage
    carbs_ratio DECIMAL(4,2), -- percentage
    fat_ratio DECIMAL(4,2), -- percentage
    is_custom BOOLEAN DEFAULT TRUE, -- Whether it's a custom plan or system-generated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diet_plan_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    calories INT,
    protein DECIMAL(6,2), -- in grams
    carbs DECIMAL(6,2), -- in grams
    fat DECIMAL(6,2), -- in grams
    meal_time ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    recipe TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
    INDEX idx_diet_plan (diet_plan_id)
);

-- Progress Tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight DECIMAL(5,2), -- in kg
    body_fat_percentage DECIMAL(4,2),
    chest_measurement DECIMAL(5,2), -- in cm
    waist_measurement DECIMAL(5,2), -- in cm
    hip_measurement DECIMAL(5,2), -- in cm
    arm_measurement DECIMAL(5,2), -- in cm
    thigh_measurement DECIMAL(5,2), -- in cm
    notes TEXT,
    tracking_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tracking_date (tracking_date)
);

-- Workout Logs table
CREATE TABLE IF NOT EXISTS workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workout_plan_id INT,
    workout_date DATE,
    duration INT, -- in minutes
    calories_burned INT,
    notes TEXT,
    rating TINYINT, -- User rating of the workout (1-5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_workout_date (workout_date)
);

-- Exercise Logs (details of each exercise performed)
CREATE TABLE IF NOT EXISTS exercise_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_log_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets_completed INT,
    repetitions DECIMAL(5,2), -- Decimal for partial reps
    weight DECIMAL(6,2), -- in kg
    duration INT, -- in seconds
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_workout_log (workout_log_id)
);

-- Diet Logs table
CREATE TABLE IF NOT EXISTS diet_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE,
    total_calories INT,
    total_protein DECIMAL(6,2), -- in grams
    total_carbs DECIMAL(6,2), -- in grams
    total_fat DECIMAL(6,2), -- in grams
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_log_date (log_date)
);

-- Food Items table
CREATE TABLE IF NOT EXISTS food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calories INT, -- per 100g
    protein DECIMAL(5,2), -- in grams per 100g
    carbs DECIMAL(5,2), -- in grams per 100g
    fat DECIMAL(5,2), -- in grams per 100g
    fiber DECIMAL(5,2), -- in grams per 100g
    sugar DECIMAL(5,2), -- in grams per 100g
    serving_size DECIMAL(6,2), -- in grams
    serving_unit VARCHAR(20), -- e.g., "g", "ml", "piece"
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Diet Log Items (junction table for diet logs and food items)
CREATE TABLE IF NOT EXISTS diet_log_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diet_log_id INT NOT NULL,
    food_item_id INT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    quantity DECIMAL(6,2), -- Number of servings
    calories INT,
    protein DECIMAL(5,2), -- in grams
    carbs DECIMAL(5,2), -- in grams
    fat DECIMAL(5,2), -- in grams
    notes TEXT,
    custom_food_name VARCHAR(100), -- For foods not in the database
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diet_log_id) REFERENCES diet_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL,
    INDEX idx_diet_log (diet_log_id)
); 