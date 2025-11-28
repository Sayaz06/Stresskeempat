// firebase-config.js
// Masukkan config projek Firebase kau di sini

// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyAVUDp0nCpXRG1cvGEhRIekqtqFq-6stSg",
   authDomain: "stresskeempat.firebaseapp.com",
   projectId: "stresskeempat",
   storageBucket: "stresskeempat.firebasestorage.app",
   messagingSenderId: "53007955726",
   appId: "1:53007955726:web:0c32add24030a4a722495f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
