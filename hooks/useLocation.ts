// hooks/useLocation.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get initial location immediately
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setLocation(currentLocation);
        console.log('Initial location:', currentLocation.coords);

        // Watch location updates with faster intervals
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest, // Maximum accuracy
            timeInterval: 100, // Update every 100ms (was 1000ms)
            distanceInterval: 0.1, // Update every 0.1m movement (was 1m)
          },
          (newLocation) => {
            setLocation(newLocation);
            console.log('Location updated:', {
              lat: newLocation.coords.latitude,
              lon: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
            });
          }
        );

        unsubscribe = subscription.remove;
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error('Location error:', error);
      }
    })();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { location, errorMsg };
};