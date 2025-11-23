import { useState, useEffect } from "react";
import type { Wallet, WalletTransaction } from "@/shared/types";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/wallet");
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const addFunds = async (amount: number) => {
    try {
      const response = await fetch("/api/wallet/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (response.ok) {
        await fetchWallet();
        await fetchTransactions();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding funds:", error);
      return false;
    }
  };

  return { wallet, transactions, isLoading, addFunds, refetch: fetchWallet };
}
