import { MapPin, Clock, DollarSign } from "lucide-react";
import type { Ride } from "@/shared/types";

interface RideCardProps {
  ride: Ride;
  onClick: () => void;
}

const statusColors = {
  requested: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  picked_up: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  requested: "Requested",
  accepted: "Accepted",
  picked_up: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function RideCard({ ride, onClick }: RideCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-5 text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ride.status]}`}>
          {statusLabels[ride.status]}
        </span>
        {ride.rider_price && (
          <div className="flex items-center text-amber-600 font-semibold">
            <DollarSign className="w-4 h-4 mr-1" />
            {ride.final_price || ride.driver_price || ride.rider_price} ZMW
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="text-sm font-medium text-gray-900">{ride.pickup_address}</p>
          </div>
        </div>

        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Dropoff</p>
            <p className="text-sm font-medium text-gray-900">{ride.dropoff_address}</p>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-500 pt-2">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(ride.created_at).toLocaleString()}
        </div>
      </div>
    </button>
  );
}
