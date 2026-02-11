import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Task, GeoLocation } from '../types';
import { DEFAULT_CENTER, DEFAULT_ICON, COMPLETED_ICON } from '../constants';
import { Locate, Loader2 } from 'lucide-react';
import L from 'leaflet';

interface MapViewProps {
  tasks: Task[];
  userLocation: GeoLocation | null;
  onMapClick?: (lat: number, lng: number) => void;
  selectingLocation?: boolean;
  onUserLocationUpdate?: (lat: number, lng: number) => void;
  previewLocation?: GeoLocation | null;
  previewRadius?: number;
  isDarkMode?: boolean;
}

// Helper to handle clicks
const MapEvents: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.on('click', (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    });
    return () => { map.off('click'); };
  }, [map, onClick]);
  return null;
};

// Control to manually locate user
const LocateControl: React.FC<{ 
  onFound: (lat: number, lng: number) => void; 
  selectingLocation?: boolean;
  isDarkMode?: boolean;
}> = ({ onFound, selectingLocation, isDarkMode }) => {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // 20s timeout
      maximumAge: 10000 // Accept cache
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);
        onFound(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        // Retry with lower accuracy if timeout
        if (err.code === 3) {
           alert("El GPS tardó demasiado. Intenta moverte a un lugar despejado o espera un momento.");
        } else {
           alert("No se pudo obtener la ubicación actual.");
        }
      },
      options
    );
  };

  return (
    <div className="absolute bottom-6 right-4 z-[1000]">
      <button
        onClick={handleClick}
        className={`p-3 rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 ${
          selectingLocation 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : isDarkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title="Usar mi ubicación actual"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : <Locate size={24} />}
        {selectingLocation && <span className="font-medium pr-1">Usar mi ubicación</span>}
      </button>
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = ({ 
  tasks, 
  userLocation, 
  onMapClick, 
  selectingLocation, 
  onUserLocationUpdate,
  previewLocation,
  previewRadius = 200,
  isDarkMode = false
}) => {
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

  const tileUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDarkMode 
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={`h-full w-full rounded-xl overflow-hidden shadow-inner border relative ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200'}`}>
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={DEFAULT_ICON}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
          </>
        )}

        {/* Existing Tasks */}
        {tasks.map((task) => (
          task.location && (
            <React.Fragment key={task.id}>
              <Marker 
                position={[task.location.lat, task.location.lng]}
                icon={task.isCompleted ? COMPLETED_ICON : DEFAULT_ICON}
                opacity={task.isCompleted ? 0.6 : 1}
              >
                <Popup>
                  <strong>{task.title}</strong><br/>
                  {task.description}
                </Popup>
              </Marker>
              {!task.isCompleted && (
                 <Circle 
                 center={[task.location.lat, task.location.lng]}
                 radius={task.radius}
                 pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
               />
              )}
            </React.Fragment>
          )
        ))}

        {/* Selection Preview */}
        {previewLocation && selectingLocation && (
          <>
            <Marker position={[previewLocation.lat, previewLocation.lng]} icon={DEFAULT_ICON} />
            <Circle 
              center={[previewLocation.lat, previewLocation.lng]}
              radius={previewRadius}
              pathOptions={{ 
                color: '#0ea5e9', 
                fillColor: '#0ea5e9', 
                fillOpacity: 0.2, 
                weight: 2, 
                dashArray: '5, 10' 
              }}
            />
          </>
        )}

        {onMapClick && selectingLocation && (
          <MapEvents onClick={onMapClick} />
        )}
        
        <LocateControl 
          selectingLocation={selectingLocation}
          isDarkMode={isDarkMode}
          onFound={(lat, lng) => {
            if (onUserLocationUpdate) onUserLocationUpdate(lat, lng);
            if (selectingLocation && onMapClick) onMapClick(lat, lng);
          }} 
        />
      </MapContainer>
      
      {selectingLocation && !previewLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold animate-bounce pointer-events-none">
          Toca el mapa para seleccionar ubicación
        </div>
      )}

      {selectingLocation && previewLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold pointer-events-none flex items-center gap-2">
          <span>Ubicación marcada</span>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
    </div>
  );
};