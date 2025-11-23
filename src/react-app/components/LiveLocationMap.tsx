import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom driver icon
const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LiveLocationMapProps {
  pickupLocation: [number, number];
  dropoffLocation: [number, number];
  driverLocation?: [number, number] | null;
  riderLocation?: [number, number] | null;
  showRoute?: boolean;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function LiveLocationMap({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  riderLocation,
  showRoute = true,
}: LiveLocationMapProps) {
  const [center, setCenter] = useState<[number, number]>(pickupLocation);

  useEffect(() => {
    if (driverLocation) {
      setCenter(driverLocation);
    } else if (riderLocation) {
      setCenter(riderLocation);
    }
  }, [driverLocation, riderLocation]);

  const routePoints = driverLocation
    ? [driverLocation, pickupLocation, dropoffLocation]
    : [pickupLocation, dropoffLocation];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} />

      {/* Pickup marker */}
      <Marker position={pickupLocation}>
        <Popup>Pickup Location</Popup>
      </Marker>

      {/* Dropoff marker */}
      <Marker position={dropoffLocation}>
        <Popup>Dropoff Location</Popup>
      </Marker>

      {/* Driver location marker */}
      {driverLocation && (
        <Marker position={driverLocation} icon={driverIcon}>
          <Popup>Driver Location</Popup>
        </Marker>
      )}

      {/* Rider location marker */}
      {riderLocation && !driverLocation && (
        <Marker position={riderLocation}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Route line */}
      {showRoute && routePoints.length > 1 && (
        <Polyline
          positions={routePoints}
          color="#f59e0b"
          weight={4}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}
