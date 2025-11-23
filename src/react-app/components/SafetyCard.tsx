import { Shield, Phone, AlertCircle, Share2 } from "lucide-react";

interface SafetyCardProps {
  rideId?: number;
  onEmergency: () => void;
  onShareRide: () => void;
}

export default function SafetyCard({ rideId, onEmergency, onShareRide }: SafetyCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Safety Center</h2>
          <p className="text-sm opacity-90">Your safety is our priority</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onShareRide}
          disabled={!rideId}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 transition-colors disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">Share Ride</p>
            <p className="text-xs opacity-75">Share trip details with contacts</p>
          </div>
        </button>

        <button
          onClick={onEmergency}
          className="w-full bg-red-500 hover:bg-red-600 rounded-2xl p-4 flex items-center gap-3 transition-colors shadow-lg"
        >
          <AlertCircle className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">Emergency SOS</p>
            <p className="text-xs opacity-90">Contact emergency services</p>
          </div>
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Emergency Hotline</p>
              <p className="text-sm opacity-90">911 or +260-XXX-XXXX</p>
              <p className="text-xs opacity-75 mt-2">Available 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
