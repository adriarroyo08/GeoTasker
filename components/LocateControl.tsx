import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Locate, Loader2 } from 'lucide-react';

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 10000
};

interface LocateControlProps {
  onFound: (lat: number, lng: number) => void;
  selectingLocation?: boolean;
  isDarkMode?: boolean;
}

export const LocateControl: React.FC<LocateControlProps> = ({ onFound, selectingLocation, isDarkMode }) => {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);

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
        if (err.code === 3) {
           console.warn("El GPS tardó demasiado. Intenta moverte a un lugar despejado o espera un momento.");
        } else {
           console.warn("No se pudo obtener la ubicación actual.");
        }
      },
      GEOLOCATION_OPTIONS
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
