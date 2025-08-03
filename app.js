
// --- Firebase config & initialization ---
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // add other keys as needed
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- Google Map variables ---
let map;
const tripPolylines = [];
const tripMarkers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -24.654, lng: 25.912 },
    zoom: 8,
  });
}

// --- Clear markers and polylines ---
function clearMapMarkersAndRoutes() {
  tripMarkers.forEach(marker => marker.setMap(null));
  tripMarkers.length = 0;

  tripPolylines.forEach(polyline => polyline.setMap(null));
  tripPolylines.length = 0;
}

// --- Add markers ---
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
    tripMarkers.push(endMarker);
  }
}

// --- Draw polyline for trip route ---
function drawTripRoute(locations) {
  if (!locations.length) return;

  const path = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));

  const tripPath = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: '#007bff',
    strokeOpacity: 0.8,
    strokeWeight: 4,
  });

  tripPath.setMap(map);
  tripPolylines.push(tripPath);
}

// --- Firestore queries ---
async function getTripsFiltered(driverId, vehicleId, startDate, endDate) {
  let query = db.collection('trips').orderBy('startTimestamp', 'desc');

  if (driverId) query = query.where('driverId', '==', driverId);
  if (vehicleId) query = query.where('vehicleId', '==', vehicleId);
  if (startDate) query = query.where('startTimestamp', '>=', startDate);
  if (endDate) query = query.where('startTimestamp', '<=', endDate);

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getTripLocations(tripId) {
  const locationsSnapshot = await db.collection('trips')
    .doc(tripId)
    .collection('locations')
    .orderBy('timestamp')
    .get();

  return locationsSnapshot.docs.map(doc => doc.data());
}

// --- Load drivers & vehicles for autocomplete ---
async function loadDrivers() {
  const snapshot = await db.collection('drivers').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function loadVehicles() {
  const snapshot = await db.collection('vehicles').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Initialize Awesomplete ---
async function initAwesomplete() {
  const drivers = await loadDrivers();
  const vehicles = await loadVehicles();

  const driverList = drivers.map(d => d.name || d.id);
  const vehicleList = vehicles.map(v => v.plateNumber || v.id);

  const driverInput = document.getElementById('driverInput');
  const vehicleInput = document.getElementById('vehicleInput');

  new Awesomplete(driverInput, {
    list: driverList,
    minChars: 1,
    maxItems: 10,
    autoFirst: true,
  });

  new Awesomplete(vehicleInput, {
    list: vehicleList,
    minChars: 1,
    maxItems: 10,
    autoFirst: true,
  });

  // Maps name/plate to IDs
  window.driverMap = {};
  drivers.forEach(d => window.driverMap[d.name || d.id] = d.id);

  window.vehicleMap = {};
  vehicles.forEach(v => window.vehicleMap[v.plateNumber || v.id] = v.id);
}

// --- FirebaseUI Auth setup ---
const ui = new firebaseui.auth.AuthUI(auth);

const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('dashboard-container').style.display = 'block';
      initMap();
      initAwesomplete();
      return false;
    }
  },
  signInFlow: 'popup',
};

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    initMap();
    initAwesomplete();
  } else {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
    ui.start('#firebaseui-auth-container', uiConfig);
  }
});

// --- Filter button event handler ---
document.getElementById('filterBtn').addEventListener('click', async () => {
  const driverName = document.getElementById('driverInput').value.trim();
  const vehiclePlate = document.getElementById('vehicleInput').value.trim();
  const startDateVal = document.getElementById('startDateInput').value;
  const endDateVal = document.getElementById('endDateInput').value;

  const driverId = window.driverMap[driverName] || null;
  const vehicleId = window.vehicleMap[vehiclePlate] || null;
  const startDate = startDateVal ? new Date(startDateVal) : null;
  const endDate = endDateVal ? new Date(endDateVal) : null;

  const trips = await getTripsFiltered(driverId, vehicleId, startDate, endDate);

  clearMapMarkersAndRoutes();

  for (const trip of trips) {
    addTripMarkers(trip);
    const locations = await getTripLocations(trip.id);
    drawTripRoute(locations);
  }
});
