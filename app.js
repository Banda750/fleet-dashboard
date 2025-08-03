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

// Initialize FirebaseUI Auth
const ui = new firebaseui.auth.AuthUI(auth);
const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => {
      document.getElementById("login-container").style.display = "none";
      document.getElementById("dashboard-container").style.display = "block";
      initMap();
      initAwesomplete();
      return false;
    }
  }
};

// Start FirebaseUI Auth
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard-container").style.display = "block";
    initMap();
    initAwesomplete();
  } else {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("dashboard-container").style.display = "none";
    ui.start('#firebaseui-auth-container', uiConfig);
  }
});

// Google Map & markers
let map;
const tripPolylines = [];
const tripMarkers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -24.6282, lng: 25.9231 },
    zoom: 12,
  });
}

function clearMap() {
  tripMarkers.forEach(m => m.setMap(null));
  tripMarkers.length = 0;

  tripPolylines.forEach(p => p.setMap(null));
  tripPolylines.length = 0;
}

function addTripMarkers(trip) {
  if (trip.startLocation) {
    const startMarker = new google.maps.Marker({
      position: {
        lat: trip.startLocation.latitude,
        lng: trip.startLocation.longitude,
      },
      map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      title: `Trip Start: ${new Date(trip.startTimestamp.seconds * 1000).toLocaleString()}`
    });
    tripMarkers.push(startMarker);
  }
  if (trip.endLocation) {
    const endMarker = new google.maps.Marker({
      position: {
        lat: trip.endLocation.latitude,
        lng: trip.endLocation.longitude,
      },
      map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      title: `Trip End: ${new Date(trip.endTimestamp.seconds * 1000).toLocaleString()}`
    });
    tripMarkers.push(endMarke
