<?php
/**
 * Database Configuration
 * 
 * This file contains the database connection settings.
 * Update these values according to your MySQL configuration.
 */

// Database credentials
define('DB_HOST', 'localhost');     // Database host
define('DB_NAME', 'fitness_db');    // Database name
define('DB_USER', 'db_username');   // Database username
define('DB_PASS', 'db_password');   // Database password

// Database charset
define('DB_CHARSET', 'utf8mb4');

// Define connection constants for PDO if needed
define('DB_DSN', 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET);
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

/**
 * Helper function to get PDO connection
 * 
 * @return PDO Database connection
 */
function getDbConnection() {
    try {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, DB_OPTIONS);
        return $pdo;
    } catch (PDOException $e) {
        // Log error and terminate
        error_log('Database Connection Error: ' . $e->getMessage());
        die('Database connection failed. Please try again later.');
    }
}
?> 