import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

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
