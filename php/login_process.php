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
    // Get the form data
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']) && $_POST['remember'] === '1';
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
        echo json_encode($response);
        exit;
    }
    
    // Validate password
    if (empty($password)) {
        $response['message'] = 'Please enter your password.';
        echo json_encode($response);
        exit;
    }
    
    try {
        // Connect to database
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Prepare SQL statement to prevent SQL injection
        $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            // User found, verify password
            $user = $result->fetch_assoc();
            
            // Verify the password using password_verify
            if (password_verify($password, $user['password'])) {
                // Password is correct, create session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['logged_in'] = true;
                
                // Set remember me cookie if requested
                if ($remember) {
                    // Generate a secure token
                    $token = bin2hex(random_bytes(32));
                    
                    // Store token in database
                    $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                    $stmt->bind_param("si", $token, $user['id']);
                    $stmt->execute();
                    
                    // Set cookie for 30 days
                    setcookie('remember_token', $token, time() + 30 * 24 * 60 * 60, '/', '', true, true);
                }
                
                // Set success response
                $response['success'] = true;
                $response['message'] = 'Login successful!';
                $response['redirect'] = 'dashboard.php';
            } else {
                // Password is incorrect
                $response['message'] = 'Invalid email or password.';
            }
        } else {
            // User not found
            $response['message'] = 'Invalid email or password.';
        }
        
        // Close statement and connection
        $stmt->close();
        $conn->close();
        
    } catch (Exception $e) {
        $response['message'] = 'An error occurred. Please try again later.';
        // Log the error for debugging (not visible to user)
        error_log('Login error: ' . $e->getMessage());
    }
} else {
    // Not a POST request
    $response['message'] = 'Invalid request method.';
}

// Return JSON response
echo json_encode($response);
?> 