/**
 * Calculates the distance between two coordinates in meters.
 * Uses the Haversine formula.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const getCurrentPositionWithFallback = (): Promise<GeolocationPosition> => {
  const HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000
  };

  const LOW_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 30000,
    maximumAge: 60000
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocalización no soportada en este navegador."));
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        if (err.code === 1) {
          // Permission denied, fallback is useless
          return reject(err);
        }

        console.warn("High accuracy failed, falling back to low accuracy...", err);
        if (err.code === 3 || err.code === 2) {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            LOW_ACCURACY_OPTIONS
          );
        } else {
          reject(err);
        }
      },
      HIGH_ACCURACY_OPTIONS
    );
  });
};