// ========== DOM ELEMENTS ==========
const dailyCaloriesElement = document.getElementById('dailyCalories');
const proteinTargetElement = document.getElementById('proteinTarget');
const carbsTargetElement = document.getElementById('carbsTarget');
const fatsTargetElement = document.getElementById('fatsTarget');

const profileNameElement = document.getElementById('profileName');
const profileAgeElement = document.getElementById('profileAge');
const profileGenderElement = document.getElementById('profileGender');
const profileHeightElement = document.getElementById('profileHeight');
const profileWeightElement = document.getElementById('profileWeight');

const logMealModal = document.getElementById('mealModal');
const logMealForm = document.getElementById('mealForm');
const foodLogBody = document.getElementById('foodLogBody');
const totalCaloriesElement = document.getElementById('totalCalories');
const totalProteinElement = document.getElementById('totalProtein');
const totalCarbsElement = document.getElementById('totalCarbs');
const totalFatsElement = document.getElementById('totalFats');

const logoutBtn = document.getElementById('logoutBtn');
const logBtn = document.getElementById('logFoodBtn');
const modal = document.getElementById('foodModal');
const closeBtn = modal.querySelector('.close');
const form = document.getElementById('foodForm');
const recContainer = document.getElementById('recommendations');

// ========== CONSTANTS ==========
const API_KEY = 'ca20f28351d64a57b8722357d72e1d8c';
const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

// ========== FOOD LOG ==========
function loadFoodLog() {
    return JSON.parse(localStorage.getItem('foodLog') || '[]');
}

function saveFoodLog(log) {
    localStorage.setItem('foodLog', JSON.stringify(log));
}

function renderFoodLog() {
    const log = loadFoodLog();
    foodLogBody.innerHTML = '';
    log.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${new Date(item.date).toLocaleDateString()}</td>
      <td>${item.foodName}</td>
      <td>${item.servingSize}</td>
      <td>${item.foodCalories}</td>
      <td><button class="delete" data-id="${item.id}">×</button></td>
    `;
        foodLogBody.appendChild(tr);
    });
}

foodLogBody.addEventListener('click', e => {
    if (e.target.matches('.delete')) {
        const id = e.target.dataset.id;
        const updatedLog = loadFoodLog().filter(i => i.id !== id);
        saveFoodLog(updatedLog);
        renderFoodLog();
    }
});
logBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

// And closing:
modal.addEventListener('click', e => {
    // click on backdrop (outside content) hides it
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});
// ========== MODAL ==========
function setupMealModal() {
    const logButtons = document.querySelectorAll('.log-meal-btn');
    const modal = document.getElementById('mealModal');
    const closeBtn = modal?.querySelector('#closeModal');

    logButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('mealType').value = btn.dataset.meal;
            modal.classList.remove('hidden');
        });
    });

    window.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }
}

// ========== MACRO CALCULATIONS ==========
function calculateAndDisplayMacros(profile) {
    let weightKg = parseFloat(profile.weight);
    if (profile.weightUnit === 'lbs') weightKg *= 0.453592;

    let heightCm = parseFloat(profile.height);
    if (profile.heightUnit === 'inches') heightCm *= 2.54;
    else if (profile.heightUnit === 'feet') heightCm *= 30.48;

    const age = parseInt(profile.age, 10);
    const s = profile.gender.toLowerCase() === 'male' ? 5 : -161;

    const BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
    const actFactor = { '0': 1.4, '1': 1.6, '2': 1.7, '3': 1.8, '4': 2 }[profile.activity] || 1.5;
    const maintenance = BMR * actFactor;

    const carbRatio = 0.4, protRatio = 0.3, fatRatio = 0.3;
    const cal = Math.round(maintenance);
    const carbsG = Math.round(carbRatio * cal / 4);
    const protG = Math.round(protRatio * cal / 4);
    const fatG = Math.round(fatRatio * cal / 9);

    dailyCaloriesElement.textContent = `${cal} kcal`;
    carbsTargetElement.textContent = `${carbsG} g`;
    proteinTargetElement.textContent = `${protG} g`;
    fatsTargetElement.textContent = `${fatG} g`;
}

// ========== PROFILE DISPLAY ==========
function loadAndDisplayProfile() {
    const profileDataString = localStorage.getItem('userProfile');
    if (!profileDataString) {
        window.location.href = 'profile-setup.html';
        return;
    }

    try {
        const profile = JSON.parse(profileDataString);

        if (profileNameElement) profileNameElement.textContent = profile.name || '-';
        if (profileAgeElement) profileAgeElement.textContent = profile.age || '-';
        if (profileGenderElement) profileGenderElement.textContent = profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1);
        if (profileHeightElement) profileHeightElement.textContent = `${profile.height} ${profile.heightUnit}`;
        if (profileWeightElement) profileWeightElement.textContent = `${profile.weight} ${profile.weightUnit}`;
    } catch (err) {
        console.error('Error parsing profile data:', err);
    }
}

// ========== FOOD RECOMMENDATIONS ==========
async function fetchFoodRecommendations() {
    const count = 12;
    const { dietaryPrefs } = userProfile;
    const url = new URL('https://api.spoonacular.com/recipes/random');
    url.searchParams.set('number', count);
    if (dietaryPrefs) {
        url.searchParams.set('tags', dietaryPrefs);
    }
    // put your API key in the query string or header
    url.searchParams.set('apiKey', API_KEY);

    // url.searchParams.set('timeFrame', 'day');
    // url.searchParams.set('targetCalories', targetCalories);
    // url.searchParams.set('diet', dietaryPrefs);

    recContainer.innerHTML = '<p>Loading…</p>';
    try {
        const res = await fetch(url.toString()); if (res.status === 401) {
            throw new Error('Invalid or missing API key (401 Unauthorized)');
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // data.recipes is an array of length == count

        recContainer.innerHTML = data.recipes.map(r => `
            <div class="meal-card">
              <h4>${r.title}</h4>
              <img src="${r.image}" alt="${r.title}" class="recipe-thumb" />
              <p>Ready in ${r.readyInMinutes} min • Serves ${r.servings}</p>
              <a href="${r.sourceUrl}" target="_blank">View Recipe</a>
            </div>
          `).join('');
    } catch (err) {
        console.error('Rec API error:', err);
        recContainer.innerText = 'Unable to load recommendations.';
    }
}
// ========== INIT ==========
function initDietPage() {
    loadAndDisplayProfile();
    if (userProfile) calculateAndDisplayMacros(userProfile);
    renderFoodLog();
    fetchFoodRecommendations();
    setupMealModal();
}

document.addEventListener('DOMContentLoaded', initDietPage);