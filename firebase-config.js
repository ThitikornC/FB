// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQb2n55TNT5W_INtvl_f1A3vU8h4X48jI",
    authDomain: "projectdemo-24a30.firebaseapp.com",
    databaseURL: "https://projectdemo-24a30.firebaseio.com",
    projectId: "projectdemo-24a30",
    storageBucket: "projectdemo-24a30.firebasestorage.app",
    messagingSenderId: "980011020752",
    appId: "1:980011020752:web:3eaba731db0cc6ac4509d5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to storage
const storage = firebase.storage();
