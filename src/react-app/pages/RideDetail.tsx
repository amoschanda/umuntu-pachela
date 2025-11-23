import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { useProfile } from "@/react-app/hooks/useProfile";
import { useRide } from "@/react-app/hooks/useRides";
import { useDriverLocation } from "@/react-app/hooks/useLocationTracking";
import { 
  MapPin, 
  MessageCircle, 
  Loader2, 
  DollarSign, 
  X,
  Send,
  ArrowLeft,
  CheckCircle,
  Star,
  CreditCard,
  Navigation
} from "lucide-react";
import type { RideMessage } from "@/shared/types";
import LiveLocationMap from "@/react-app/components/LiveLocationMap";
import RatingModal from "@/react-app/components/RatingModal";
import PaymentModal from "@/react-app/components/PaymentModal";

export default function RideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { ride, isLoading, refetch } = useRide(id);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<RideMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [driverPrice, setDriverPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { driverLocation } = useDriverLocation(ride?.driver_id || null, id);

  useEffect(() => {
    if (ride) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [ride]);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/rides/${id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      const response = await fetch(`/api/rides/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAcceptRide = async () => {
    if (!driverPrice || !id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rides/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_price: parseFloat(driverPrice) }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickup = async () => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rides/${id}/pickup`, {
        method: "POST",
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Error marking pickup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rides/${id}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Error completing ride:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm("Are you sure you want to cancel this ride?")) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rides/${id}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRating = async (rating: number, feedback: string) => {
    if (!id) return;

    const response = await fetch(`/api/rides/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feedback }),
    });

    if (response.ok) {
      refetch();
    }
  };

  if (!user || !profile) {
    navigate("/");
    return null;
  }

  if (isLoading || !ride) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  const isRider = profile.role === "rider";
  const isDriver = profile.role === "driver";
  const canAccept = isDriver && ride.status === "requested" && !ride.driver_id;
  const canPickup = isDriver && ride.status === "accepted" && ride.driver_id === user.id;
  const canComplete = isDriver && ride.status === "picked_up" && ride.driver_id === user.id;
  const canCancel = ride.status !== "completed" && ride.status !== "cancelled";
  const canRate = ride.status === "completed" && (
    (isRider && !ride.driver_rating) || 
    (isDriver && ride.driver_id === user.id && !ride.rider_rating)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(isRider ? "/rider" : "/driver")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Ride Details</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-3 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors relative"
                >
                  <MessageCircle className="w-6 h-6 text-amber-600" />
                  {messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {messages.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 mb-6">
              <LiveLocationMap
                pickupLocation={[ride.pickup_latitude, ride.pickup_longitude]}
                dropoffLocation={[ride.dropoff_latitude, ride.dropoff_longitude]}
                driverLocation={driverLocation ? [driverLocation.latitude, driverLocation.longitude] : null}
                showRoute={true}
              />
            </div>

            {driverLocation && ride.status !== "completed" && ride.status !== "cancelled" && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Driver Location</p>
                    <p className="text-sm text-gray-600">Updating every 5 seconds</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Pickup</p>
                  <p className="font-medium text-gray-900">{ride.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Dropoff</p>
                  <p className="font-medium text-gray-900">{ride.dropoff_address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{ride.status.replace("_", " ")}</p>
                </div>
                {(ride.rider_price || ride.final_price) && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="font-semibold text-amber-600 flex items-center">
                      <DollarSign className="w-5 h-5" />
                      {ride.final_price || ride.driver_price || ride.rider_price} ZMW
                    </p>
                  </div>
                )}
              </div>
            </div>

            {canAccept && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price (ZMW)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={driverPrice}
                    onChange={(e) => setDriverPrice(e.target.value)}
                    placeholder="Enter your price"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAcceptRide}
                    disabled={isSubmitting || !driverPrice}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept"}
                  </button>
                </div>
              </div>
            )}

            {canPickup && (
              <button
                onClick={handlePickup}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mb-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Pickup
                  </span>
                )}
              </button>
            )}

            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mb-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Ride
                  </span>
                )}
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
              >
                Cancel Ride
              </button>
            )}

            {canRate && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Rate {isRider ? "Driver" : "Rider"}
              </button>
            )}

            {ride.status === "completed" && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Ride Summary</h3>
                  <div className="space-y-2 text-sm">
                    {ride.final_price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Final Price</span>
                        <span className="font-semibold text-gray-900">{ride.final_price} ZMW</span>
                      </div>
                    )}
                    {ride.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium capitalize">{ride.payment_method.replace("_", " ")}</span>
                      </div>
                    )}
                    {isRider && ride.driver_rating && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Your Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{ride.driver_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {isDriver && ride.rider_rating && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Your Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{ride.rider_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isRider && ride.final_price && ride.payment_method !== "cash" && !ride.final_price && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay {ride.final_price} ZMW
                  </button>
                )}
              </div>
            )}
          </div>

          {showChat && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chat</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.sender_id === user.id
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}

          {showRatingModal && (
            <RatingModal
              onClose={() => setShowRatingModal(false)}
              onSubmit={handleRating}
              title={`Rate ${isRider ? "Driver" : "Rider"}`}
              subtitle="Help us improve the experience"
            />
          )}

          {showPaymentModal && ride.final_price && (
            <PaymentModal
              rideId={ride.id}
              amount={ride.final_price}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={() => {
                setShowPaymentModal(false);
                refetch();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
