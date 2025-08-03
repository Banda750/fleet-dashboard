// --- Firebase config ---
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

// --- FirebaseUI Auth Setup ---
const ui = new firebaseui.auth.AuthUI(auth);
const uiConfig = {
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: function () {
      document.getElementById("login-container").style.display = "none";
      document.getElementById("dashboard-container").style.display = "block";
      initMap();
      setupCharts();
      loadAndShowData();
      return false;
    },
  },
};
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

// --- Google Maps setup ---
let map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -24.6282, lng: 25.9231 },
    zoom: 12,
  });
}

// --- Chart.js setup ---
let tripsChart, vehiclesChart;

function setupCharts() {
  const tripsCtx = document.getElementById("tripsChart").getContext("2d");
  tripsChart = new Chart(tripsCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Trips Per Day",
          data: [],
          backgroundColor: "rgba(54, 162, 235, 0.7)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
    },
  });

  const vehiclesCtx = document.getElementById("vehiclesChart").getContext("2d");
  vehiclesChart = new Chart(vehiclesCtx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          label: "Vehicle Usage",
          data: [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
          ],
        },
      ],
    },
    options: { responsive: true },
  });
}

// --- Load data & update charts ---
async function loadAndShowData() {
  // Load trips collection (add your own filtering logic if needed)
  const tripsSnapshot = await db.collection("trips").get();
  const trips = tripsSnapshot.docs.map((doc) => doc.data());

  // Trips per day aggregation
  const tripsPerDay = {};
  trips.forEach((trip) => {
    // Assuming trip.startTimestamp is a Firestore Timestamp
    const date = trip.startTimestamp
      ? trip.startTimestamp.toDate().toISOString().slice(0, 10)
      : "Unknown";
    tripsPerDay[date] = (tripsPerDay[date] || 0) + 1;
  });

  const tripDates = Object.keys(tripsPerDay).sort();
  const tripCounts = tripDates.map((d) => tripsPerDay[d]);

  updateTripsChart(tripDates, tripCounts);

  // Vehicle usage aggregation
  const vehicleUsage = {};
  trips.forEach((trip) => {
    const vId = trip.vehicleId || "Unknown";
    vehicleUsage[vId] = (vehicleUsage[vId] || 0) + 1;
  });

  const vehicleLabels = Object.keys(vehicleUsage);
  const vehicleCounts = vehicleLabels.map((v) => vehicleUsage[v]);

  updateVehiclesChart(vehicleLabels, vehicleCounts);
}

function updateTripsChart(labels, data) {
  tripsChart.data.labels = labels;
  tripsChart.data.datasets[0].data = data;
  tripsChart.update();
}

function updateVehiclesChart(labels, data) {
  vehiclesChart.data.labels = labels;
  vehiclesChart.data.datasets[0].data = data;
  vehiclesChart.update();
}

// Optional: filter button event (hook this up if you want to filter by driver/date)
document.getElementById("filterBtn").addEventListener("click", () => {
  alert("Filtering feature coming soon!"); // placeholder
});
