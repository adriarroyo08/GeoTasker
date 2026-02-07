import { useState, useEffect, useRef } from 'react';
import { GeoLocation, Task } from '../types';
import { calculateDistance } from '../utils/geo';
import { useNotifications } from './useNotifications';

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 5000
};

const LOW_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 30000,
  maximumAge: 60000
};

export const useGeofencing = (tasks: Task[]) => {
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [triggeredTasks, setTriggeredTasks] = useState<Set<string>>(new Set());
  const [useHighAccuracy, setUseHighAccuracy] = useState(true);
  
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const hasLocationRef = useRef(false);

  const { sendNotification } = useNotifications();

  // Check geofences when location or tasks change
  useEffect(() => {
    if (!userLocation) return;

    tasks.forEach(task => {
      if (task.isCompleted || !task.location || triggeredTasks.has(task.id)) return;

      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        task.location.lat, 
        task.location.lng
      );

      if (distance <= task.radius) {
        const title = `📍 ¡Llegaste a tu destino!`;
        const options = {
          body: `Estás cerca de: ${task.title}\n${task.description || ''}`,
          icon: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          badge: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          tag: `geofence-${task.id}`,
          renotify: true,
          vibrate: [200, 100, 200],
          data: { taskId: task.id }
        };

        sendNotification(title, options);

        setTriggeredTasks(prev => {
          const next = new Set(prev);
          next.add(task.id);
          return next;
        });
      }
    });
  }, [userLocation, tasks, triggeredTasks, sendNotification]);

  // Geolocation watcher logic
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada en este navegador.");
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 2000) return;
      
      lastUpdateRef.current = now;
      hasLocationRef.current = true;

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn(`Geolocation error (${error.code}): ${error.message}`);
      
      if ((error.code === 3 || error.code === 2) && useHighAccuracy) {
        console.log("High accuracy failed, falling back to low accuracy...");
        setUseHighAccuracy(false);
        return;
      }

      if (!hasLocationRef.current) {
        let msg = "No se pudo obtener la ubicación.";
        if (error.code === 1) msg = "Permiso de ubicación denegado.";
        if (error.code === 3) msg = "Tiempo de espera agotado. Muévete a un área despejada.";
        setLocationError(msg);
      }
    };

    const startWatcher = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      const isHidden = document.visibilityState === 'hidden';
      let options = LOW_ACCURACY_OPTIONS;
      if (!isHidden && useHighAccuracy) {
        options = HIGH_ACCURACY_OPTIONS;
      }
      
      console.log(`[GeoTasker] Tracker started. Hidden: ${isHidden}, HighAcc: ${options.enableHighAccuracy}`);
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    };

    startWatcher();

    const handleVisibilityChange = () => {
      startWatcher();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [useHighAccuracy]);

  return { 
    userLocation, 
    locationError, 
    updateLocation: (lat: number, lng: number) => setUserLocation({ lat, lng }) 
  };
};
