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
import { IoMdClose } from "react-icons/io";
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
import InvalidTrip from "./invaild-trip";

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
      toast.error("Failed to delete location");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-[90vh] flex items-center justify-center">
        <Loading size="large" text="Loading trip information..." />
      </div>
    );
  }

  return (
    <div className="flex space-y-4 md:space-y-0 rounded-lg overflow-hidden flex-col md:flex-row h-[90vh]">
      <div className="box1 w-full md:w-1/4 h-full  flex-col flex  ">
        {tripInfo ? (
          <div className="w-full bg-white  h-[15%] overflow-y-auto flex  flex-col justify-around items-center">
            <p className="text-xl font-bold w-[80%] mt-1  text-center truncate capitalize">
              {tripInfo.name}
            </p>
            <div className="flex items-center justify-center">
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
          <div className="w-full bg-white  h-[15%] overflow-y-auto justify-center  font-bold flex  flex-col items-center">
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
              <div className="space-y-2 max-h-[90%]  overflow-y-auto">
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
                                <img
                                  src={location.photoUrl}
                                  alt={location.name}
                                  className="w-full hidden xl:block h-16 sm:h-24 object-cover rounded-md mt-2"
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
            <div className="text-base sm:text-md md:text-lg font-bold py-1">
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
                  className="w-full text-xs sm:text-sm"
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
      <div className="box2 w-full h-full md:w-3/4 bg-white rounded-lg">
        <Map
          lists={lists}
          onLocationAdded={handleLocationAdded}
          key={lists.length}
        />
      </div>
    </div>
  );
}
