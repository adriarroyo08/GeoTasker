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
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  ">
    <div style="
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #3b82f6;
      border-radius: 50%;
      animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
      z-index: -1;
    "></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Adding styles to head for the pulse animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

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
