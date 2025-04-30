import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDeF6NXspgaDJqPTXtoTGarCINgt4QXxFg",
    authDomain: "auth-77511.firebaseapp.com",
    projectId: "auth-77511",
    storageBucket: "auth-77511.firebasestorage.app",
    messagingSenderId: "659791535149",
    appId: "1:659791535149:web:82f71327e112f7a738eca4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const google_login = document.getElementById("google-Login-btn");
google_login.addEventListener("click", function(){
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user);
            window.location.href = "../dashboard.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
});

// function updateUserProfile(user){
//     const userName = user.displayName;
//     const userEmail = user.email;
//     const userProfilePicture = user.photoURL;

//     document.getElementById("userName").textContent = userName;
//     document.getElementById("userEmail").textContent = userEmail;
//     document.getElementById("userProfilePicture").src = userProfilePicture;
// }
// updateUserProfile(user);