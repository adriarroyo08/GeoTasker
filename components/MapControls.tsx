import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Locate, Loader2 } from 'lucide-react';
import { getCurrentPositionWithFallback } from '../utils/geo';

// Helper to update map view when user location changes
export const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
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
export const MapEvents: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
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

// Helper to share geolocation options
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 10000
};

// Control to manually locate user
export const LocateControl: React.FC<{
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
      const pos = await getCurrentPositionWithFallback(GEOLOCATION_OPTIONS);
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
