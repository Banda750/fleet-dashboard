// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgUO-JbOZ-CEXyHxL-JAlPWvDs-FbiU2o",
  authDomain: "fleettrack-d8dd2.firebaseapp.com",
  projectId: "fleettrack-d8dd2",
  storageBucket: "fleettrack-d8dd2.appspot.com",
  messagingSenderId: "620292848866",
  appId: "1:620292848866:web:db08b1b499c0f4c11db2bb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// FirebaseUI Auth
const ui = new firebaseui.auth.AuthUI(auth);
const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      document.getElementById("login-container").style.display = "none";
      document.getElementById("dashboard-container").style.display = "block";
      return false;
    }
  }
};
ui.start('#firebaseui-auth-container', uiConfig);

// Map setup
let map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -24.6282, lng: 25.9231 }, // Default location (Gaborone)
    zoom: 12,
  });
}

// Filtering function placeholder
document.getElementById("filterBtn").addEventListener("click", () => {
  const driver = document.getElementById("driverInput").value;
  const vehicle = document.getElementById("vehicleInput").value;
  const start = document.getElementById("startDateInput").value;
  const end = document.getElementById("endDateInput").value;
  console.log("Filtering trips for", driver, vehicle, start, end);
});
