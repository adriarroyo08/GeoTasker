import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Task, GeoLocation } from '../types';
import { DEFAULT_CENTER, DEFAULT_ICON, COMPLETED_ICON, TASK_CIRCLE_OPTIONS, PREVIEW_CIRCLE_OPTIONS, USER_ICON } from '../constants';
import { Loader2 } from 'lucide-react';
import { RecenterMap } from './RecenterMap';
import { MapEvents } from './MapEvents';
import { LocateControl } from './LocateControl';

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
    <div className={`h-full w-full overflow-hidden shadow-inner border relative ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200'}`}>
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