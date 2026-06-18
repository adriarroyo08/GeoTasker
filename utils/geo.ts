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

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000
};

const LOW_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 60000
};

/**
 * Gets the current geolocation using a Promise.
 * It first attempts high accuracy, and falls back to low accuracy if it times out or fails.
 */
export const getCurrentPositionWithFallback = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada en este navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (highError) => {
        console.warn(`Alta precisión falló (${highError.code}: ${highError.message}). Intentando baja precisión...`);
        // Fallback to low accuracy
        navigator.geolocation.getCurrentPosition(
          resolve,
          (lowError) => {
            reject(lowError);
          },
          LOW_ACCURACY_OPTIONS
        );
      },
      HIGH_ACCURACY_OPTIONS
    );
  });
};