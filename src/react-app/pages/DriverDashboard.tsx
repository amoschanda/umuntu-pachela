import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { useProfile } from "@/react-app/hooks/useProfile";
import { useRides, useAvailableRides } from "@/react-app/hooks/useRides";
import { useEarnings } from "@/react-app/hooks/useEarnings";
import { useLocationTracking } from "@/react-app/hooks/useLocationTracking";
import { Loader2, LogOut, User, ToggleLeft, ToggleRight, Bike, Navigation } from "lucide-react";
import RideCard from "@/react-app/components/RideCard";
import EarningsCard from "@/react-app/components/EarningsCard";
import WalletCard from "@/react-app/components/WalletCard";

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { rides, isLoading: ridesLoading } = useRides();
  const { rides: availableRides, isLoading: availableLoading } = useAvailableRides();
  const { earnings, isLoading: earningsLoading } = useEarnings();
  const navigate = useNavigate();
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  
  // Enable live location tracking when driver is available
  const { location: currentLocation } = useLocationTracking(
    profile?.is_available === 1 || false,
    10000
  );

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

  if (!profile || profile.role !== "driver") {
    navigate("/");
    return null;
  }

  const activeRide = rides.find(r => 
    r.status === "accepted" || r.status === "picked_up"
  );

  const handleToggleAvailability = async () => {
    setIsTogglingAvailability(true);
    try {
      await updateProfile({ is_available: profile.is_available ? 0 : 1 });
    } catch (error) {
      console.error("Error toggling availability:", error);
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {user.google_user_data.picture ? (
                  <img
                    src={user.google_user_data.picture}
                    alt={profile.full_name || "Driver"}
                    className="w-16 h-16 rounded-full mr-4 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  <p className="text-gray-600">Driver</p>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center">
                  <Bike className="w-5 h-5 text-gray-700 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">{profile.vehicle_type}</p>
                    <p className="text-sm text-gray-600">{profile.vehicle_plate} • {profile.vehicle_color}</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleAvailability}
                  disabled={isTogglingAvailability || !!activeRide}
                  className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all ${
                    profile.is_available
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {profile.is_available ? (
                    <>
                      <ToggleRight className="w-5 h-5 mr-2" />
                      Available
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 mr-2" />
                      Offline
                    </>
                  )}
                </button>
              </div>

              {profile.is_available === 1 && currentLocation && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Live Location Active</p>
                    <p className="text-xs text-gray-600">
                      {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {!activeRide && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {!earningsLoading && <EarningsCard earnings={earnings} />}
              <WalletCard />
            </div>
          )}

          {activeRide && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl shadow-xl p-6 mb-6 text-white">
              <h2 className="text-xl font-bold mb-2">Active Ride</h2>
              <p className="mb-4">
                {activeRide.status === "accepted" && "Heading to pick up passenger"}
                {activeRide.status === "picked_up" && "Ride in progress"}
              </p>
              <button
                onClick={() => navigate(`/rides/${activeRide.id}`)}
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                View Details
              </button>
            </div>
          )}

          {!activeRide && profile.is_available && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Rides</h2>
              {availableLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                </div>
              ) : availableRides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No rides available at the moment. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onClick={() => navigate(`/rides/${ride.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rides</h2>
            {ridesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No rides yet. Accept a ride to get started!</p>
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
    </div>
  );
}
