
// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const signUpBtn = document.getElementById('signUpBtn');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeBtn = document.querySelector('.close');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is already logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        window.location.href = 'dashboard.html';
    }
}

// Show authentication modal
function showAuthModal() {
    authModal.style.display = 'flex';
}

// Hide authentication modal
function hideAuthModal() {
    authModal.style.display = 'none';
}

// Handle form submission
async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // First try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            // If sign in fails, try to sign up
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password
            });

            if (signUpError) throw signUpError;
            
            alert('Account created successfully! Please check your email for verification.');
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        alert(error.message);
    }
}

// Handle logout
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', checkAuth);
signUpBtn.addEventListener('click', showAuthModal);
closeBtn.addEventListener('click', hideAuthModal);
authForm.addEventListener('submit', handleAuth);
logoutBtn.addEventListener('click', handleLogout);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideAuthModal();
    }
});

// Check Authentication State
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // User is signed in
        console.log('User signed in:', session.user);
    } else if (event === 'SIGNED_OUT') {
        // User is signed out
        console.log('User signed out');
    }
}); 