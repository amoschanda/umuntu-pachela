import { useState, useEffect } from "react";
import { X, MapPin, Loader2, DollarSign, CreditCard, Wallet, Bike, Car, Clock, Star } from "lucide-react";
import MapView from "./MapView";

interface EnhancedRideRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  favoriteLocations?: Array<{ id: number; name: string; address: string; latitude: number; longitude: number }>;
}

const LUSAKA_CENTER: [number, number] = [-15.4167, 28.2833];

export default function EnhancedRideRequestModal({ 
  onClose, 
  onSuccess, 
  favoriteLocations = [] 
}: EnhancedRideRequestModalProps) {
  const [step, setStep] = useState<"location" | "options" | "price">("location");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number]>(LUSAKA_CENTER);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([-15.4200, 28.2900]);
  const [price, setPrice] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState(25);
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isPickingLocation, setIsPickingLocation] = useState<"pickup" | "dropoff" | null>(null);

  useEffect(() => {
    // Calculate suggested price based on distance
    const distance = calculateDistance(pickupCoords, dropoffCoords);
    const basePrice = 15;
    const pricePerKm = 5;
    const calculated = Math.round(basePrice + (distance * pricePerKm));
    setSuggestedPrice(calculated);
    setPrice(calculated.toString());
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickupCoords([position.coords.latitude, position.coords.longitude]);
          reverseGeocode(position.coords.latitude, position.coords.longitude, "pickup");
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coord2[0] - coord1[0]);
    const dLon = toRad(coord2[1] - coord1[1]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1[0])) *
        Math.cos(toRad(coord2[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const reverseGeocode = async (lat: number, lng: number, type: "pickup" | "dropoff") => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (type === "pickup") {
        setPickupAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setDropoffAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isPickingLocation === "pickup") {
      setPickupCoords([lat, lng]);
      reverseGeocode(lat, lng, "pickup");
      setIsPickingLocation(null);
    } else if (isPickingLocation === "dropoff") {
      setDropoffCoords([lat, lng]);
      reverseGeocode(lat, lng, "dropoff");
      setIsPickingLocation(null);
    }
  };

  const handleFavoriteSelect = (location: typeof favoriteLocations[0], type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickupCoords([location.latitude, location.longitude]);
      setPickupAddress(location.address);
    } else {
      setDropoffCoords([location.latitude, location.longitude]);
      setDropoffAddress(location.address);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_latitude: pickupCoords[0],
          pickup_longitude: pickupCoords[1],
          pickup_address: pickupAddress,
          dropoff_latitude: dropoffCoords[0],
          dropoff_longitude: dropoffCoords[1],
          dropoff_address: dropoffAddress,
          rider_price: parseFloat(price),
          vehicle_type: vehicleType,
          payment_method: paymentMethod,
          scheduled_time: isScheduled && scheduledTime ? scheduledTime : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ride");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to request ride. Please try again.");
      setIsSubmitting(false);
    }
  };

  const distance = calculateDistance(pickupCoords, dropoffCoords);
  const estimatedDuration = Math.round(distance * 3); // Rough estimate: 3 min per km

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Request a Ride</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex-1 h-1 rounded ${step === "location" ? "bg-amber-500" : "bg-gray-300"}`} />
            <div className={`flex-1 h-1 rounded ${step === "options" ? "bg-amber-500" : "bg-gray-300"}`} />
            <div className={`flex-1 h-1 rounded ${step === "price" ? "bg-amber-500" : "bg-gray-300"}`} />
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {step === "location" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <MapView
                    center={isPickingLocation === "dropoff" ? dropoffCoords : pickupCoords}
                    markers={[
                      { position: pickupCoords, label: "Pickup", color: "green" },
                      { position: dropoffCoords, label: "Dropoff", color: "red" },
                    ]}
                    onMapClick={handleMapClick}
                  />
                </div>
                {isPickingLocation && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-xl shadow-lg font-semibold flex items-center gap-2 animate-pulse">
                    <MapPin className="w-5 h-5" />
                    Click on the map to select {isPickingLocation} location
                  </div>
                )}
              </div>

              {favoriteLocations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Favorites</p>
                  <div className="flex gap-2 flex-wrap">
                    {favoriteLocations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleFavoriteSelect(loc, isPickingLocation || "dropoff")}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1 text-green-500" />
                  Pickup Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter pickup address"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPickingLocation(isPickingLocation === "pickup" ? null : "pickup")}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      isPickingLocation === "pickup"
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isPickingLocation === "pickup" ? "Tap Map" : "Pick on Map"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1 text-red-500" />
                  Dropoff Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter dropoff address"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPickingLocation(isPickingLocation === "dropoff" ? null : "dropoff")}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      isPickingLocation === "dropoff"
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isPickingLocation === "dropoff" ? "Tap Map" : "Pick on Map"}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-semibold text-gray-900">{distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Est. Duration</span>
                  <span className="font-semibold text-gray-900">{estimatedDuration} min</span>
                </div>
              </div>

              <button
                onClick={() => setStep("options")}
                disabled={!pickupAddress || !dropoffAddress}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue
              </button>
            </div>
          )}

          {step === "options" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleType("motorcycle")}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      vehicleType === "motorcycle"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Bike className={`w-8 h-8 ${vehicleType === "motorcycle" ? "text-amber-600" : "text-gray-600"}`} />
                    <span className="font-medium">Motorcycle</span>
                    <span className="text-xs text-gray-500">Fastest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType("car")}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      vehicleType === "car"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Car className={`w-8 h-8 ${vehicleType === "car" ? "text-amber-600" : "text-gray-600"}`} />
                    <span className="font-medium">Car</span>
                    <span className="text-xs text-gray-500">Comfortable</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === "cash"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <DollarSign className={`w-6 h-6 ${paymentMethod === "cash" ? "text-amber-600" : "text-gray-600"}`} />
                    <span className="text-sm font-medium">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mobile_money")}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === "mobile_money"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Wallet className={`w-6 h-6 ${paymentMethod === "mobile_money" ? "text-amber-600" : "text-gray-600"}`} />
                    <span className="text-sm font-medium">Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === "card"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-amber-600" : "text-gray-600"}`} />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Schedule for later</span>
                </label>
                {isScheduled && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("location")}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("price")}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "price" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                <p className="text-sm text-gray-600 mb-2">Suggested Price</p>
                <p className="text-4xl font-bold text-amber-600 mb-1">{suggestedPrice} ZMW</p>
                <p className="text-xs text-gray-500">Based on {distance.toFixed(1)} km distance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price Offer (ZMW)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your offer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drivers can accept or counter your offer
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">Ride Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium capitalize">{vehicleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium capitalize">{paymentMethod.replace("_", " ")}</span>
                </div>
                {isScheduled && scheduledTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Scheduled</span>
                    <span className="font-medium">{new Date(scheduledTime).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("options")}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !price}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Requesting...
                    </span>
                  ) : (
                    "Request Ride"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
