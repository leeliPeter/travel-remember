import React, { useState } from "react";
import LocationBox from "./location-box";
import { useDroppable } from "@dnd-kit/core";
import { Location } from "@prisma/client";
import { useLoadScript } from "@react-google-maps/api";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Footprints, Train } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Add libraries type
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

interface DayProps {
  date: string;
  id: string;
  locations: (Location & {
    arrivalTime?: string;
    departureTime?: string;
    wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
  })[];
  onTimeChange?: (
    dayId: string,
    locationId: string,
    type: "arrival" | "departure",
    time: string
  ) => void;
  onWayToCommuteChange?: (
    dayId: string,
    locationId: string,
    wayToCommute: "DRIVING" | "WALKING" | "TRANSIT"
  ) => void;
  tripId: string;
  onLocationDeleted?: (locationId: string) => void;
}

// Move CommuteTime to a separate component to avoid re-renders
function CommuteTime({
  origin,
  destination,
  googleMapsLoaded,
  onWayToCommuteChange,
}: {
  origin: Location & { wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT" };
  destination: Location & { wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT" };
  googleMapsLoaded: boolean;
  onWayToCommuteChange?: (
    wayToCommute: "DRIVING" | "WALKING" | "TRANSIT"
  ) => void;
}) {
  const [commuteTime, setCommuteTime] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [travelMode, setTravelMode] = React.useState<google.maps.TravelMode>(
    () => {
      switch (destination.wayToCommute) {
        case "WALKING":
          return window.google.maps.TravelMode.WALKING;
        case "TRANSIT":
          return window.google.maps.TravelMode.TRANSIT;
        default:
          return window.google.maps.TravelMode.DRIVING;
      }
    }
  );

  React.useEffect(() => {
    if (!googleMapsLoaded) return;

    const service = new window.google.maps.DistanceMatrixService();

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
        } else if (status === "REQUEST_DENIED") {
          console.error(
            "Distance Matrix API not enabled or key not authorized"
          );
          setError("API not authorized");
        } else if (status === "OVER_QUERY_LIMIT") {
          console.error("Distance Matrix API quota exceeded");
          setError("Quota exceeded");
        } else if (response?.rows[0]?.elements[0]?.status === "ZERO_RESULTS") {
          setError("No route found");
        } else {
          console.error(
            "Distance Matrix Error:",
            status,
            response?.rows[0]?.elements[0]?.status
          );
          setError("Information unavailable");
        }
      }
    );
  }, [googleMapsLoaded, origin, destination, travelMode]);

  if (!googleMapsLoaded) return <div>Loading Maps...</div>;
  if (error) return <div className="text-black text-xs">{error}</div>;

  return (
    <div className="flex flex-col items-center gap-1">
      <Select
        value={travelMode}
        onValueChange={(value) => {
          const newMode = value as google.maps.TravelMode;
          setTravelMode(newMode);

          // Convert and pass up to parent
          let wayToCommute: "DRIVING" | "WALKING" | "TRANSIT" = "DRIVING";
          switch (newMode) {
            case window.google.maps.TravelMode.WALKING:
              wayToCommute = "WALKING";
              break;
            case window.google.maps.TravelMode.TRANSIT:
              wayToCommute = "TRANSIT";
              break;
          }

          onWayToCommuteChange?.(wayToCommute);
        }}
      >
        <SelectTrigger className="w-[120px] h-5 text-xs">
          <SelectValue>
            <div className="flex items-center gap-0.5">
              {travelMode === "DRIVING" && <Car className="w-4 h-4" />}
              {travelMode === "WALKING" && <Footprints className="w-4 h-4" />}
              {travelMode === "TRANSIT" && <Train className="w-4 h-4" />}
              {travelMode}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={window.google.maps.TravelMode.DRIVING}>
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              DRIVING
            </div>
          </SelectItem>
          <SelectItem value={window.google.maps.TravelMode.WALKING}>
            <div className="flex items-center gap-1">
              <Footprints className="w-4 h-4" />
              WALKING
            </div>
          </SelectItem>
          <SelectItem value={window.google.maps.TravelMode.TRANSIT}>
            <div className="flex items-center gap-1">
              <Train className="w-4 h-4" />
              TRANSIT
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="p-0.5 bg-blue-200 rounded-full mt-1"></div>
      <div className="flex items-center gap-1 text-sm">
        {commuteTime || "Calculating..."}
      </div>
    </div>
  );
}

export default function Day({
  date,
  id,
  locations,
  onTimeChange,
  onWayToCommuteChange,
  tripId,
  onLocationDeleted,
}: DayProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "day",
      dayId: id,
      locations,
    },
  });

  const handleTimeChange = (
    locationId: string,
    type: "arrival" | "departure",
    time: string
  ) => {
    // Pass the change up to Schedule component
    onTimeChange?.(id, locationId, type, time);
  };

  // Create a stable mapping of location IDs to UUIDs
  const locationIdMap = React.useMemo(() => {
    return locations.reduce((acc, location) => {
      acc[location.id] = acc[location.id] || uuidv4();
      return acc;
    }, {} as Record<string, string>);
  }, [locations]);

  return (
    <div
      ref={setNodeRef}
      className={`h-full w-[280px]  border-2 overflow-y-auto ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      } flex flex-col items-center p-2 rounded-lg transition-colors`}
    >
      <div className="date font-bold text-gray-800 mb-3">{date}</div>
      <div className="w-full min-h-[100px]">
        <SortableContext
          items={locations.map((loc) => loc.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 transition-all   pb-24 duration-300 ease-in-out">
            {locations.map((location, index) => {
              const locationBoxId = locationIdMap[location.id];

              return (
                <div key={locationBoxId}>
                  {index !== 0 && (
                    <div className="w-full space-y-1 flex pb-1 flex-col items-center">
                      <div className="flex flex-col items-center ">
                        <div className="commute-time">
                          {locations[index - 1] && (
                            <CommuteTime
                              origin={locations[index - 1]}
                              destination={location}
                              googleMapsLoaded={isLoaded}
                              onWayToCommuteChange={(wayToCommute) =>
                                onWayToCommuteChange?.(
                                  id,
                                  location.id,
                                  wayToCommute
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="transition-all duration-300 ease-in-out">
                    <LocationBox
                      id={location.id}
                      boxId={locationBoxId}
                      dayId={id}
                      name={location.name}
                      img={location.photoUrl}
                      address={location.address}
                      arrivalTime={location.arrivalTime || "--:--"}
                      departureTime={location.departureTime || "--:--"}
                      onTimeChange={(type, time) =>
                        handleTimeChange(location.id, type, time)
                      }
                      tripId={tripId}
                      onLocationDeleted={() => onLocationDeleted?.(location.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
