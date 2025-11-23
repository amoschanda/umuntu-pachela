import { useState, useEffect } from "react";
import type { UserProfile } from "@/shared/types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profiles/me");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return { profile, isLoading, updateProfile, refetch: fetchProfile };
}
