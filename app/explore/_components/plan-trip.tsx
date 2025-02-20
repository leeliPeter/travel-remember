"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getTrip } from "@/actions/get-trip";
import { getListsByTripId } from "@/data/get-lists-by-tripId";
import Loading from "@/components/loading";
import { List, Location } from "@prisma/client";
import Image from "next/image";
import SchedulePage from "./plan-trip/schedule";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  DragOverlay,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DraggingPreview } from "./plan-trip/location-box";
import InvalidSchedule from "./plan-trip/invalid-schedule";

// Add interface for extended Location type
interface ExtendedLocation extends Location {
  arrivalTime?: string;
  departureTime?: string;
}

interface ListWithLocations extends List {
  locations: Location[];
}

export default function PlanTrip({ tripId }: { tripId: string | null }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [lists, setLists] = useState<ListWithLocations[]>([]);
  const [selectedList, setSelectedList] = useState<ListWithLocations | null>(
    null
  );
  const scheduleRef = useRef<any>(null);
  const [activeLocation, setActiveLocation] = useState<ExtendedLocation | null>(
    null
  );
  const [isInvalidTrip, setIsInvalidTrip] = useState(false);

  // Add sensors configuration
  const mouseSensor = useSensor(MouseSensor, {
    // Lower activation delay for mouse
    activationConstraint: {
      distance: 10, // 10px movement before drag starts
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Increase activation delay for touch
    activationConstraint: {
      delay: 250, // 250ms delay before drag starts
      tolerance: 5, // 5px movement allowed during delay
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleListClick = (list: ListWithLocations) => {
    setSelectedList(selectedList?.id === list.id ? null : list);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveLocation(active.data.current as ExtendedLocation);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveLocation(null);
      return;
    }

    if (active.data.current?.type === "location") {
      let targetDayId: string;
      let overId: string | undefined;

      if (over.data.current?.type === "locationBox") {
        // If dropping over a location box, use its day ID and its own ID as overId
        targetDayId = over.data.current.dayId;
        overId = over.data.current.id;
      } else if (over.id.toString().startsWith("day-")) {
        // If dropping directly on a day
        targetDayId = over.id as string;
        overId = undefined;
      } else {
        setActiveLocation(null);
        return;
      }

      const location = active.data.current as Location;
      if (scheduleRef.current) {
        scheduleRef.current.handleLocationDrop(targetDayId, location, overId);
      }
    } else if (active.data.current?.type === "locationBox") {
      if (scheduleRef.current) {
        scheduleRef.current.handleReorder(active, over);
      }
    }

    setActiveLocation(null);
  };

  useEffect(() => {
    const fetchTripInfo = async () => {
      if (!tripId) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getTrip(tripId);

        if (result.error) {
          setIsInvalidTrip(true);
          toast.error(result.error);
          return;
        }

        if (result.trip) {
          setTripInfo(result.trip);
          const listsResult = await getListsByTripId(tripId);
          if (listsResult.lists) {
            setLists(listsResult.lists);
          }
        }
      } catch (error) {
        console.error("Error fetching trip info:", error);
        setIsInvalidTrip(true);
        toast.error("Failed to load trip information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripInfo();
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="h-[90vh] flex items-center justify-center">
        <Loading size="large" text="Loading trip information..." />
      </div>
    );
  }

  if (isInvalidTrip) {
    return (
      <div className="h-[90vh]">
        <InvalidSchedule />
      </div>
    );
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex  -mx-4 w-[100vw]  md:ml-0 md:w-full h-[90vh] rounded-none md:rounded-lg overflow-visible   flex-row ">
        <div className="box1  w-[150px] md:w-1/5 h-full flex-col flex rounded-l-lg:none md:rounded-l-lg overflow-hidden">
          {tripInfo ? (
            <div className="w-full bg-white h-[7%] lg:h-[15%] overflow-y-auto flex flex-col justify-around items-center">
              <p className=" font-bold w-[80%]  text-base md:text-xl mt-1 text-center truncate capitalize">
                {tripInfo.name}
              </p>
              <div className="hidden lg:flex  items-center justify-center">
                <p className="text-sm">
                  {new Date(tripInfo.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm mx-2">-</p>
                <p className="text-sm">
                  {new Date(tripInfo.endDate).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm hidden lg:block  max-w-xs px-2 line-clamp-1 lg:line-clamp-2 text-center">
                {tripInfo.description}
              </p>
            </div>
          ) : (
            <div className="w-full bg-white h-[15%] overflow-y-auto justify-center font-bold flex flex-col items-center">
              Create a trip first
            </div>
          )}
          <div className="w-full bg-gray-200 h-[93%] lg:h-[85%] py-2 overflow-y-auto justify-between flex-col flex px-3 items-center">
            <div className="w-full min-h-auto max-h-[90%]">
              <div className="text-base sm:text-md md:text-lg h-8 font-bold">
                Lists
              </div>
              {lists.length > 0 ? (
                <div className="space-y-2 max-h-full rounded-lg   overflow-y-auto">
                  {lists.map((list) => (
                    <div key={list.id} className="flex flex-col">
                      <div
                        className="bg-white  p-2 sm:p-3 hover:bg-gray-50 rounded-lg  transition-colors group cursor-pointer sticky top-0 z-10 shadow-sm"
                        onClick={() => handleListClick(list)}
                      >
                        <div className="flex justify-between items-center ">
                          <span className="text-xs sm:text-sm md:text-base font-medium  truncate pr-8">
                            {list.name}
                          </span>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                              {list.locations.length}
                            </span>
                            <span className="text-[10px] hidden xl:block sm:text-xs md:text-sm text-gray-500">
                              locations
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedList?.id === list.id &&
                        list.locations.length > 0 && (
                          <div className="mt-2 space-y-2 overflow-x-clip ">
                            {list.locations.map((location) => (
                              <DraggableLocation
                                key={location.id}
                                location={location}
                              />
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
          </div>
        </div>
        <div className="box2 h-full w-[calc(100vw-150px)] md:w-4/5 ">
          {tripInfo && <SchedulePage ref={scheduleRef} trip={tripInfo} />}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeLocation && (
            <DraggingPreview
              name={activeLocation.name}
              img={activeLocation.photoUrl}
              address={activeLocation.address}
              arrivalTime={activeLocation.arrivalTime || "--:--"}
              departureTime={activeLocation.departureTime || "--:--"}
            />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function DraggableLocation({ location }: { location: Location }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: location.id,
      data: {
        type: "location",
        ...location,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0 : 1,
        transition: "opacity 0.2s",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-gray-50 rounded-lg p-2 text-sm relative group cursor-move 
        ${isDragging ? "ring-2 ring-blue-400" : "hover:bg-gray-100"} 
        transition-all duration-200`}
    >
      <div className="font-medium text-blue-600 pr-6 truncate">
        {location.name}
      </div>
      {location.photoUrl && (
        <Image
          width={150}
          height={150}
          src={location.photoUrl}
          alt={location.name}
          className="w-full h-24 object-cover hidden xl:block rounded-md mt-2"
          draggable={false}
        />
      )}
    </div>
  );
}
