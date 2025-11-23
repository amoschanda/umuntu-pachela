import { useState, useEffect } from "react";
import type { Ride } from "@/shared/types";

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const response = await fetch("/api/rides");
      if (response.ok) {
        const data = await response.json();
        setRides(data);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return { rides, isLoading, refetch: fetchRides };
}

export function useAvailableRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const response = await fetch("/api/rides/available");
      if (response.ok) {
        const data = await response.json();
        setRides(data);
      }
    } catch (error) {
      console.error("Error fetching available rides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, []);

  return { rides, isLoading, refetch: fetchRides };
}

export function useRide(rideId: string | undefined) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRide = async () => {
    if (!rideId) return;
    try {
      const response = await fetch(`/api/rides/${rideId}`);
      if (response.ok) {
        const data = await response.json();
        setRide(data);
      }
    } catch (error) {
      console.error("Error fetching ride:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  return { ride, isLoading, refetch: fetchRide };
}
