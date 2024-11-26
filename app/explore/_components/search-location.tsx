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

export default function SearchLocation() {
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  const fetchLists = async () => {
    if (!tripId) return;
    try {
      const result = await getListsByTripId(tripId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.lists) {
        setLists(result.lists);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load lists");
    }
  };

  useEffect(() => {
    const fetchTripInfo = async () => {
      if (!tripId) return;

      try {
        const result = await getTrip(tripId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.trip) {
          setTripInfo(result.trip);
          await fetchLists(); // Wait for lists to be fetched
        }
      } catch (error) {
        console.error("Error fetching trip info:", error);
        toast.error("Failed to load trip information");
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

  return (
    <div className="flex space-y-4 md:space-y-0 md:space-x-4 flex-col md:flex-row h-[80vh]">
      <div className="box1 w-full md:w-1/4 bg-white/20 flex-col flex p-2 space-y-3 rounded-lg">
        {tripInfo && (
          <div className="w-full bg-white rounded-lg flex justify-center py-3 space-y-2 flex-col items-center">
            <p className="text-xl font-bold w-[80%] text-center truncate capitalize">
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
            <p className="text-sm max-w-xs px-2 line-clamp-4 text-center">
              {tripInfo.description}
            </p>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-lg h-full flex-col flex px-3 py-3 items-center">
          {/* Lists Section */}
          <div className="w-full mb-4">
            <div className="text-xl font-bold pb-2">Lists</div>
            {lists.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{list.name}</span>
                      <span className="text-xs text-gray-500">
                        {list.locations.length} locations
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-2">
                No lists created yet
              </div>
            )}
          </div>

          {/* Create List Form */}
          <div className="w-full">
            <div className="text-xl font-bold pb-2">Create New List</div>
            <div className="bg-white/90 rounded-lg w-full flex justify-center items-center">
              <form onSubmit={handleSubmit} className="space-y-4 w-full p-4">
                <Input
                  type="text"
                  placeholder="Enter list name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full"
                  disabled={isLoading || !tripId}
                />
                <Button
                  type="submit"
                  className="w-full"
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
        <Map lists={lists} onListUpdate={fetchLists} />
      </div>
    </div>
  );
}
