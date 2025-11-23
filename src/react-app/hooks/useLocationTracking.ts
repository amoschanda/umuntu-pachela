import { useState, useEffect } from "react";

export function useLocationTracking(isDriver: boolean, updateInterval = 10000) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDriver || !navigator.geolocation) {
      return;
    }

    const updateLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      // Update server with driver's current location
      try {
        await fetch("/api/profiles/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_latitude: latitude,
            current_longitude: longitude,
          }),
        });
      } catch (err) {
        console.error("Error updating location:", err);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
    };

    // Get initial location
    navigator.geolocation.getCurrentPosition(updateLocation, handleError);

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });

    // Also set interval for server updates
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(updateLocation, handleError);
    }, updateInterval);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [isDriver, updateInterval]);

  return { location, error };
}

export function useDriverLocation(driverId: string | null, rideId: string | undefined) {
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!driverId || !rideId) {
      setIsLoading(false);
      return;
    }

    const fetchDriverLocation = async () => {
      try {
        const response = await fetch(`/api/rides/${rideId}/driver-location`);
        if (response.ok) {
          const data = await response.json();
          setDriverLocation(data);
        }
      } catch (error) {
        console.error("Error fetching driver location:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverLocation();
    const interval = setInterval(fetchDriverLocation, 5000);

    return () => clearInterval(interval);
  }, [driverId, rideId]);

  return { driverLocation, isLoading };
}
