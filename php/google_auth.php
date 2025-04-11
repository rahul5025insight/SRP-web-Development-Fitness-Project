<?php
// Start session
session_start();

// Include database connection file
require_once 'db_config.php';

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = array(
    'success' => false,
    'message' => '',
    'redirect' => ''
);

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the ID token from the POST request
    $id_token = $_POST['id_token'] ?? '';
    
    if (empty($id_token)) {
        $response['message'] = 'Invalid token.';
        echo json_encode($response);
        exit;
    }
    
    try {
        // Here you need to validate the ID token with Google
        // In a production environment, you should use Google's Client API library
        // This is a simplified example
        
        // Decode JWT Token (simplified for example)
        $tokenParts = explode('.', $id_token);
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $userData = json_decode($payload, true);
        
        // Extract user information from token payload
        $google_id = $userData['sub'] ?? '';
        $email = $userData['email'] ?? '';
        $name = $userData['name'] ?? '';
        $picture = $userData['picture'] ?? '';
        
        if (empty($google_id) || empty($email)) {
            throw new Exception('Invalid token data.');
        }
        
        // Connect to database
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Check if user already exists in our database
        $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE google_id = ? OR email = ?");
        $stmt->bind_param("ss", $google_id, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // User exists, update their information if needed
            $user = $result->fetch_assoc();
            
            // Update Google ID if not set
            if (empty($user['google_id'])) {
                $updateStmt = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $updateStmt->bind_param("si", $google_id, $user['id']);
                $updateStmt->execute();
                $updateStmt->close();
            }
            
            // Create session for existing user
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in'] = true;
        } else {
            // User doesn't exist, create new account
            $stmt = $conn->prepare("INSERT INTO users (google_id, name, email, profile_picture, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("ssss", $google_id, $name, $email, $picture);
            $stmt->execute();
            
            // Get the new user ID
            $userId = $conn->insert_id;
            
            // Create session for new user
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['logged_in'] = true;
        }
        
        // Close statement and connection
        $stmt->close();
        $conn->close();
        
        // Set success response
        $response['success'] = true;
        $response['message'] = 'Google login successful!';
        $response['redirect'] = 'dashboard.php';
        
    } catch (Exception $e) {
        $response['message'] = 'An error occurred. Please try again later.';
        // Log the error for debugging (not visible to user)
        error_log('Google Auth error: ' . $e->getMessage());
    }
} else {
    // Not a POST request
    $response['message'] = 'Invalid request method.';
}

// Return JSON response
echo json_encode($response);
?> 