import { useState, useEffect } from "react";
import type { FavoriteLocation } from "@/shared/types";

export function useFavoriteLocations() {
  const [locations, setLocations] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/favorite-locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Error fetching favorite locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const addLocation = async (name: string, address: string, latitude: number, longitude: number) => {
    try {
      const response = await fetch("/api/favorite-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, latitude, longitude }),
      });

      if (response.ok) {
        await fetchLocations();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding favorite location:", error);
      return false;
    }
  };

  const deleteLocation = async (id: number) => {
    try {
      const response = await fetch(`/api/favorite-locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLocations();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting favorite location:", error);
      return false;
    }
  };

  return { locations, isLoading, addLocation, deleteLocation, refetch: fetchLocations };
}
