// DOM Elements for Macro Summary (Keep)
const dailyCaloriesElement = document.getElementById('dailyCalories');
const proteinTargetElement = document.getElementById('proteinTarget');
const carbsTargetElement = document.getElementById('carbsTarget');
const fatsTargetElement = document.getElementById('fatsTarget');

// DOM Elements for User Profile Display (New)
const profileNameElement = document.getElementById('profileName');
const profileAgeElement = document.getElementById('profileAge');
const profileGenderElement = document.getElementById('profileGender');
const profileHeightElement = document.getElementById('profileHeight');
const profileWeightElement = document.getElementById('profileWeight');

// DOM Elements for Meal Logging Modal and Food Log (Keep)
const logMealModal = document.getElementById('logMealModal');
const logMealForm = document.getElementById('logMealForm');
const foodLogBody = document.getElementById('foodLogBody');
const totalCaloriesElement = document.getElementById('totalCalories');
const totalProteinElement = document.getElementById('totalProtein');
const totalCarbsElement = document.getElementById('totalCarbs');
const totalFatsElement = document.getElementById('totalFats');
const logoutBtn = document.getElementById('logoutBtn'); // Keep if you have logout functionality


function calculateAndDisplayMacros(profile) {
    // 1. Convert weight to kg
    let weightKg = parseFloat(profile.weight);
    if (profile.weightUnit === 'lbs') weightKg *= 0.453592;

    // 2. Convert height to cm
    let heightCm = parseFloat(profile.height);
    if (profile.heightUnit === 'inches') heightCm *= 2.54;
    else if (profile.heightUnit === 'feet') heightCm *= 30.48;

    const age = parseInt(profile.age, 10);
    const s = profile.gender.toLowerCase() === 'male' ? 5 : -161;

    // 3. BMR & maintenance
    const BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
    const activityMap = { '0': 1.4, '1': 1.6, '2': 1.7, '3': 1.8, '4': 2 };
    const actFactor = activityMap[profile.activity] || 1.5;
    const maintenance = BMR * actFactor;

    // 4. Macro ratios (start balanced 40/30/30)
    const carbRatio = 0.4, protRatio = 0.3, fatRatio = 0.3;
    const cal = Math.round(maintenance);
    const carbsG = Math.round(carbRatio * cal / 4);
    const protG = Math.round(protRatio * cal / 4);
    const fatG = Math.round(fatRatio * cal / 9);

    // 5. Update the DOM
    dailyCaloriesElement.textContent = `${cal} kcal`;
    carbsTargetElement.textContent = `${carbsG} g`;
    proteinTargetElement.textContent = `${protG} g`;
    fatsTargetElement.textContent = `${fatG} g`;
}

// --- Function to Load and Display Profile Data from localStorage ---
function loadAndDisplayProfile() {
    console.log("Attempting to load profile data from localStorage...");
    const profileDataString = localStorage.getItem('userProfile');

    console.log('Data retrieved from localStorage:', profileDataString);

    if (profileDataString) {
        try {
            const profileData = JSON.parse(profileDataString);
            console.log('Successfully parsed profile data:', profileData);

            // Update the profile summary elements
            // Check if the element exists AND the data exists before updating
            if (profileNameElement && profileData.name) {
                profileNameElement.textContent = profileData.name;
                console.log("Updated profileNameElement with:", profileData.name);
            } else {
                console.warn("Profile name element not found or data missing.");
            }

            if (profileAgeElement && profileData.age) {
                profileAgeElement.textContent = profileData.age;
                console.log("Updated profileAgeElement with:", profileData.age);
            } else {
                console.warn("Profile age element not found or data missing.");
            }

            if (profileGenderElement && profileData.gender) {
                // Capitalize the first letter for display
                const displayGender = profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1);
                profileGenderElement.textContent = displayGender;
                console.log("Updated profileGenderElement with:", displayGender);
            } else {
                console.warn("Profile gender element not found or data missing.");
            }

            if (profileHeightElement && profileData.height && profileData.heightUnit) {
                profileHeightElement.textContent = `${profileData.height} ${profileData.heightUnit}`;
                console.log("Updated profileHeightElement with:", `${profileData.height} ${profileData.heightUnit}`);
            } else {
                console.warn("Profile height element not found or data missing.");
            }

            if (profileWeightElement && profileData.weight && profileData.weightUnit) {
                profileWeightElement.textContent = `${profileData.weight} ${profileData.weightUnit}`;
                console.log("Updated profileWeightElement with:", `${profileData.weight} ${profileData.weightUnit}`);
            } else {
                console.warn("Profile weight element not found or data missing.");
            }
        } catch (error) {
            console.error('Error parsing profile data from localStorage:', error);
            // Handle potential errors with localStorage data
        }
    } else {
        console.log('No profile data found in localStorage. User may need to complete profile setup.');
        // Optionally redirect to profile setup page
        window.location.href = 'profile-setup.html';
    }
}

// --- Existing Functions (Keep if needed for other features) ---

// Initialize Diet Page (Modified to call loadAndDisplayProfile)
async function initDietPage() {
    console.log("Initializing Diet Page...");
    // Load and display profile data from localStorage first
    loadAndDisplayProfile();

    // You can keep your Supabase authentication and data fetching logic here
    // if you are using it for other features like fetching meal plans or food logs.
    // Example:
    // if (supabase) { // Check if Supabase client was initialized
    //     try {
    //         const { data: { user } } = await supabase.auth.getUser();
    //         if (!user) {
    //             window.location.href = 'index.html'; // Redirect if not authenticated
    //             return;
    //         }
    //         // Fetch user profile from Supabase (if you have one)
    //         const { data: profile, error: profileError } = await supabase
    //             .from('profiles')
    //             .select('*')
    //             .eq('user_id', user.id)
    //             .single();
    //         if (profileError) throw profileError;
    //         console.log("Fetched Supabase profile:", profile);
    //         // Use Supabase profile data for calculations/display if preferred
    //         // updateMacroTargets(profile);
    //         // generateMealPlan(profile);
    //         // loadFoodLog(user.id);
    //     } catch (error) {
    //         console.error('Error initializing diet page (Supabase):', error);
    //         // alert('Error loading diet plan. Please try again.');
    //     }
    // } else {
    //     console.warn('Supabase client not configured or initialized. Skipping Supabase operations.');
    // }


    // If you are not using Supabase for profile/macro calculation,
    // you might need to implement logic here to calculate macros based on localStorage data.
    // For this example, the macro targets will remain '-- kcal' unless calculated.
}

// Calculate and Update Macro Targets (Keep if you have calculation logic)
// function updateMacroTargets(profile) { ... }

// Generate Meal Plan (Keep if you have meal plan generation logic)
// function generateMealPlan(profile) { ... }

// Load Food Log (Keep if you are using Supabase for food logging)
// async function loadFoodLog(userId) { ... }

// Update Food Log Table (Keep if you are using Supabase for food logging)
// function updateFoodLogTable(foodLog) { ... }

// Calculate Totals (Keep if you are using Supabase for food logging)
// function calculateTotals(foodLog) { ... }

// Log Meal (Keep if you are using Supabase for food logging)
// async function logMeal(mealData) { ... }

// Delete Food Entry (Keep if you are using Supabase for food logging)
// async function deleteFoodEntry(entryId) { ... }

// Event Listeners (Keep if needed for modal, logging, logout)
// Ensure elements exist before adding listeners


document.addEventListener('DOMContentLoaded', initDietPage);
// -----------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------
async function initDietPage() {
    loadAndDisplayProfile();
    const profile = JSON.parse(localStorage.getItem('userProfile'));
    if (profile) calculateAndDisplayMacros(profile);

    // …then your existing Supabase or logging logic
}

// ↓↓↓ START: Meal‑Log Functionality ↓↓↓
document.addEventListener('DOMContentLoaded', () => {
    const logButtons = document.querySelectorAll('.log-meal-btn');
    const modal = document.getElementById('mealModal');
    const closeBtn = document.getElementById('closeModal');
    const mealForm = document.getElementById('mealForm');
    const logList = document.getElementById('logList');
    const totalCalEl = document.getElementById('totalCalories');

    let meals = [];

    // 1. Open modal
    logButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('mealType').value = btn.dataset.meal;
            modal.classList.remove('hidden');
        });
    });

    // Assuming logMealForm and close button exist within the modal
    const closeButton = logMealModal.querySelector('.close'); // Use querySelector for robustness
    if (closeButton) {
         closeButton.addEventListener('click', () => {
             logMealModal.style.display = 'none';
         });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === logMealModal) {
            logMealModal.style.display = 'none';
        }
    });
});

// 2. Close modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
});

// logMealForm.addEventListener('submit', async (e) => { ... }); // Keep if logging

// if (logoutBtn) { // Check if logout button exists
//     logoutBtn.addEventListener('click', async () => { ... }); // Keep if logout
// }


// Initialize diet page when loaded
document.addEventListener('DOMContentLoaded', initDietPage);