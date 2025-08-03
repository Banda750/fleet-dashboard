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
      // Don't redirect; just show dashboard
      return false;
    }
  }
};

// Map setup
let map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -24.6282, lng: 25.9231 }, // Gaborone
    zoom: 12,
  });
}

// Show/hide sections
function showSection(section) {
  if (section === "map") {
    document.getElementById("map-section").style.display = "block";
    document.getElementById("charts-section").style.display = "none";
  } else if (section === "charts") {
    document.getElementById("map-section").style.display = "none";
    document.getElementById("charts-section").style.display = "block";
  }
}

// Chart.js variables
let tripsChart;
let vehiclesChart;

function setupCharts() {
  const tripsCtx = document.getElementById('tripsChart').getContext('2d');
  tripsChart = new Chart(tripsCtx, {
    type: 'bar',
    data: {
      labels: [], // populate dynamically
      datasets: [{
        label: 'Trips Per Day',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  const vehiclesCtx = document.getElementById('vehiclesChart').getContext('2d');
  vehiclesChart = new Chart(vehiclesCtx, {
    type: 'doughnut',
    data: {
      labels: [], // populate dynamically
      datasets: [{
        label: 'Vehicle Usage',
        data: [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8AFF33', '#335BFF'],
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Load data & update charts - placeholder function (add real queries here)
async function loadAndShowData() {
  // Dummy data for demo, replace with real Firestore queries and update charts:
  tripsChart.data.labels = ['2025-08-01', '2025-08-02', '2025-08-03'];
  tripsChart.data.datasets[0].data = [5, 8, 3];
  tripsChart.update();

  vehiclesChart.data.labels = ['Vehicle A', 'Vehicle B', 'Vehicle C'];
  vehiclesChart.data.datasets[0].data = [10, 15, 7];
  vehiclesChart.update();
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard-container").style.display = "block";
    initMap();
    setupCharts();
    loadAndShowData();
  } else {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("dashboard-container").style.display = "none";
    ui.start("#firebaseui-auth-container", uiConfig);
  }
});

// Filter trips button - placeholder for filtering logic
document.getElementById("filterBtn").addEventListener("click", () => {
  const driver = document.getElementById("driverInput").value.trim();
  const vehicle = document.getElementById("vehicleInput").value.trim();
  const start = document.getElementById("startDateInput").value;
  const end = document.getElementById("endDateInput").value;
  console.log("Filter trips for", { driver, vehicle, start, end });

  // TODO: Add filtering logic to query Firestore and update map and charts
});
