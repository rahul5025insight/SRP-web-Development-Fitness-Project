
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const profileData = {
      name:       document.getElementById('name').value,
      age:        document.getElementById('age').value,
      gender:     document.getElementById('gender').value,
      height:     document.getElementById('height').value,
      heightUnit: document.getElementById('height_unit').value,
      weight:     document.getElementById('weight').value,
      weightUnit: document.getElementById('weight_unit').value,
      activity:   document.querySelector('input[name="activity"]:checked').value,
      macros: {
        carbs:   document.getElementById('carbratio').value,
        protein: document.getElementById('proteinratio').value,
        fat:     document.getElementById('fatratio').value
      },
      dietGoal:  document.querySelector('input[name="diettype"]:checked').value  // lose/maintain/gain
    };
  
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    window.location.href = 'diet.html';
  });
  
// const profileForm = document.getElementById('profileForm');
// document.getElementById('profileForm')
//   .addEventListener('submit', function(event) {
//    // if you have a vanilla submit, remove it or comment it out
//    event.preventDefault();  // ⬅️ stop the browser from posting

//     const profileData = {
//       name:  document.getElementById('name').value,
//       age:   document.getElementById('age').value,
//       gender: document.getElementById('gender').value,
//       height: document.getElementById('height').value,
//       heightUnit: document.getElementById('height_unit').value,
//       weight: document.getElementById('weight').value,
//      weightUnit: document.getElementById('weight_unit').value,
//       activity: document.getElementById('activity').value
//       // …any other fields…
//     };

//     // save it:
//     localStorage.setItem('userProfile', JSON.stringify(profileData));

//    // then jump to diet page (or a dashboard)
//     window.location.href = 'diet.html';
// });

profileForm.addEventListener('submit', function (event) {
    // Get form data
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const height = document.getElementById('height').value;
    const heightUnit = document.getElementById('height_unit').value;
    const weight = document.getElementById('weight').value;
    const weightUnit = document.getElementById('weight_unit').value;

    // Create an object to store data
    const profileData = {
        name: name,
        age: age,
        gender: gender,
        height: height,
        heightUnit: heightUnit,
        weight: weight,
        weightUnit: weightUnit
    };

    // Save data to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));

    // Allow the form to submit and navigate to dashboard.html
    // If using method="post", you would typically send data to a backend here.
    // Since we changed to method="get" for this client-side example,
    // data will also be visible in the URL (less ideal for large/sensitive data).
    // If you must use POST without a backend, you'd prevent default, save data, and
    // then manually navigate: window.location.href = 'dashboard.html';
    // at the bottom of your submit handler in profile-setup.js
    event.preventDefault();             // stop the form actually posting
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    window.location.href = 'diet.html';  // or directly 'diet.html'

});