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
  className: 'custom-user-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  ">
    <div style="
      width: 100%;
      height: 100%;
      background-color: #3b82f6;
      border-radius: 50%;
      animation: pulse 2s infinite;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.5;
    "></div>
  </div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(3); opacity: 0; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
