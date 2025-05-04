document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = new FormData(form);
    const profile = {
      name: data.get('name'),
      age: Number(data.get('age')),
      gender: data.get('gender'),
      height: Number(data.get('height')),
      heightUnit: data.get('height_unit'),
      weight: Number(data.get('weight')),
      weightUnit: data.get('weight_unit'),
      activity: data.get('activity'),
      macros: {
        carbs: Number(data.get('carbratio')),
        protein: Number(data.get('proteinratio')),
        fat: Number(data.get('fatratio'))
      },
      dietGoal: data.get('diettype'),
      fitnessLevel: data.get('fitnessLevel'),
      preferences: data.getAll('preferences'),
      dietaryPrefs: data.get('dietaryPrefs'),
      goals: data.get('goals'),
      targetCalories: Number(data.get('targetCalories'))
    };

    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
    console.log('🔖 Saved profile to localStorage:', profile);
    // Redirect to workouts page
    window.location.href = 'workouts.html';
  });
});