// Initialize Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const form = document.getElementById('profileForm');
const sections = document.querySelectorAll('.form-section');
const progressBar = document.getElementById('formProgress');
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');

let currentSection = 0;

// Form Navigation
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (validateCurrentSection()) {
            moveToNextSection();
        }
    });
});

prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        moveToPreviousSection();
    });
});

// Form Validation
function validateCurrentSection() {
    const currentSectionElement = sections[currentSection];
    const inputs = currentSectionElement.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Section Navigation
function moveToNextSection() {
    sections[currentSection].classList.remove('active');
    currentSection++;
    sections[currentSection].classList.add('active');
    updateProgressBar();
}

function moveToPreviousSection() {
    sections[currentSection].classList.remove('active');
    currentSection--;
    sections[currentSection].classList.add('active');
    updateProgressBar();
}

// Progress Bar
function updateProgressBar() {
    const progress = ((currentSection + 1) / sections.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCurrentSection()) {
        return;
    }

    try {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            height: parseInt(formData.get('height')),
            weight: parseInt(formData.get('weight')),
            activity_level: formData.get('activityLevel'),
            goal: formData.get('goal'),
            target_weight: formData.get('targetWeight') ? parseInt(formData.get('targetWeight')) : null,
            workout_preferences: Array.from(formData.getAll('workoutPreferences'))
        };

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Calculate BMR and recommended calories
        const bmr = calculateBMR(userData);
        const recommendedCalories = calculateRecommendedCalories(bmr, userData.activity_level, userData.goal);

        // Add calculated values to user data
        userData.bmr = bmr;
        userData.recommended_calories = recommendedCalories;
        userData.user_id = user.id;

        // Save to Supabase
        const { data, error } = await supabase
            .from('profiles')
            .insert([userData]);

        if (error) throw error;

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
    }
});

// BMR Calculation
function calculateBMR(userData) {
    const { weight, height, age, gender } = userData;
    
    if (gender === 'male') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
}

// Recommended Calories Calculation
function calculateRecommendedCalories(bmr, activityLevel, goal) {
    let activityMultiplier;
    
    switch (activityLevel) {
        case 'sedentary':
            activityMultiplier = 1.2;
            break;
        case 'light':
            activityMultiplier = 1.375;
            break;
        case 'moderate':
            activityMultiplier = 1.55;
            break;
        case 'active':
            activityMultiplier = 1.725;
            break;
        case 'extreme':
            activityMultiplier = 1.9;
            break;
        default:
            activityMultiplier = 1.2;
    }

    let goalMultiplier;
    switch (goal) {
        case 'lose_weight':
            goalMultiplier = 0.8;
            break;
        case 'build_muscle':
            goalMultiplier = 1.2;
            break;
        case 'maintain':
            goalMultiplier = 1;
            break;
        default:
            goalMultiplier = 1;
    }

    return Math.round(bmr * activityMultiplier * goalMultiplier);
}

// Input Validation
function validateNumberInput(input, min, max) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < min || value > max) {
        input.classList.add('error');
        return false;
    }
    input.classList.remove('error');
    return true;
}

// Add validation listeners
document.getElementById('age').addEventListener('blur', function() {
    validateNumberInput(this, 13, 100);
});

document.getElementById('height').addEventListener('blur', function() {
    validateNumberInput(this, 100, 250);
});

document.getElementById('weight').addEventListener('blur', function() {
    validateNumberInput(this, 30, 300);
});

document.getElementById('targetWeight').addEventListener('blur', function() {
    if (this.value) {
        validateNumberInput(this, 30, 300);
    }
}); 