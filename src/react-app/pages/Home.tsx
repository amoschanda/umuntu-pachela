import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Bike, MapPin, MessageCircle, Loader2 } from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      checkProfile();
    }
  }, [isPending, user]);

  const checkProfile = async () => {
    try {
      const response = await fetch("/api/profiles/me");
      if (response.ok) {
        const profile = await response.json();
        if (profile.role === "rider") {
          navigate("/rider");
        } else {
          navigate("/driver");
        }
      } else if (response.status === 404) {
        navigate("/role-selection");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-xl mb-6 transform hover:scale-105 transition-transform">
              <Bike className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Umuntu Pachela
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Fast, affordable motorcycle rides at your fingertips
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
                <p className="text-gray-600">Track your ride in real-time on the map</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Chat</h3>
                <p className="text-gray-600">Communicate with your driver instantly</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
                  <Bike className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Rides</h3>
                <p className="text-gray-600">Get picked up within minutes</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={redirectToLogin}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="text-center text-gray-600">
            <p>Available for riders and drivers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
