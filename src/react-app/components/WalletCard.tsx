import { useState } from "react";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useWallet } from "@/react-app/hooks/useWallet";

export default function WalletCard() {
  const { wallet, transactions, isLoading, addFunds } = useWallet();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const success = await addFunds(parseFloat(amount));
    if (success) {
      setAmount("");
      setShowAddFunds(false);
    }
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Your Wallet</h3>
          </div>
          <button
            onClick={() => setShowAddFunds(!showAddFunds)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-4xl font-bold">{wallet?.balance.toFixed(2) || "0.00"} ZMW</p>
        <p className="text-sm text-white/80 mt-1">Available Balance</p>
      </div>

      {showAddFunds && (
        <div className="p-6 bg-amber-50 border-t border-amber-200">
          <form onSubmit={handleAddFunds} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Funds (ZMW)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmount("50")}
                className="flex-1 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => setAmount("100")}
                className="flex-1 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                +100
              </button>
              <button
                type="button"
                onClick={() => setAmount("200")}
                className="flex-1 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                +200
              </button>
            </div>
            <button
              type="submit"
              disabled={isAdding || !amount}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add Funds"}
            </button>
          </form>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {tx.transaction_type === "credit" || tx.transaction_type === "ride_earning" ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.description || tx.transaction_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.transaction_type === "credit" || tx.transaction_type === "ride_earning"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {tx.transaction_type === "credit" || tx.transaction_type === "ride_earning" ? "+" : "-"}
                  {tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
