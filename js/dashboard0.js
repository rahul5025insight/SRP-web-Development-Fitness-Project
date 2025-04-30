// Initialize Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const userNameElement = document.getElementById('userName');
const currentWeightElement = document.getElementById('currentWeight');
const targetWeightElement = document.getElementById('targetWeight');
const dailyCaloriesElement = document.getElementById('dailyCalories');
const progressPercentageElement = document.getElementById('progressPercentage');
const mealRecommendationElement = document.getElementById('mealRecommendation');
const workoutRecommendationElement = document.getElementById('workoutRecommendation');
const hydrationRecommendationElement = document.getElementById('hydrationRecommendation');
const logoutBtn = document.getElementById('logoutBtn');
const logWeightBtn = document.getElementById('logWeightBtn');
const logWeightModal = document.getElementById('logWeightModal');
const logWeightForm = document.getElementById('logWeightForm');

// Charts
let weightChart;
let calorieChart;

// Initialize Dashboard
async function initDashboard() {
    try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError) throw profileError;

        // Update UI with profile data
        updateProfileUI(profile);

        // Fetch weight history
        const { data: weightHistory, error: weightError } = await supabase
            .from('weight_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (weightError) throw weightError;

        // Fetch calorie history
        const { data: calorieHistory, error: calorieError } = await supabase
            .from('calorie_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (calorieError) throw calorieError;

        // Initialize charts
        initCharts(weightHistory, calorieHistory);

        // Generate recommendations
        generateRecommendations(profile);

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading dashboard data. Please try again.');
    }
}

// Update UI with profile data
function updateProfileUI(profile) {
    userNameElement.textContent = profile.name;
    currentWeightElement.textContent = `${profile.weight} kg`;
    targetWeightElement.textContent = profile.target_weight ? `${profile.target_weight} kg` : 'Not set';
    dailyCaloriesElement.textContent = `${profile.recommended_calories} kcal`;

    // Calculate progress percentage
    if (profile.target_weight) {
        const progress = ((profile.weight - profile.target_weight) / (profile.weight - profile.target_weight)) * 100;
        progressPercentageElement.textContent = `${Math.round(progress)}%`;
    }
}

// Initialize Charts
function initCharts(weightHistory, calorieHistory) {
    // Weight Chart
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: weightHistory.map(log => new Date(log.created_at).toLocaleDateString()),
            datasets: [{
                label: 'Weight (kg)',
                data: weightHistory.map(log => log.weight),
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Calorie Chart
    const calorieCtx = document.getElementById('calorieChart').getContext('2d');
    calorieChart = new Chart(calorieCtx, {
        type: 'bar',
        data: {
            labels: calorieHistory.map(log => new Date(log.created_at).toLocaleDateString()),
            datasets: [{
                label: 'Calories',
                data: calorieHistory.map(log => log.calories),
                backgroundColor: '#2196F3'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Generate Recommendations
function generateRecommendations(profile) {
    // Meal recommendation based on goal and preferences
    let mealRecommendation;
    switch (profile.goal) {
        case 'lose_weight':
            mealRecommendation = 'High protein, moderate fat, low carb meals';
            break;
        case 'build_muscle':
            mealRecommendation = 'High protein, moderate carb meals';
            break;
        default:
            mealRecommendation = 'Balanced meals with all macronutrients';
    }
    mealRecommendationElement.textContent = mealRecommendation;

    // Workout recommendation based on preferences
    const workoutPreferences = profile.workout_preferences || [];
    let workoutRecommendation;
    if (workoutPreferences.includes('strength')) {
        workoutRecommendation = 'Strength training with compound movements';
    } else if (workoutPreferences.includes('cardio')) {
        workoutRecommendation = 'Cardio workout with intervals';
    } else {
        workoutRecommendation = 'Mixed workout combining different styles';
    }
    workoutRecommendationElement.textContent = workoutRecommendation;

    // Hydration recommendation based on weight
    const waterRecommendation = Math.round(profile.weight * 0.033);
    hydrationRecommendationElement.textContent = `Drink ${waterRecommendation} liters of water today`;
}

// Event Listeners
logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
});

logWeightBtn.addEventListener('click', () => {
    logWeightModal.style.display = 'block';
});

logWeightForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weightInput').value);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('weight_logs')
            .insert([{
                user_id: user.id,
                weight: weight,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // Update profile with new weight
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ weight: weight })
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Close modal and refresh data
        logWeightModal.style.display = 'none';
        initDashboard();
    } catch (error) {
        console.error('Error logging weight:', error);
        alert('Error logging weight. Please try again.');
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === logWeightModal) {
        logWeightModal.style.display = 'none';
    }
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard); 