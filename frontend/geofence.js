// Haversine formula to calculate distance between two points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Define the geofence center (latitude and longitude) and radius
const geofenceCenter = {
  latitude: 4.8472226,
  longitude: 6.974604,
};
const geofenceRadius = 100; // Radius in km (example size of a state)

// Check if a given point is within the geofence
const isWithinGeofence = (lat, lon) => {
  const distance = haversineDistance(
    geofenceCenter.latitude,
    geofenceCenter.longitude,
    lat,
    lon
  );
  return distance <= geofenceRadius;
};

// Example user location
const userLocation = {
  latitude: 4.855, // Replace with actual latitude
  longitude: 6.97, // Replace with actual longitude
};

// Trigger some task if the user is outside the geofence
const checkGeofence = (longitude, latitude) => {
  if (isWithinGeofence(latitude, longitude)) {
    console.log('The user is within the geofence area.');
  } else {
    console.log(
      'The user is outside the geofence area. Performing the task...'
    );
    // Perform your task here
  }
};

// Run the check
checkGeofence(userLocation.longitude, userLocation.latitude);
