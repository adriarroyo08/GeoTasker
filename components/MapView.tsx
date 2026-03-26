import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Task, GeoLocation } from '../types';
import { DEFAULT_CENTER, DEFAULT_ICON, COMPLETED_ICON, TASK_CIRCLE_OPTIONS, PREVIEW_CIRCLE_OPTIONS, USER_ICON } from '../constants';
import { getCurrentPositionWithFallback } from '../utils/geo';
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

// Helper to update map view when user location changes
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  const hasCentered = useRef(false);
  useEffect(() => {
    if (!hasCentered.current) {
      map.setView(center, map.getZoom());
      hasCentered.current = true;
    }
  }, [center, map]);
  return null;
};

// Helper to handle clicks
const MapEvents: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handler = (e: any) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
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

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);

    try {
      const pos = await getCurrentPositionWithFallback();
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 16);
      onFound(latitude, longitude);
    } catch (err: any) {
      console.error(err);
      if (err.code === 3) {
         console.warn("El GPS tardó demasiado. Intenta moverte a un lugar despejado o espera un momento.");
      } else {
         console.warn("No se pudo obtener la ubicación actual.");
      }
    } finally {
      setLoading(false);
    }
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
      {!userLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full shadow-lg text-sm font-semibold pointer-events-none flex items-center gap-2 border dark:border-gray-700">
          <Loader2 className="animate-spin text-blue-500" size={16} />
          <span>Obteniendo tu ubicación...</span>
        </div>
      )}
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
            <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
            <RecenterMap center={[userLocation.lat, userLocation.lng]} />
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
                 pathOptions={TASK_CIRCLE_OPTIONS}
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
              pathOptions={PREVIEW_CIRCLE_OPTIONS}
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
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold animate-bounce pointer-events-none">
          Toca el mapa para seleccionar ubicación
        </div>
      )}

      {selectingLocation && previewLocation && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold pointer-events-none flex items-center gap-2">
          <span>Ubicación marcada</span>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
    </div>
  );
};