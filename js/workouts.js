document.addEventListener('DOMContentLoaded', initWorkoutsPage);
window.addEventListener('storage', e => {
    if (e.key === 'userProfile') initWorkoutsPage();
});

const API_KEY = '5fHApZiU8h9hc8wzsAT8cg==sUw8ZX4abzNlCLIO';
function mapPrefToApiType(pref) {
    switch (pref) {
        case 'strength': return 'strength';
        case 'cardio': return 'cardio';
        case 'flexibility': return 'stretching';
        case 'balance': return null;           // no direct mapping
        default: return null;
    }
}

const difficultyMap = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'expert'
};
const defaultDurations = {
    beginner: 10,
    intermediate: 18,
    expert: 30
};
async function fetchRecommendations(profile) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '<p>Loading…</p>';

    // build a list of valid types to query
    const prefs = Array.isArray(profile.preferences)
        ? profile.preferences
        : [];
    const types = prefs
        .map(mapPrefToApiType)
        .filter(t => !!t);

    // if nothing left, default to 'strength'
    if (types.length === 0) types.push('strength');

    const diff = {
        beginner: 'beginner',
        intermediate: 'intermediate',
        advanced: 'expert'
    }[profile.fitnessLevel] || 'beginner';

    let allExercises = [];

    for (let type of types) {
        const url = new URL('https://api.api-ninjas.com/v1/exercises');
        url.searchParams.set('type', type);
        url.searchParams.set('difficulty', diff);

        try {
            const res = await fetch(url.toString(), {
                headers: {
                    'X-Api-Key': API_KEY,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) {
                console.warn(`Workout API (${type}) failed:`, res.status);
                continue;
            }
            const list = await res.json();
            allExercises = allExercises.concat(list);
        } catch (err) {
            console.error('Network error fetching', type, err);
        }
    }

    renderRecommendations(allExercises);
}
function renderRecommendations(list) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';  // clear loading text

    if (!Array.isArray(list) || list.length === 0) {
        container.innerText = 'No workouts found for your profile.';
        return;
    }

    list.forEach(w => {
        const descRaw = w.description || w.instructions || '';
        const desc = typeof descRaw === 'string'
            ? descRaw.replace(/<[^>]+>/g, '')
            : '';

        const dur = w.duration
            || { beginner: 10, intermediate: 18, expert: 30 }[w.difficulty]
            || '--';

        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
        <h3>${w.name}</h3>
        <p>${desc}</p>
        <small>Duration: ${dur} min</small>
      `;
        container.appendChild(card);
    });
}


// DOM Elements - Get references to the HTML elements where data will be displayed or interacted with
const workoutDaysElement = document.getElementById('workoutDays');
const workoutDurationElement = document.getElementById('workoutDuration');
const caloriesBurnedElement = document.getElementById('caloriesBurned');
const workoutLogBody = document.getElementById('workoutLogBody'); // Table body for workout history
const exerciseGrid = document.getElementById('exerciseGrid'); // Container for exercise cards
const logWorkoutModal = document.getElementById('logWorkoutModal'); // The workout logging modal
const logWorkoutForm = document.getElementById('logWorkoutForm'); // The form inside the modal
const workoutDayInput = document.getElementById('workoutDay'); // Hidden input in the modal form
const logoutBtn = document.getElementById('logoutBtn'); // Logout button


// Exercise Library Data - Hardcoded exercise data
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

// Initialize the workouts page - This function runs when the page loads
async function initWorkoutsPage() {
    // If using Supabase Auth for login, keep this check:
    try {
        const userProfile = loadProfileForWorkouts();
        console.log('Loaded userProfile:', userProfile);
        if (userProfile) {
            generateWorkoutPlan(userProfile);
            document.getElementById('recommendations').innerHTML = '<p>Loading…</p>';
            await fetchRecommendations(userProfile);

        } else {
            displayDefaultWorkoutPlan();
            document.getElementById('recommendations').innerText =
                'Please complete your profile first.';
        }
        await loadWorkoutHistory();      // keep history if you like
        loadExerciseLibrary();
        addEventListeners();
    } catch (error) {
        console.error('Init error:', error);
        showError('Failed to load workouts.');
    }
}

// --- Local Profile and Plan Generation Functions ---

// Read user profile from localStorage
function loadProfileForWorkouts() {
    const raw = localStorage.getItem('userProfile');
    try {
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Error parsing user profile from localStorage:", e);
        return null;
    }
}

// Generate a workout plan based on the user profile
function generateWorkoutPlan(profile) {
    // Map activity level value (0-4) to number of workout days and duration
    const activityLevelMap = {
        '0': { days: 1, duration: 30 }, // 1 session/week
        '1': { days: 2, duration: 45 }, // 2 sessions/week
        '2': { days: 4, duration: 60 }, // 4 sessions/week
        '3': { days: 6, duration: 75 }, // 6 sessions/week
        '4': { days: 7, duration: 60 }  // 7 sessions/week (maybe shorter sessions)
    };

    // Get the activity details based on the profile's activity level
    // Use default values if activity level is not found or profile is null/undefined
    const activityDetails = activityLevelMap[profile?.activity] || { days: 3, duration: 45 };
    const daysPerWeek = activityDetails.days;
    const sessionDuration = activityDetails.duration;

    // Simple estimation for calories burned (can be refined)
    // This is a very rough estimate and depends heavily on workout type, intensity, and user factors
    const estimatedCaloriesPerSession = sessionDuration * 7; // Example: 7 kcal per minute

    // Update the workout stats display
    if (workoutDaysElement) workoutDaysElement.textContent = `${daysPerWeek} days/week`;
    if (workoutDurationElement) workoutDurationElement.textContent = `${sessionDuration} minutes`;
    if (caloriesBurnedElement) caloriesBurnedElement.textContent = `${estimatedCaloriesPerSession} kcal`;

    // Determine the weekly schedule
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workoutTypes = ['Strength Training', 'Cardio', 'Flexibility', 'HIIT']; // Possible workout types
    let workoutTypeIndex = 0;

    daysOfWeek.forEach((day, i) => {
        const workoutContentElement = document.getElementById(`${day}Workout`);
        if (workoutContentElement) {
            if (i < daysPerWeek) {
                // Assign a workout type, cycling through the workoutTypes array
                workoutContentElement.textContent = workoutTypes[workoutTypeIndex % workoutTypes.length];
                workoutTypeIndex++; // Move to the next workout type for the next workout day
            } else {
                workoutContentElement.textContent = 'Rest day'; // Assign rest day
            }
        }
    });
}

// Display a default workout plan if profile is not available
function displayDefaultWorkoutPlan() {
    if (workoutDaysElement) workoutDaysElement.textContent = '-- days/week';
    if (workoutDurationElement) workoutDurationElement.textContent = '-- minutes';
    if (caloriesBurnedElement) caloriesBurnedElement.textContent = '-- kcal';

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    daysOfWeek.forEach(day => {
        const workoutContentElement = document.getElementById(`${day}Workout`);
        if (workoutContentElement) {
            workoutContentElement.textContent = 'Plan not available';
        }
    });
}
async function loadWorkoutHistory() {
    const workouts = loadWorkoutsFromLocalStorage();
    updateWorkoutLogTable(workouts);
}

function loadWorkoutsFromLocalStorage() {
    const raw = localStorage.getItem('workoutHistory');
    try {
        // Parse the JSON string, default to empty array if null or invalid
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Error parsing workout history from localStorage:", e);
        return []; // Return empty array on error
    }
}

// Helper function to save workouts to localStorage
function saveWorkoutsToLocalStorage(workouts) {
    try {
        localStorage.setItem('workoutHistory', JSON.stringify(workouts));
    } catch (e) {
        console.error("Error saving workout history to localStorage:", e);
        showError("Failed to save workout history locally.");
    }
}


// Update the HTML table with workout log data
function updateWorkoutLogTable(workouts) {
    if (!workoutLogBody) return;
    workoutLogBody.innerHTML = '';

    if (!workouts || workouts.length === 0) {
        workoutLogBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No workout history available.</td></tr>';
        return;
    }

    workouts.forEach(workout => {
        const row = document.createElement('tr');
        // Add a unique ID to the row or a data attribute for easy deletion
        row.dataset.id = workout.id || new Date(workout.date).getTime(); // Use Supabase ID or timestamp

        row.innerHTML = `
            <td>${new Date(workout.date).toLocaleDateString()}</td>
            <td>${workout.type}</td>
            <td>${workout.duration} minutes</td>
            <td>${workout.calories} kcal</td>
            <td>${workout.notes || ''}</td>
            <td>
                <button class="btn secondary delete-workout" data-id="${row.dataset.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        workoutLogBody.appendChild(row);
    });

    // Add event listeners to the newly created delete buttons
    document.querySelectorAll('.delete-workout').forEach(button => {
        button.addEventListener('click', async (e) => {
            // Get the workout ID from the data attribute of the button or its parent row
            const workoutId = e.target.closest('button').dataset.id;
            await deleteWorkout(workoutId);
        });
    });
}

// Log a new workout entry (uses localStorage if Supabase is not configured)
async function logWorkout(workoutData) {
    logWorkoutLocally(workoutData);
    await loadWorkoutHistory();
    logWorkoutModal.style.display = 'none';
    logWorkoutForm.reset();
}

// Helper function to log workout locally to localStorage
function logWorkoutLocally(workoutData) {
    const workouts = loadWorkoutsFromLocalStorage();
    // Assign a simple unique ID (timestamp) for local storage entries
    const newWorkout = { ...workoutData, id: new Date().getTime() };
    workouts.push(newWorkout);
    saveWorkoutsToLocalStorage(workouts);
    console.log("Workout logged to localStorage.");
}


// Delete a workout entry (uses localStorage if Supabase is not configured)
async function deleteWorkout(workoutId) {
    deleteWorkoutLocally(workoutId);
    await loadWorkoutHistory();

}

// Helper function to delete workout locally from localStorage
function deleteWorkoutLocally(workoutId) {
    let workouts = loadWorkoutsFromLocalStorage();
    // Filter out the workout with the matching ID (ID is a string from data-id)
    const initialLength = workouts.length;
    workouts = workouts.filter(workout => String(workout.id) !== String(workoutId));

    if (workouts.length < initialLength) {
        saveWorkoutsToLocalStorage(workouts);
        console.log(`Workout with ID ${workoutId} deleted from localStorage.`);
    } else {
        console.warn(`Workout with ID ${workoutId} not found in localStorage.`);
    }
}


// Load and display the exercise library cards (hardcoded)
function loadExerciseLibrary() {
    if (!exerciseGrid) return;
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

function performLocalLogout() {
    // Clear local storage data relevant to the user session/profile
    localStorage.removeItem('userProfile');
    localStorage.removeItem('workoutHistory'); // Clear local history on logout
    console.warn("Performing local logout: localStorage cleared.");
    window.location.href = 'index.html'; // Redirect to login page
}
// Add all necessary event listeners to interactive elements
function addEventListeners() {
    // Add click listeners to all buttons that open the workout logging modal
    document.querySelectorAll('.log-workout-btn').forEach(button => {
        button.addEventListener('click', () => {
            const day = button.dataset.day;
            if (workoutDayInput) workoutDayInput.value = day;
            if (logWorkoutModal) logWorkoutModal.style.display = 'block';
        });
    });

    // Add submit listener to the workout logging form
    if (logWorkoutForm) {
        logWorkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect data from the form inputs
            const workoutData = {
                // Use the day from the hidden input, or current date if not set
                date: new Date().toISOString(), // Store as ISO string
                day: workoutDayInput ? workoutDayInput.value : 'N/A', // Store the day it was logged for
                type: document.getElementById('workoutType').value,
                duration: parseInt(document.getElementById('duration').value),
                calories: parseInt(document.getElementById('calories').value),
                notes: document.getElementById('notes').value
            };

            // Basic validation
            if (!workoutData.type || isNaN(workoutData.duration) || isNaN(workoutData.calories)) {
                showError("Please fill out all required fields (Workout Type, Duration, Calories).");
                return; // Stop the logging process
            }

            await logWorkout(workoutData); // Use the updated logWorkout function
        });
    }


    // Add click listeners to the exercise filter buttons
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

    // Close modal when clicking outside of the modal content
    window.addEventListener('click', (e) => {
        if (e.target === logWorkoutModal) {
            logWorkoutModal.style.display = 'none';
        }
    });

    // Close modal when clicking the close button (X)
    const closeButton = document.querySelector('.modal .close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (logWorkoutModal) logWorkoutModal.style.display = 'none';
        });
    }


    // Add click listener to the logout button (uses Supabase if configured, or local)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            performLocalLogout();
        });
    }
}

function showError(message) {
    alert(message);
}