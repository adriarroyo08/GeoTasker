import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

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
