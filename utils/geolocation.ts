export const getCurrentPositionWithFallback = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        if (error.code === 1) {
          // Permission denied, immediate reject
          reject(error);
          return;
        }

        // Fallback to low accuracy
        navigator.geolocation.getCurrentPosition(
          (fallbackPosition) => resolve(fallbackPosition),
          (fallbackError) => reject(fallbackError),
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  });
};
