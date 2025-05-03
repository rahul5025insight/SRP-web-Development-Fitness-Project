// 1. Read profile
function loadProfileForWorkouts() {
    const raw = localStorage.getItem('userProfile');
    return raw ? JSON.parse(raw) : null;
}

// 2. Build a plan
function generateWorkoutPlan(profile) {
    const dayMap = { '0': 1, '1': 2, '2': 4, '3': 6, '4': 7 };
    const durMap = { '0': 15, '1': 30, '2': 45, '3': 60, '4': 75 };
    const days = dayMap[profile.activity] || 3;
    const duration = durMap[profile.activity] || 30;
    const caloriesPerSession = duration * 5; // approx.

    workoutDays.textContent = `${days} days/week`;
    workoutDuration.textContent = `${duration} minutes`;
    caloriesBurned.textContent = `${caloriesPerSession} kcal`;

    // fill weekly schedule
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    daysOfWeek.forEach((day, i) => {
        const el = document.getElementById(`${day}Workout`);
        el.textContent = i < days
            ? (i % 2 === 0 ? 'Strength training' : 'Cardio')
            : 'Rest day';
    });
}

// 3. Call them in your init
async function initWorkoutsPage() {
    const profile = loadProfileForWorkouts();
    if (profile) generateWorkoutPlan(profile);

    // …then your existing Supabase code (or comment that out until ready)
}
document.addEventListener('DOMContentLoaded', initWorkoutsPage);
// DOM Elements
const workoutDays = document.getElementById('workoutDays');
const workoutDuration = document.getElementById('workoutDuration');
const caloriesBurned = document.getElementById('caloriesBurned');
const workoutLogBody = document.getElementById('workoutLogBody');
const exerciseGrid = document.getElementById('exerciseGrid');
const logWorkoutModal = document.getElementById('logWorkoutModal');
const logWorkoutForm = document.getElementById('logWorkoutForm');
const workoutDayInput = document.getElementById('workoutDay');


// Exercise Library Data
const exercises = {
    strength: [
        { name: 'Bench Press', description: 'Chest exercise', difficulty: 'Intermediate' },
        { name: 'Squats', description: 'Leg exercise', difficulty: 'Beginner' },
        { name: 'Deadlifts', description: 'Full body exercise', difficulty: 'Advanced' },
        { name: 'Shoulder Press', description: 'Shoulder exercise', difficulty: 'Intermediate' },
        { name: 'Pull-ups', description: 'Back exercise', difficulty: 'Advanced' }
    ],
    cardio: [
        { name: 'Running', description: 'Cardiovascular exercise', difficulty: 'Beginner' },
        { name: 'Cycling', description: 'Low impact cardio', difficulty: 'Beginner' },
        { name: 'Jump Rope', description: 'High intensity cardio', difficulty: 'Intermediate' },
        { name: 'Swimming', description: 'Full body cardio', difficulty: 'Intermediate' }
    ],
    flexibility: [
        { name: 'Yoga', description: 'Full body flexibility', difficulty: 'Beginner' },
        { name: 'Stretching', description: 'Basic flexibility', difficulty: 'Beginner' },
        { name: 'Pilates', description: 'Core and flexibility', difficulty: 'Intermediate' }
    ]
};

// 1. Read profile
function loadProfileForWorkouts() {
    const raw = localStorage.getItem('userProfile');
    return raw ? JSON.parse(raw) : null;
}
function generateWorkoutPlan(profile) {
    // map activity → days & duration
    const dayMap = { '0':1, '1':2, '2':4, '3':6, '4':7 };
    const durMap = { '0':15,'1':30,'2':45,'3':60,'4':75 };
    const days   = dayMap[profile.activity] || 3;
    const duration = durMap[profile.activity] || 30;
    const caloriesBurned = duration * 5;  // ~5kcal/min
  
    // write summary
    document.getElementById('workoutDays').textContent     = `${days} days/week`;
    document.getElementById('workoutDuration').textContent = `${duration} minutes`;
    document.getElementById('caloriesBurned').textContent  = `${caloriesBurned} kcal`;
  
    // fill each day
    const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    daysOfWeek.forEach((day, i) => {
        const el = document.getElementById(`${day}Workout`);
        el.textContent = i < days
        ? (i % 2 === 0 ? 'Strength training' : 'Cardio')
        : 'Rest day';
    });
}
// 3. Call them in your init
async function initWorkoutsPage() {
    const profile = loadProfileForWorkouts();
    if (profile) generateWorkoutPlan(profile);

    // …then your existing Supabase code (or comment that out until ready)
}
document.addEventListener('DOMContentLoaded', initWorkoutsPage);
// // 2. Build a plan
// function generateWorkoutPlan(profile) {
//     const dayMap = { '0': 1, '1': 2, '2': 4, '3': 6, '4': 7 };
//     const durMap = { '0': 15, '1': 30, '2': 45, '3': 60, '4': 75 };
//     const days = dayMap[profile.activity] || 3;
//     const duration = durMap[profile.activity] || 30;
//     const caloriesPerSession = duration * 5; // approx.

//     workoutDays.textContent = `${days} days/week`;
//     workoutDuration.textContent = `${duration} minutes`;
//     caloriesBurned.textContent = `${caloriesPerSession} kcal`;

//     // fill weekly schedule
//     const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//     daysOfWeek.forEach((day, i) => {
//         const el = document.getElementById(`${day}Workout`);
//         el.textContent = i < days
//             ? (i % 2 === 0 ? 'Strength training' : 'Cardio')
//             : 'Rest day';
//     });
// }



// Initialize the workouts page
async function initWorkoutsPage() {
    try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Load user profile and workout plan
        await loadUserProfile();
        await loadWorkoutPlan();
        await loadWorkoutHistory();
        loadExerciseLibrary();

        // Add event listeners
        addEventListeners();
    } catch (error) {
        console.error('Error initializing workouts page:', error);
        showError('Failed to load workout data');
    }
}

// Load user profile and update workout stats
async function loadUserProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', (await supabase.auth.getUser()).data.user.id)
            .single();

        if (error) throw error;

        // Update workout stats based on profile
        workoutDays.textContent = `${profile.workout_days || 3} days/week`;
        workoutDuration.textContent = `${profile.workout_duration || 45} minutes`;
        caloriesBurned.textContent = `${profile.daily_calories_burned || 300} kcal`;
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw error;
    }
}

// Load and display workout plan
async function loadWorkoutPlan() {
    try {
        const { data: workoutPlan, error } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('user_id', (await supabase.auth.getUser()).data.user.id)
            .single();

        if (error) throw error;

        // Update each day's workout content
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            const workoutContent = document.getElementById(`${day}Workout`);
            if (workoutPlan && workoutPlan[day]) {
                workoutContent.textContent = workoutPlan[day];
            } else {
                workoutContent.textContent = 'Rest day';
            }
        });
    } catch (error) {
        console.error('Error loading workout plan:', error);
        throw error;
    }
}

// Load workout history
async function loadWorkoutHistory() {
    try {
        const { data: workouts, error } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('user_id', (await supabase.auth.getUser()).data.user.id)
            .order('date', { ascending: false });

        if (error) throw error;

        updateWorkoutLogTable(workouts);
    } catch (error) {
        console.error('Error loading workout history:', error);
        throw error;
    }
}

// Update workout log table
function updateWorkoutLogTable(workouts) {
    workoutLogBody.innerHTML = '';

    workouts.forEach(workout => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(workout.date).toLocaleDateString()}</td>
            <td>${workout.type}</td>
            <td>${workout.duration} minutes</td>
            <td>${workout.calories} kcal</td>
            <td>${workout.notes || ''}</td>
            <td>
                <button class="btn secondary delete-workout" data-id="${workout.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        workoutLogBody.appendChild(row);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-workout').forEach(button => {
        button.addEventListener('click', async (e) => {
            const workoutId = e.target.closest('button').dataset.id;
            await deleteWorkout(workoutId);
        });
    });
}

// Load exercise library
function loadExerciseLibrary() {
    exerciseGrid.innerHTML = '';

    Object.entries(exercises).forEach(([category, categoryExercises]) => {
        categoryExercises.forEach(exercise => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.dataset.category = category;
            card.innerHTML = `
                <h3>${exercise.name}</h3>
                <p>${exercise.description}</p>
                <div class="exercise-details">
                    <span class="difficulty">${exercise.difficulty}</span>
                    <span class="category">${category}</span>
                </div>
            `;
            exerciseGrid.appendChild(card);
        });
    });
}

// Log workout
async function logWorkout(workoutData) {
    try {
        const { error } = await supabase
            .from('workout_logs')
            .insert([{
                user_id: (await supabase.auth.getUser()).data.user.id,
                ...workoutData
            }]);

        if (error) throw error;

        // Reload workout history
        await loadWorkoutHistory();
        // Close modal
        logWorkoutModal.style.display = 'none';
        // Reset form
        logWorkoutForm.reset();
    } catch (error) {
        console.error('Error logging workout:', error);
        showError('Failed to log workout');
    }
}

// Delete workout
async function deleteWorkout(workoutId) {
    try {
        const { error } = await supabase
            .from('workout_logs')
            .delete()
            .eq('id', workoutId);

        if (error) throw error;

        // Reload workout history
        await loadWorkoutHistory();
    } catch (error) {
        console.error('Error deleting workout:', error);
        showError('Failed to delete workout');
    }
}

// Add event listeners
function addEventListeners() {
    // Log workout buttons
    document.querySelectorAll('.log-workout-btn').forEach(button => {
        button.addEventListener('click', () => {
            const day = button.dataset.day;
            workoutDayInput.value = day;
            logWorkoutModal.style.display = 'block';
        });
    });

    // Workout form submission
    logWorkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const workoutData = {
            date: new Date().toISOString(),
            type: document.getElementById('workoutType').value,
            duration: parseInt(document.getElementById('duration').value),
            calories: parseInt(document.getElementById('calories').value),
            notes: document.getElementById('notes').value
        };
        await logWorkout(workoutData);
    });

    // Exercise filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            document.querySelectorAll('.exercise-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === logWorkoutModal) {
            logWorkoutModal.style.display = 'none';
        }
    });

    // Close modal button
    document.querySelector('.close').addEventListener('click', () => {
        logWorkoutModal.style.display = 'none';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });
}

// Show error message
function showError(message) {
    alert(message);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initWorkoutsPage); 