"use client";

import { useLoadScript, GoogleMap } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { addLocation } from "@/actions/add-location";
import { toast } from "sonner";
import { List, Location } from "@prisma/client";
import Image from "next/image";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 25.033,
  lng: 121.5654,
};

const libraries: "places"[] = ["places"];

interface MapClickEvent extends google.maps.MapMouseEvent {
  placeId?: string;
}

interface ListWithLocations extends List {
  locations: Location[];
}

interface MapProps {
  lists: ListWithLocations[];
  onLocationAdded: (listId: string, newLocation: Location) => void;
}

export default function Map({ lists, onLocationAdded }: MapProps) {
  console.log("Lists received in Map:", lists);

  const [isBrowser, setIsBrowser] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const currentPlaceRef = useRef<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const handleAddToList = async (
    listId: string,
    place: google.maps.places.PlaceResult
  ) => {
    if (!place.geometry?.location || isAddingLocation) return;

    setIsAddingLocation(true);
    try {
      let photoUrl = null;
      try {
        photoUrl =
          place.photos?.[0]?.getUrl({
            maxWidth: 400,
            maxHeight: 300,
          }) || "/images/emptyImage.jpg";
      } catch (error) {
        console.error("Error getting photo URL:", error);
        photoUrl = "/images/emptyImage.jpg";
      }

      const locationData = {
        name: place.name || "",
        address: place.formatted_address || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        photoUrl: photoUrl,
        listId: listId,
      };

      const result = await addLocation(locationData);

      if (result.error) {
        toast.error(result.error, {
          position: "bottom-right",
          className: "bg-white",
        });
        return;
      }

      if (result.success && result.location) {
        const selectedList = lists.find((list) => list.id === listId);

        toast.success(
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {photoUrl && (
                <Image
                  src={photoUrl}
                  width={40}
                  height={40}
                  alt={place.name || ""}
                  className="w-10 h-10 rounded-md object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = "/images/emptyImage.jpg";
                  }}
                />
              )}
            </div>
            <div>
              <p className="font-medium">Location added!</p>
              <p className="text-sm text-gray-600">
                Added {place.name} to {selectedList?.name}
              </p>
            </div>
          </div>,
          {
            position: "bottom-right",
            duration: 4000,
            className: "bg-white shadow-lg border border-gray-100",
          }
        );

        onLocationAdded(listId, result.location);
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        currentPlaceRef.current = null;
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location", {
        position: "bottom-right",
        className: "bg-white",
      });
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handlePlaceSelect = (placeId: string, map: google.maps.Map) => {
    const service = new google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "place_id",
          "photos",
          "rating",
          "user_ratings_total",
          "opening_hours",
        ],
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          currentPlaceRef.current = place;
          console.log("Creating InfoWindow with lists:", lists);

          const content = document.createElement("div");
          content.className = "custom-info-window";

          let photoUrl = null;
          try {
            photoUrl = place.photos?.[0]?.getUrl({
              maxWidth: 400,
              maxHeight: 300,
            });
          } catch (error) {
            console.error("Error getting photo URL:", error);
            photoUrl = "/images/emptyImage.jpg";
          }

          content.innerHTML = `
            <div class="p-0 min-w-[170px] max-w-[260px]">
              <div class="flex flex-col space-y-2">
                <div class="relative h-[34px] w-[85%]" id="dropdownContainer">
                  <button
                    id="addToListBtn"
                    class="w-full px-4 absolute top-2 left-0 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
       
                    Add to List
                  </button>
                  
                  <div id="listSelectContainer" class="hidden absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
                    <div class="py-1">
                      ${
                        lists.length > 0
                          ? lists
                              .map(
                                (list) => `
                                <button
                                  class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex justify-between items-center group"
                                  data-list-id="${list.id}"
                                >
                                  <span class="font-medium">${list.name}</span>
                                </button>
                              `
                              )
                              .join("")
                          : `<div class="px-4 py-2 text-sm text-gray-500">No lists available</div>`
                      }
                    </div>
                  </div>
                </div>

                ${
                  photoUrl
                    ? `<div class="mb-2">
                        <img 
                          src="${photoUrl}"
                          alt="${place.name || ""}"
                          class="w-full h-48 object-cover rounded-lg"
                          onerror="this.onerror=null; this.src='/images/emptyImage.jpg';"
                        />
                      </div>`
                    : ""
                }
                
                <div class="text-sm font-bold text-blue-500">
                  ${place.name || ""}
                </div>
                
                ${
                  place.rating
                    ? `<div class="mb-2">
                        <div class="text-yellow-500 text-sm">
                          ${"★".repeat(Math.floor(place.rating))}${
                        place.rating % 1 >= 0.5 ? "½" : ""
                      }${"☆".repeat(5 - Math.ceil(place.rating))}
                        </div>
                        <div class="text-gray-600 text-sm">
                          ${place.rating} (${place.user_ratings_total} reviews)
                        </div>
                      </div>`
                    : ""
                }
                
                ${
                  place.opening_hours
                    ? `<div class="mb-3">
                        <div class="mb-1 text-sm">
                          ${
                            place.opening_hours.isOpen()
                              ? '<span class="text-green-600 font-medium">Open now</span>'
                              : '<span class="text-red-600 font-medium">Closed now</span>'
                          }
                        </div>
                        <div class="text-xs text-gray-600">
                          ${place.opening_hours.weekday_text
                            ?.map((day) => `<div>${day}</div>`)
                            .join("")}
                        </div>
                      </div>`
                    : ""
                }

                <div>
                  <a
                    href="https://maps.google.com/maps?ll=${place.geometry.location.lat()},${place.geometry.location.lng()}&z=21&t=m&hl=en-US&gl=US&mapclient=apiv3${
            place.place_id ? `&cid=${place.place_id}` : ""
          }"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          `;

          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const infoWindow = new google.maps.InfoWindow({
            content,
            position: place.geometry.location,
          });

          infoWindowRef.current = infoWindow;
          infoWindow.open(map);

          // Add event listeners after InfoWindow is opened
          google.maps.event.addListenerOnce(infoWindow, "domready", () => {
            const addButton = document.getElementById("addToListBtn");
            const listSelectContainer = document.getElementById(
              "listSelectContainer"
            );
            const dropdownContainer =
              document.getElementById("dropdownContainer");

            if (addButton && listSelectContainer && dropdownContainer) {
              // Toggle dropdown
              addButton.addEventListener("click", (e) => {
                e.stopPropagation();
                listSelectContainer.classList.toggle("hidden");
              });

              // Add click handlers for list items
              const listButtons =
                listSelectContainer.querySelectorAll("[data-list-id]");
              listButtons.forEach((button) => {
                button.addEventListener("click", (e) => {
                  e.stopPropagation();
                  const listId = button.getAttribute("data-list-id");
                  if (listId && currentPlaceRef.current) {
                    handleAddToList(listId, currentPlaceRef.current);
                    listSelectContainer.classList.add("hidden");
                  }
                });
              });

              // Close dropdown when clicking outside
              document.addEventListener("click", (e) => {
                if (!dropdownContainer.contains(e.target as Node)) {
                  listSelectContainer.classList.add("hidden");
                }
              });
            }
          });
        }
      }
    );
  };

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);

    if (map) {
      map.addListener("click", (event: MapClickEvent) => {
        event.stop?.();

        const placeId = event.placeId;
        if (!placeId) {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          return;
        }

        handlePlaceSelect(placeId, map);
      });
    }
  };

  const handleSearch = () => {
    if (
      searchInputRef.current &&
      searchInputRef.current.value.trim() !== "" &&
      map
    ) {
      const service = new google.maps.places.PlacesService(map);
      const searchQuery = searchInputRef.current.value;

      const request = {
        query: searchQuery,
        fields: ["place_id", "geometry", "name"],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results[0] &&
          results[0].place_id
        ) {
          const firstResult = results[0];

          if (firstResult.geometry?.location) {
            // Center map on the first result
            map.setCenter(firstResult.geometry.location);
            map.setZoom(17);

            // Show place details in InfoWindow
            handlePlaceSelect(firstResult.place_id!, map);
          }

          // Clear the search input
          searchInputRef.current!.value = "";
        }
      });
    }
  };

  // Initialize search box
  useEffect(() => {
    if (isLoaded && searchInputRef.current && map) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          fields: ["place_id", "geometry", "name"],
        }
      );

      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location || !place.place_id) {
          return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(17);

        handlePlaceSelect(place.place_id, map);

        if (searchInputRef.current) {
          searchInputRef.current.value = "";
        }
      });

      searchBoxRef.current = autocomplete;
    }
  }, [isLoaded, map]);

  // Add useEffect to watch for lists changes
  useEffect(() => {
    console.log("Lists updated in Map:", lists);
    // If there's an open InfoWindow, update its content
    if (infoWindowRef.current && currentPlaceRef.current) {
      handlePlaceSelect(currentPlaceRef.current.place_id!, map!);
    }
  }, [lists]);

  if (!isBrowser) return null;
  if (loadError)
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <svg
            className="w-10 h-10 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-lg font-medium text-gray-900">
            Error loading maps
          </div>
          <div className="text-sm text-gray-500">
            Please check your internet connection and try again
          </div>
        </div>
      </div>
    );
  if (!isLoaded)
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto">
            {/* Outer circle */}
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            {/* Spinning circle */}
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading Maps</div>
          <div className="text-sm text-gray-500">
            Please wait while we load Google Maps
          </div>
          <div className="flex justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-10 w-80">
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search places..."
            className="w-full px-4 py-2 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={14}
        center={defaultCenter}
        onLoad={handleMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: true,
          disableDefaultUI: false,
          gestureHandling: "greedy",
        }}
        onClick={(e: google.maps.MapMouseEvent) => {
          e.stop?.();
        }}
      />
    </div>
  );
}
