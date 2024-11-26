"use client";
import React, { useEffect, useRef, useState } from "react";
import { CustomInfoWindow } from "./custom-info-window";
import { addLocationToList } from "@/actions/list-add-location";
import { toast } from "sonner";
import { List } from "@/types";

interface LocationInfo {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
}

interface SearchResult {
  place_id: string;
  description: string;
}

interface MapProps {
  lists: List[];
  onListUpdate: () => Promise<void>;
}

export default function Map({ lists, onListUpdate }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(
    null
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const getPlaceDetails = async (placeId: string, map: google.maps.Map) => {
    const placesService = new google.maps.places.PlacesService(map);

    return new Promise((resolve, reject) => {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ["name", "formatted_address", "photos", "geometry"],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const photoUrl = place.photos?.[0]?.getUrl({
              maxWidth: 800,
              maxHeight: 600,
            });

            const locationInfo: LocationInfo = {
              id: placeId,
              name: place.name || "",
              address: place.formatted_address || "",
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
              photoUrl,
            };
            resolve(locationInfo);
          } else {
            reject(new Error("Failed to fetch place details"));
          }
        }
      );
    });
  };

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) return;

      try {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 25.0374, lng: 121.5388 },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: true,
          zoomControl: true,
          mapTypeId: "roadmap",
          clickableIcons: false,
        });

        map.addListener("click", async (event: google.maps.MapMouseEvent) => {
          const clickedLocation = event.latLng;
          if (!clickedLocation) return;

          try {
            const geocoder = new google.maps.Geocoder();
            const geoResponse = await geocoder.geocode({
              location: clickedLocation,
            });

            if (geoResponse.results[0]) {
              const locationInfo = await getPlaceDetails(
                geoResponse.results[0].place_id,
                map
              );
              setSelectedLocation(locationInfo as LocationInfo);
            }
          } catch (error) {
            console.error("Error fetching place details:", error);
          }
        });

        setMap(map);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = loadMap;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleSaveLocation = async (location: LocationInfo, listId: string) => {
    try {
      const result = await addLocationToList(listId, {
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        photoUrl: location.photoUrl,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);
        await onListUpdate(); // Refresh lists after successful addition
        setSelectedLocation(null); // Close info window
      }
    } catch (error) {
      toast.error("Failed to add location to list");
    }
  };

  // Handle search input
  useEffect(() => {
    if (!map || !searchValue || searchValue.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchPlaces = async () => {
      try {
        const service = new google.maps.places.AutocompleteService();
        const response = await service.getPlacePredictions({
          input: searchValue,
          componentRestrictions: { country: "tw" },
          types: ["establishment", "geocode"],
        });
        setSearchResults(response?.predictions || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, map]);

  // Handle search result selection
  const handleSearchSelect = async (placeId: string) => {
    if (!map) return;

    try {
      const locationInfo = (await getPlaceDetails(
        placeId,
        map
      )) as LocationInfo;
      setSelectedLocation(locationInfo);
      setSearchResults([]); // Clear search results
      setSearchValue(""); // Clear search input

      // Center map on selected location
      map.setCenter({
        lat: locationInfo.lat,
        lng: locationInfo.lng,
      });
      map.setZoom(17);
    } catch (error) {
      console.error("Error selecting place:", error);
    }
  };

  return (
    <div className="relative h-full">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-50 w-[350px]">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search locations in Taiwan..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
              {searchResults.map((result: SearchResult) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSearchSelect(result.place_id)}
                  className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                >
                  <p className="text-sm">{result.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-full w-full">
        {/* Map */}
        <div ref={mapRef} className="h-full w-full rounded-lg shadow-lg" />

        {/* Info Window */}
        {selectedLocation && (
          <div className="absolute bottom-8 left-8 z-50">
            <CustomInfoWindow
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              onSave={handleSaveLocation}
              lists={lists}
            />
          </div>
        )}
      </div>
    </div>
  );
}
