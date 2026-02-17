import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocation, Task } from '../types';
import { calculateDistance } from '../utils/geo';

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
  const [locationError, setLocationError] = useState<string | null>(
    !navigator.geolocation ? "Geolocalización no soportada en este navegador." : null
  );
  const [triggeredTasks, setTriggeredTasks] = useState<Set<string>>(new Set());
  const [useHighAccuracy, setUseHighAccuracy] = useState(true);
  
  const userLocationRef = useRef<GeoLocation | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // Function to request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const triggerNotification = async (task: Task) => {
    if (Notification.permission !== 'granted') return;

    const title = `📍 ¡Llegaste a tu destino!`;
    const options: NotificationOptions & { vibrate?: number[] } = {
      body: `Estás cerca de: ${task.title}\n${task.description || ''}`,
      icon: '/images/marker-icon.png',
      badge: '/images/marker-icon.png',
      tag: `geofence-${task.id}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { taskId: task.id }
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, options);
          return;
        }
      }
    } catch (err) {
      console.warn('SW notification failed, falling back to window Notification', err);
    }

    new Notification(title, options);
  };

  // Monitor location and check geofences
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
        triggerNotification(task);
        setTriggeredTasks(prev => {
          const next = new Set(prev);
          next.add(task.id);
          return next;
        });
      }
    });
  }, [userLocation, tasks, triggeredTasks]);

  // Setup and manage location watcher
  useEffect(() => {
    requestNotificationPermission();

    if (!navigator.geolocation) return;

    const handleSuccess = (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 2000) return;
      
      lastUpdateRef.current = now;
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn(`Geolocation error (${error.code}): ${error.message}`);
      
      // If timeout (3) or unavailable (2) and using high accuracy, try fallback
      if ((error.code === 3 || error.code === 2) && useHighAccuracy) {
        setUseHighAccuracy(false);
        return;
      }

      // Only set UI error if we really don't have a location yet
      if (!userLocationRef.current) {
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
      // Determine options based on visibility and fallback state
      let options = LOW_ACCURACY_OPTIONS;
      if (!isHidden && useHighAccuracy) {
        options = HIGH_ACCURACY_OPTIONS;
      }
      
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
    // Removed userLocation from deps to prevent restart loop
  }, [requestNotificationPermission, useHighAccuracy]);

  return { 
    userLocation, 
    locationError, 
    updateLocation: (lat: number, lng: number) => setUserLocation({ lat, lng }) 
  };
};