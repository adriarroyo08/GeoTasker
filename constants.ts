import L from 'leaflet';

// Fix for default Leaflet markers in React
// Using local assets for production readiness and offline support
export const DEFAULT_ICON = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const COMPLETED_ICON = L.icon({
  iconUrl: '/images/marker-icon-green.png',
  shadowUrl: '/images/marker-shadow.png', // Using the same shadow is fine
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 }; // Madrid by default
export const DEFAULT_RADIUS = 200; // meters

export const NOTIFICATION_ICON_PATH = '/images/marker-icon.png';
