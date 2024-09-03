import axios from 'axios';
import { BASE_URL } from './constants';

export async function pingSelf(url: string) {
  try {
    const { data } = await axios.get(url);
    console.log(`Server pinged successfully: ${data.message}`);
    return true;
  } catch (e: any) {
    console.error(`Error pinging server: ${e.message}`);
    return false;
  }
}

export function returnMailBody(
  email: string,
  firstName: string,
  lastName: string,
  newUserAgent: string
) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
  <h1>Unexpected Location or Device Alert</h1>
    <p>Hello ${firstName} ${lastName}</p>
    <p>Your account was logged into from a new location/device: ${newUserAgent}</p>
    <p>Ignore this message if it was you, click <a href="${BASE_URL}/disable/${email}">here</a> to temporarily disable your account</p>
  </body>
</html>
`;
}

// Haversine formula to calculatitudee distance between two points
const haversineDistance = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) => {
  const R = 6371; // Radius of Earth in km
  const dlatitude = (latitude2 - latitude1) * (Math.PI / 180);
  const dlongitude = (longitude2 - longitude1) * (Math.PI / 180);
  const a =
    Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2) +
    Math.cos(latitude1 * (Math.PI / 180)) *
      Math.cos(latitude2 * (Math.PI / 180)) *
      Math.sin(dlongitude / 2) *
      Math.sin(dlongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Check if a given point is within the geofence
export const isWithinGeofence = (
  prevLocation: { latitude: number; longitude: number },
  newLocation: { latitude: number; longitude: number }
) => {
  const geofenceRadius = 100; // Radius in km (example size of a state)
  const distance = haversineDistance(
    prevLocation.latitude,
    prevLocation.longitude,
    newLocation.latitude,
    newLocation.longitude
  );
  return distance <= geofenceRadius;
};
