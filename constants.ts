import L from 'leaflet';

// Fix for default Leaflet markers in React
// This ensures that any marker created without an explicit icon will use our local assets
// instead of trying to load from unpkg/CDN which might fail or be slow
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

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
