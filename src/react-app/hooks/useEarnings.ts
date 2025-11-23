import { useState, useEffect } from "react";

interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  totalRides: number;
}

export function useEarnings() {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: 0,
    week: 0,
    month: 0,
    totalRides: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings");
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return { earnings, isLoading, refetch: fetchEarnings };
}
