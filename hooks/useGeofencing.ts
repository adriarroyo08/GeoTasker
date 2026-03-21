import { useState, useEffect, useRef } from 'react';
import { GeoLocation, Task } from '../types';
import { calculateDistance } from '../utils/geo';
import { requestNotificationPermission, triggerGeofenceNotification } from '../utils/notifications';

// Strategies for location tracking
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000, // Increased to 20s
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
  const [triggeredTasks, setTriggeredTasks] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('geotasker_triggered');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [useHighAccuracy, setUseHighAccuracy] = useState(true);
  
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const userLocationRef = useRef<GeoLocation | null>(null);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const checkGeofences = () => {
    if (!userLocation) return;
    tasks.forEach(task => {
      if (task.isCompleted || !task.location || triggeredTasks.has(task.id)) return;
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        task.location.lat, task.location.lng
      );
      if (distance <= task.radius) {
        triggerGeofenceNotification(task);
        setTriggeredTasks(prev => {
          const next = new Set(prev);
          next.add(task.id);
          return next;
        });
      }
    });
  };

  useEffect(() => {
    checkGeofences();
  }, [userLocation, tasks, triggeredTasks]);

  useEffect(() => {
    localStorage.setItem('geotasker_triggered', JSON.stringify(Array.from(triggeredTasks)));
  }, [triggeredTasks]);

  const handleLocationSuccess = (position: GeolocationPosition) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 2000) return;
    lastUpdateRef.current = now;
    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    setLocationError(null);
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    console.warn(`Geolocation error (${error.code}): ${error.message}`);
    if ((error.code === 3 || error.code === 2) && useHighAccuracy) {
      console.log("High accuracy failed, falling back to low accuracy...");
      setUseHighAccuracy(false);
      return;
    }
    if (!userLocationRef.current) {
      let msg = "No se pudo obtener la ubicación.";
      if (error.code === 1) msg = "Permiso de ubicación denegado.";
      if (error.code === 3) msg = "Tiempo de espera agotado. Muévete a un área despejada.";
      setLocationError(msg);
    }
  };

  const startWatcher = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    const isHidden = document.visibilityState === 'hidden';
    const options = (!isHidden && useHighAccuracy) ? HIGH_ACCURACY_OPTIONS : LOW_ACCURACY_OPTIONS;
    console.log(`[GeoTasker] Tracker started. Hidden: ${isHidden}, HighAcc: ${options.enableHighAccuracy}`);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess, handleLocationError, options
    );
  };

  useEffect(() => {
    requestNotificationPermission();
    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada en este navegador.");
      return;
    }
    startWatcher();
    const handleVisibilityChange = () => startWatcher();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [useHighAccuracy]);

  return { 
    userLocation, 
    locationError, 
    updateLocation: (lat: number, lng: number) => setUserLocation({ lat, lng }) 
  };
};
