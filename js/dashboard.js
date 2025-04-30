// Add this script AFTER the existing dashboard.js and main.js if they exist
document.addEventListener('DOMContentLoaded', function () {
    // Read data from localStorage
    const profileDataString = localStorage.getItem('userProfile');

    if (profileDataString) {
        const profileData = JSON.parse(profileDataString);

        // Update elements on the dashboard page
        if (profileData.name) {
            document.getElementById('userName').textContent = profileData.name;
        }
        if (profileData.age) {
            // Assuming you have an element with id="userAge" for age
            let userAgeElement = document.getElementById('userAge');
            if (!userAgeElement) { // Create if it doesn't exist
                userAgeElement = document.createElement('p');
                userAgeElement.id = 'userAge';
                // You would need to find where to append this on your dashboard
                // For now, just log if element is missing
                console.error("Element with id 'userAge' not found in dashboard.html");
            } else {
                userAgeElement.textContent = profileData.age;
            }
        }
        if (profileData.gender) {
            // Assuming you have an element with id="userGender"
            let userGenderElement = document.getElementById('userGender');
            if (!userGenderElement) {
                userGenderElement = document.createElement('p');
                userGenderElement.id = 'userGender';
                console.error("Element with id 'userGender' not found in dashboard.html");
            } else {
                // Capitalize the first letter for display
                const displayGender = profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1);
                userGenderElement.textContent = displayGender;
            }
        }
        if (profileData.height && profileData.heightUnit) {
            // Assuming you have an element with id="userHeight"
            let userHeightElement = document.getElementById('userHeight');
            if (!userHeightElement) {
                userHeightElement = document.createElement('p');
                userHeightElement.id = 'userHeight';
                console.error("Element with id 'userHeight' not found in dashboard.html");
            } else {
                userHeightElement.textContent = `${profileData.height} ${profileData.heightUnit}`;
            }
        }
        if (profileData.weight && profileData.weightUnit) {
            // Update the existing current weight element
            const currentWeightElement = document.getElementById('currentWeight');
            if (currentWeightElement) {
                currentWeightElement.textContent = `${profileData.weight} ${profileData.weightUnit}`;
            }
            // Note: targetWeight and dailyCalories would require calculation/logic
        }

    } else {
        // Handle case where no profile data is found in localStorage
        console.log('No profile data found in localStorage.');
        // Optionally redirect user back to profile setup or show a message
        // window.location.href = 'profile-setup.html';
    }
});