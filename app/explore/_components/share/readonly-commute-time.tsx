import { useLoadScript } from "@react-google-maps/api";
import { Car, Footprints, Train, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

interface ReadOnlyCommuteTimeProps {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
}

export default function ReadOnlyCommuteTime({
  origin,
  destination,
  wayToCommute = "DRIVING",
}: ReadOnlyCommuteTimeProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [commuteTime, setCommuteTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const service = new window.google.maps.DistanceMatrixService();
    const travelMode = (() => {
      switch (wayToCommute) {
        case "WALKING":
          return google.maps.TravelMode.WALKING;
        case "TRANSIT":
          return google.maps.TravelMode.TRANSIT;
        default:
          return google.maps.TravelMode.DRIVING;
      }
    })();

    service.getDistanceMatrix(
      {
        origins: [{ lat: Number(origin.lat), lng: Number(origin.lng) }],
        destinations: [
          { lat: Number(destination.lat), lng: Number(destination.lng) },
        ],
        travelMode,
      },
      (response, status) => {
        if (
          status === "OK" &&
          response?.rows[0]?.elements[0]?.status === "OK"
        ) {
          const element = response.rows[0].elements[0];
          setCommuteTime(`${element.duration.text} (${element.distance.text})`);
          setError(null);
        } else if (response?.rows[0]?.elements[0]?.status === "ZERO_RESULTS") {
          setError("No route found");
        } else {
          setError("Route info unavailable");
        }
      }
    );
  }, [isLoaded, origin, destination, wayToCommute]);

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-gray-500">
        {error ? (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <>
            {wayToCommute === "WALKING" && <Footprints className="w-4 h-4" />}
            {wayToCommute === "TRANSIT" && <Train className="w-4 h-4" />}
            {wayToCommute === "DRIVING" && <Car className="w-4 h-4" />}
            <span className="text-sm">{commuteTime || "Calculating..."}</span>
          </>
        )}
      </div>
      <div className="w-0.5 h-4 bg-gray-200" />
    </div>
  );
}
