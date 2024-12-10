"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Map from "./search-location/map";
import { createList } from "@/actions/create-list";
import { getTrip } from "@/actions/get-trip";
import { getListsByTripId } from "@/data/get-lists-by-tripId";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { deleteList } from "@/actions/delete-list";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import InvalidTrip from "./invaild-trip";
import { FaAnglesRight } from "react-icons/fa6";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteLocation } from "@/actions/del-location";
import Loading from "@/components/loading";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface List {
  id: string;
  name: string;
  tripId: string;
  locations: Location[];
  createdAt: Date;
  updatedAt: Date;
}

interface TripInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
}

// interface ListWithLocations extends List {
//   locations: Location[];
// }

export default function SearchLocation() {
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [box1Width, setBox1Width] = useState("270px");

  if (!tripId) {
    return <InvalidTrip />;
  }

  const fetchLists = async () => {
    if (!tripId) return;
    try {
      const result = await getListsByTripId(tripId);
      console.log("Lists fetched:", result);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.lists) {
        console.log("Setting lists:", result.lists);
        setLists(result.lists);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load lists");
    }
  };

  useEffect(() => {
    const fetchTripInfo = async () => {
      if (!tripId) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const result = await getTrip(tripId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.trip) {
          setTripInfo(result.trip);
          await fetchLists();
        }
      } catch (error) {
        console.error("Error fetching trip info:", error);
        toast.error("Failed to load trip information");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchTripInfo();
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripId) {
      toast.error("No trip selected");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createList({
        name: listName,
        tripId: tripId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);
        setListName("");
        fetchLists(); // Refresh lists after creating a new one
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListClick = (list: List) => {
    setSelectedList(selectedList?.id === list.id ? null : list);
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const result = await deleteList(listId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);
        setLists((currentLists) =>
          currentLists.filter((list) => list.id !== listId)
        );
        if (selectedList?.id === listId) {
          setSelectedList(null);
        }
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  const handleLocationAdded = (listId: string, newLocation: Location) => {
    setLists((currentLists) =>
      currentLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              locations: [newLocation, ...list.locations],
            }
          : list
      )
    );
  };

  const handleDeleteLocation = async (locationId: string, listId: string) => {
    try {
      const result = await deleteLocation(locationId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);
        setLists((currentLists) =>
          currentLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  locations: list.locations.filter(
                    (loc) => loc.id !== locationId
                  ),
                }
              : list
          )
        );
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const box1 = document.querySelector(".box1");
      const menuButton = document.querySelector(".menu-button");

      if (
        isMenuOpen &&
        box1 &&
        !box1.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        // xl
        setBox1Width("360px");
      } else if (window.innerWidth >= 1024) {
        // lg
        setBox1Width("330px");
      } else if (window.innerWidth >= 768) {
        // md
        setBox1Width("300px");
      } else {
        setBox1Width("270px");
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="h-[90vh] flex items-center justify-center">
        <Loading size="large" text="Loading trip information..." />
      </div>
    );
  }

  return (
    <div className="flex relative rounded-lg w-full mx-auto overflow-hidden flex-row h-[90vh]">
      <div
        className="absolute md:hidden z-30 top-[35%] left-[0px] transition-all duration-500"
        style={{ left: isMenuOpen ? box1Width : "0px" }}
      >
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="menu-button bg-stone-600 cursor-pointer text-white flex flex-col lowercase items-center rounded-r-lg p-1 text-sm"
        >
          <FaAnglesRight
            className={`h-4 w-4 mb-1 transition-transform duration-500 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
          <p>m</p>
          <p>e</p>
          <p>n</p>
          <p>u</p>
        </div>
      </div>
      <div
        className={`box1 overflow-hidden transition-all duration-500 z-20 h-full absolute md:relative flex-col flex`}
        style={{
          width: window?.innerWidth >= 768 || isMenuOpen ? box1Width : "0px",
          display: "flex",
        }}
      >
        {tripInfo ? (
          <div className="w-full bg-white  h-[15%] overflow-y-auto flex  flex-col justify-around items-center">
            <p className="text-xl font-bold w-[80%] mt-1  text-center truncate capitalize">
              {tripInfo.name}
            </p>
            <div className="flex items-center truncate justify-center">
              <p className="text-sm">
                {new Date(tripInfo.startDate).toLocaleDateString()}
              </p>
              <p className="text-sm mx-2">-</p>
              <p className="text-sm">
                {new Date(tripInfo.endDate).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm max-w-xs px-2 line-clamp-1 lg:line-clamp-2 text-center">
              {tripInfo.description}
            </p>
          </div>
        ) : (
          <div className="w-full bg-white truncate  h-[15%] overflow-y-auto justify-center  font-bold flex  flex-col items-center">
            Create a trip first
          </div>
        )}
        <div className="w-full bg-gray-200 h-[85%] py-2 overflow-y-auto justify-between flex-col flex px-3  items-center">
          {/* Lists Section */}
          <div className="w-full min-h-auto max-h-[70%]  ">
            <div className="text-base sm:text-md md:text-lg h-8 font-bold ">
              Lists
            </div>
            {lists.length > 0 ? (
              <div className="space-y-2 max-h-[90%] lg:max-h-[95%] xl:max-h-[100%]   overflow-y-auto">
                {lists.map((list) => (
                  <div key={list.id} className="flex flex-col">
                    <div
                      className="bg-white rounded-lg p-2 sm:p-3 hover:bg-gray-50 transition-colors group cursor-pointer sticky top-0 z-10 shadow-sm"
                      onClick={() => handleListClick(list)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm md:text-base font-medium truncate pr-8">
                          {list.name}
                        </span>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                            {list.locations.length}
                          </span>
                          <span className="text-[10px] hidden xl:block sm:text-xs md:text-sm text-gray-500">
                            locations
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <IoMdClose className="h-5 w-5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete List</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{list.name}"?
                                  This action cannot be undone. All locations in
                                  this list will also be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteList(list.id);
                                  }}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>

                    {/* Locations Display */}
                    {selectedList?.id === list.id &&
                      list.locations.length > 0 && (
                        <div className="mt-2 ml-2 sm:ml-4 space-y-2 overflow-y-auto">
                          {list.locations.map((location) => (
                            <div
                              key={location.id}
                              className="bg-gray-50 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm relative group"
                            >
                              <button
                                onClick={() =>
                                  handleDeleteLocation(location.id, list.id)
                                }
                                className="absolute top-1 sm:top-2 right-1 sm:right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <IoMdClose className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <div className="font-medium text-blue-600 pr-4 sm:pr-6 truncate">
                                {location.name}
                              </div>
                              {location.photoUrl && (
                                <Image
                                  src={location.photoUrl}
                                  width={150}
                                  height={150}
                                  alt={location.name}
                                  className="w-full hidden xl:block h-16 sm:h-24 object-cover rounded-md mt-2"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Prevent infinite loop
                                    target.src = "/images/emptyImage.jpg";
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xs sm:text-sm py-2">
                No lists created yet
              </div>
            )}
          </div>

          {/* Create List Form */}
          <div className="w-full">
            <div className="text-base sm:text-md truncate md:text-lg font-bold py-1">
              Create New List
            </div>
            <div className="bg-white/90 rounded-lg w-full flex justify-center items-center">
              <form
                onSubmit={handleSubmit}
                className="space-y-2 sm:space-y-3 w-full p-2 sm:p-3"
              >
                <Input
                  type="text"
                  placeholder="Enter list name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full text-base sm:text-sm"
                  style={{ fontSize: "16px" }}
                  disabled={isLoading || !tripId}
                />
                <Button
                  type="submit"
                  className="w-full text-xs sm:text-sm"
                  disabled={isLoading || !listName.trim() || !tripId}
                >
                  {isLoading ? "Creating..." : "Create List"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="box2 w-full h-full bg-white">
        {tripInfo ? (
          <Map
            lists={lists}
            onLocationAdded={handleLocationAdded}
            key={lists.length}
          />
        ) : (
          <InvalidTrip />
        )}
      </div>
    </div>
  );
}
