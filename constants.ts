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

export const COMPLETED_ICON = L.icon({
  iconUrl: '/images/marker-icon-green.png',
  shadowUrl: '/images/marker-shadow.png', // Using the same shadow is fine
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const USER_ICON = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    background-color: #3b82f6;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    position: relative;
    top: -10px;
    left: -10px;
  "><div style="
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: #3b82f6;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: user-marker-pulse 2s infinite;
    opacity: 0.5;
    z-index: -1;
  "></div></div>`,
  iconSize: [0, 0], // The CSS handles the visual size and centering
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
