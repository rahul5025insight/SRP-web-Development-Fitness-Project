// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Get the login form element
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // Add submit event listener to the form
    loginForm.addEventListener('submit', function(e) {
        // Prevent the default form submission
        e.preventDefault();
        
        // Get form input values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate form inputs
        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }
        
        // Create form data object to send to the server
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('remember', remember ? '1' : '0');
        
        // Send the login request to the server
        fetch('php/login_process.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard or appropriate page
                window.location.href = data.redirect || 'dashboard.php';
            } else {
                // Show error message
                showError(data.message || 'Login failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred. Please try again later.');
        });
    });
    
    // Function to display error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Hide the error message after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
    
    // Google Sign-In handling
    // This will be called when Google returns credential info
    window.handleGoogleCredential = function(response) {
        // Send the ID token to your server
        const id_token = response.credential;
        
        // Create form data to send to server
        const formData = new FormData();
        formData.append('id_token', id_token);
        
        // Send the token to your server
        fetch('php/google_auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard or appropriate page
                window.location.href = data.redirect || 'dashboard.php';
            } else {
                // Show error message
                showError(data.message || 'Google login failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred during Google sign-in. Please try again later.');
        });
    };
}); 