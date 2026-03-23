import L from 'leaflet';

// Fix for default Leaflet markers in React
// Using local assets for production readiness and offline support
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

export const DEFAULT_ICON = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const USER_ICON = L.divIcon({
  className: 'custom-user-icon',
  html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(37,99,235,0.8)] relative before:content-[''] before:absolute before:inset-0 before:bg-blue-600 before:rounded-full before:animate-ping before:opacity-75"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
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

export const TASK_CIRCLE_OPTIONS = {
  color: '#3b82f6',
  fillColor: '#3b82f6',
  fillOpacity: 0.1,
  weight: 1
};

export const PREVIEW_CIRCLE_OPTIONS = {
  color: '#0ea5e9',
  fillColor: '#0ea5e9',
  fillOpacity: 0.2,
  weight: 2,
  dashArray: '5, 10'
};
