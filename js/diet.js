// Initialize Supabase (Keep if you are using it for other features like food logging)
// Replace with your actual Supabase URL and Key if you are using Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
// Check if the placeholders are still there before creating the client
const supabase = (supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_KEY')
    ? supabase.createClient(supabaseUrl, supabaseKey)
    : null; // Set to null if not configured

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

    // 3. BMR & maintenance calories
    const BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
    const activityMap = { '0': 1.4, '1': 1.6, '2': 1.7, '3': 1.8, '4': 2 };
    const maintenance = BMR * (activityMap[profile.activity] || 1.5);

    // 4. Macro split 40/30/30
    const cal = Math.round(maintenance);
    const carbsG = Math.round(0.4 * cal / 4);
    const proteinG = Math.round(0.3 * cal / 4);
    const fatsG = Math.round(0.3 * cal / 9);

    // 5. Write to DOM
    document.getElementById('dailyCalories').textContent = `${cal} kcal`;
    document.getElementById('carbsTarget').textContent = `${carbsG} g`;
    document.getElementById('proteinTarget').textContent = `${proteinG} g`;
    document.getElementById('fatsTarget').textContent = `${fatsG} g`;
}

// In your init function, after loadAndDisplayProfile():
const profile = JSON.parse(localStorage.getItem('userProfile'));
if (profile) calculateAndDisplayMacros(profile);

// --- Existing Functions (Keep if needed for other features) ---

// Initialize Diet Page (Modified to call loadAndDisplayProfile)
// -----------------------------------------------------------------------------------------------------------------------------------------------


function calculate() {
    function fix(v, id, n) {
        v[id] = v[id].toFixed(n);
    }

    // local vars based on gender
    if (din.gender == 1) { // male
        var s = 5;
    } else {
        var s = -161;
    }

    dout.BMI = din.weight * 10000 / (din.height * din.height);
    dout.bodyfat = dout.BMI * 1.2 + din.age * 0.23 - din.gender * 10.8 - 5.4;
    dout.leanmass = din.weight * (1 - dout.bodyfat / 100);
    dout.fatmass = din.weight * dout.bodyfat / 100;
    dout.BMR = 10 * din.weight + 6.25 * din.height - 5 * din.age + locals.s[din.gender]; // using Mifflin St Jeor Equation for BMR
    dout.mainteinance = dout.BMR * locals.activity[din.activity];
    dout.goal = dout.mainteinance + din.deficit * locals.diettype[din.diettype];
    dout.carbcal = din.carbratio * dout.goal / 100;
    dout.proteincal = din.proteinratio * dout.goal / 100;
    dout.fatcal = din.fatratio * dout.goal / 100;
    dout.totalcal = dout.goal;
    dout.carbg = dout.carbcal / 4;
    dout.proteing = dout.proteincal / 4;
    dout.fatg = dout.fatcal / 9;
    dout.totalg = dout.carbg + dout.proteing + dout.fatg;

    fix(dout, "BMI", 1);
    fix(dout, "bodyfat", 1);
    fix(dout, "leanmass", 1);
    fix(dout, "fatmass", 1);
    fix(dout, "BMR", 0);
    fix(dout, "mainteinance", 0);
    fix(dout, "goal", 0);
    fix(dout, "carbg", 0);
    fix(dout, "proteing", 0);
    fix(dout, "fatg", 0);
    fix(dout, "totalg", 0);
    fix(dout, "carbcal", 0);
    fix(dout, "proteincal", 0);
    fix(dout, "fatcal", 0);
    fix(dout, "totalcal", 0);
}
// After loadAndDisplayProfile(), in diet.js…

// function calculateAndDisplayMacros(profile) {
//     // 1. Convert weight to kg
//     let weightKg = parseFloat(profile.weight);
//     if (profile.weightUnit === 'lbs') weightKg *= 0.453592;

//     // 2. Convert height to cm
//     let heightCm = parseFloat(profile.height);
//     if (profile.heightUnit === 'inches') heightCm *= 2.54;
//     else if (profile.heightUnit === 'feet') heightCm *= 30.48;

//     const age = parseInt(profile.age, 10);
//     const s = profile.gender.toLowerCase() === 'male' ? 5 : -161;

//     // 3. BMR & maintenance
//     const BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
//     const activityMap = { '0':1.4, '1':1.6, '2':1.7, '3':1.8, '4':2 };
//     const actFactor = activityMap[profile.activity] || 1.5;
//     const maintenance = BMR * actFactor;

//     // 4. Macro ratios (start balanced 40/30/30)
//     const carbRatio = 0.4, protRatio = 0.3, fatRatio = 0.3;
//     const cal = Math.round(maintenance);
//     const carbsG = Math.round(carbRatio * cal / 4);
//     const protG  = Math.round(protRatio * cal / 4);
//     const fatG   = Math.round(fatRatio * cal / 9);

//     // 5. Update the DOM
//     dailyCaloriesElement.textContent = `${cal} kcal`;
//     carbsTargetElement  .textContent = `${carbsG} g`;
//     proteinTargetElement.textContent = `${protG} g`;
//     fatsTargetElement   .textContent = `${fatG} g`;
// }

// -----------------------------------------------------------------------------------------------------------------------------------------------
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

    // 2. Close modal
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // 3. Handle form submit
    mealForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('foodName').value.trim();
        const qty = +document.getElementById('quantity').value;
        const cal = +document.getElementById('calories').value;
        const portion = document.getElementById('portion').value.trim();
        const mealType = document.getElementById('mealType').value;
        if (!name || !qty || !cal || !portion) return;

        meals.push({ mealType, name, qty, cal, portion });
        updateLogUI();
        mealForm.reset();
        modal.classList.add('hidden');
    });

    // 4. Render log + totals
    function updateLogUI() {
        logList.innerHTML = '';
        let totalCalories = 0;
        meals.forEach((m, i) => {
            totalCalories += m.cal;
            const div = document.createElement('div');
            div.className = 'logged-meal';
            div.innerHTML = `
          <div>
            <strong>${m.mealType.toUpperCase()}</strong>: ${m.qty}× ${m.portion}
            <br><small>${m.name}</small>
          </div>
          <div>
            ${m.cal} kcal
            <button onclick="deleteMeal(${i})">✖️</button>
          </div>
        `;
            logList.appendChild(div);
        });
        totalCalEl.textContent = totalCalories;
    }

    // 5. Delete entry
    window.deleteMeal = i => {
        meals.splice(i, 1);
        updateLogUI();
    };
});
// ↑↑↑ END: Meal‑Log Functionality ↑↑↑


// Grab all “Log Meal” buttons (ensure they have class="log-meal-btn")
const logButtons = document.querySelectorAll('.log-meal-btn');
const modal = document.getElementById('mealModal');
const closeBtn = document.getElementById('closeModal');
const mealForm = document.getElementById('mealForm');
const logList = document.getElementById('logList');
const totalCalEl = document.getElementById('totalCalories');

let meals = [];  // in-memory array of logged meals

// 1. Open modal on any Log‑Meal button click
logButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Optional: track which meal type (breakfast/lunch/etc)
        document.getElementById('mealType').value = btn.dataset.meal;
        modal.classList.remove('hidden');
    });
});

// 2. Close modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
});

// 3. Handle form submission
mealForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('foodName').value.trim();
    const qty = +document.getElementById('quantity').value;
    const cal = +document.getElementById('calories').value;
    const portion = document.getElementById('portion').value.trim();
    const mealType = document.getElementById('mealType').value;

    // Basic validation
    if (!name || !qty || !cal || !portion) return;

    // Add to in-memory log
    meals.push({ mealType, name, qty, cal, portion });
    updateLogUI();

    // Reset & hide
    mealForm.reset();
    modal.classList.add('hidden');
});

// 4. Render all logged meals + totals
function updateLogUI() {
    logList.innerHTML = '';
    let totalCalories = 0;

    meals.forEach((m, idx) => {
        totalCalories += m.cal;
        const div = document.createElement('div');
        div.className = 'logged-meal';
        div.innerHTML = `
      <div>
        <strong>${m.mealType.toUpperCase()}</strong>: ${m.qty} × ${m.portion}
        <br><small>${m.name}</small>
      </div>
      <div>
        ${m.cal} kcal
        <button onclick="deleteMeal(${idx})" aria-label="Delete">✖️</button>
      </div>
    `;
        logList.appendChild(div);
    });

    totalCalEl.textContent = totalCalories;
}

// 5. Allow deleting a logged meal
function deleteMeal(index) {
    meals.splice(index, 1);
    updateLogUI();
}