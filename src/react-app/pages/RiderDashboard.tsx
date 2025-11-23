import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { useProfile } from "@/react-app/hooks/useProfile";
import { useRides } from "@/react-app/hooks/useRides";
import { useFavoriteLocations } from "@/react-app/hooks/useFavoriteLocations";
import { Plus, Loader2, LogOut, User } from "lucide-react";
import EnhancedRideRequestModal from "@/react-app/components/EnhancedRideRequestModal";
import RideCard from "@/react-app/components/RideCard";
import SafetyCard from "@/react-app/components/SafetyCard";
import WalletCard from "@/react-app/components/WalletCard";

export default function RiderDashboard() {
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { rides, isLoading: ridesLoading, refetch } = useRides();
  const { locations: favoriteLocations } = useFavoriteLocations();
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleEmergency = () => {
    if (confirm("Contact emergency services? This will dial 911.")) {
      window.location.href = "tel:911";
    }
  };

  const handleShareRide = () => {
    if (activeRide) {
      const message = `I'm on a ride with Umuntu Pachela. Track my ride: https://4mmjiwac3hi54.mocha.app/rides/${activeRide.id}`;
      if (navigator.share) {
        navigator.share({ title: "My Ride", text: message });
      } else {
        navigator.clipboard.writeText(message);
        alert("Ride link copied to clipboard!");
      }
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== "rider") {
    navigate("/");
    return null;
  }

  const activeRide = rides.find(r => 
    r.status === "requested" || r.status === "accepted" || r.status === "picked_up"
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.google_user_data.picture ? (
                  <img
                    src={user.google_user_data.picture}
                    alt={profile.full_name || "User"}
                    className="w-16 h-16 rounded-full mr-4 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  <p className="text-gray-600">Rider</p>
                  <p className="text-sm text-gray-500">{profile.total_rides} rides completed</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <WalletCard />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {activeRide && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-2">Active Ride</h2>
                <p className="mb-4">
                  {activeRide.status === "requested" && "Searching for a driver..."}
                  {activeRide.status === "accepted" && "Driver is on the way to pick you up"}
                  {activeRide.status === "picked_up" && "Ride in progress"}
                </p>
                <button
                  onClick={() => navigate(`/rides/${activeRide.id}`)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}
            <SafetyCard 
              rideId={activeRide?.id}
              onEmergency={handleEmergency}
              onShareRide={handleShareRide}
            />
          </div>

          {!activeRide && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all mb-6 flex items-center justify-center font-semibold text-lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Request a Ride
            </button>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rides</h2>
            {ridesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No rides yet. Request your first ride!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onClick={() => navigate(`/rides/${ride.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRequestModal && (
        <EnhancedRideRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={refetch}
          favoriteLocations={favoriteLocations}
        />
      )}
    </div>
  );
}
