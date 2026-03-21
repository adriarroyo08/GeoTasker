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
  className: 'user-location-marker-container',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #3b82f6;
        border-radius: 50%;
        opacity: 0.4;
        animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background-color: #2563eb;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(0.5); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
