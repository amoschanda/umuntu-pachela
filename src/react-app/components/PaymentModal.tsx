import { useState } from "react";
import { X, Loader2, Smartphone, Wallet, CheckCircle } from "lucide-react";
import { useWallet } from "@/react-app/hooks/useWallet";

interface PaymentModalProps {
  rideId: number;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ rideId, amount, onClose, onSuccess }: PaymentModalProps) {
  const [provider, setProvider] = useState<"airtel" | "mtn" | "zamtel" | "wallet">("wallet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { wallet, refetch: refetchWallet } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    if (provider === "wallet" && wallet && wallet.balance < amount) {
      setError("Insufficient wallet balance. Please add funds first.");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`/api/rides/${rideId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          phone_number: provider === "wallet" ? undefined : phoneNumber,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment processing failed");
      }

      setSuccess(true);
      await refetchWallet();
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment of {amount.toFixed(2)} ZMW has been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Make Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold text-amber-600">{amount.toFixed(2)} ZMW</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setProvider("wallet")}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  provider === "wallet"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Wallet className={`w-8 h-8 ${provider === "wallet" ? "text-amber-600" : "text-gray-600"}`} />
                <div>
                  <span className="text-sm font-medium block">Digital Wallet</span>
                  {wallet && (
                    <span className="text-xs text-gray-500">Balance: {wallet.balance.toFixed(2)} ZMW</span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setProvider("airtel")}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  provider === "airtel"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Smartphone className={`w-8 h-8 ${provider === "airtel" ? "text-red-600" : "text-gray-600"}`} />
                <span className="text-sm font-medium">Mobile Money</span>
              </button>
            </div>

            {provider !== "wallet" && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("mtn")}
                  className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    provider === "mtn"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${provider === "mtn" ? "text-yellow-600" : "text-gray-600"}`} />
                  <span className="text-sm font-medium">MTN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("zamtel")}
                  className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    provider === "zamtel"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${provider === "zamtel" ? "text-blue-600" : "text-gray-600"}`} />
                  <span className="text-sm font-medium">Zamtel</span>
                </button>
              </div>
            )}
          </div>

          {provider !== "wallet" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0977123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {provider === "wallet" && wallet && wallet.balance < amount && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
              Insufficient balance. Please add funds to your wallet or choose another payment method.
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </span>
            ) : (
              `Pay ${amount.toFixed(2)} ZMW`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
