"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import Day from "./day";
import { Trip, Location } from "@prisma/client";
import { arrayMove } from "@dnd-kit/sortable";
import { updateSchedule } from "@/actions/update-schedule";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RiSave3Line } from "react-icons/ri";
import { getScheduleByTripId } from "@/data/get-scheduleby-tripId";
import InvalidSchedule from "./invalid-schedule";

interface DaySchedule {
  dayId: string;
  date: Date;
  locations: (Location & {
    arrivalTime?: string;
    departureTime?: string;
    wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
  })[];
}

const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }
`;

const SchedulePage = forwardRef(({ trip }: { trip: Trip }, ref) => {
  const [isEdited, setIsEdited] = useState(false);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingChangesRef = useRef(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Add this function to generate a unique ID
  const generateUniqueId = () => {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // fetch daySchedules from database
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!trip?.id) return;

      const result = await getScheduleByTripId(trip.id);

      if (result.error) {
        setScheduleError(result.error);
        toast.error(result.error);
        return;
      }

      if (result.schedule?.scheduleData) {
        const scheduleData = result.schedule.scheduleData as {
          days: {
            dayId: string;
            date: string;
            locations: {
              id: string;
              name: string;
              address: string;
              lat: number;
              lng: number;
              photoUrl?: string;
              arrivalTime?: string;
              departureTime?: string;
              type: string;
              createdAt: string;
              updatedAt: string;
              wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
            }[];
          }[];
        };

        // Convert the schedule data to DaySchedule format
        const convertedSchedule: DaySchedule[] = scheduleData.days.map(
          (day) => ({
            dayId: day.dayId,
            date: new Date(day.date),
            locations: day.locations.map((loc) => ({
              id: loc.id,
              name: loc.name,
              address: loc.address,
              lat: loc.lat,
              lng: loc.lng,
              photoUrl: loc.photoUrl || null,
              listId: trip.id, // Using trip ID as listId since we don't need the original
              createdAt: new Date(loc.createdAt),
              updatedAt: new Date(loc.updatedAt),
              arrivalTime: loc.arrivalTime,
              departureTime: loc.departureTime,
              wayToCommute: loc.wayToCommute || "DRIVING",
            })),
          })
        );

        setDaySchedules(convertedSchedule);
      }
    };

    fetchSchedule();
  }, [trip?.id]);

  // Modified save function to handle pending changes
  const saveSchedule = async () => {
    if (isSaving || !trip.id) return;

    try {
      setIsSaving(true);
      const scheduleData = {
        days: daySchedules.map((day) => ({
          dayId: day.dayId,
          date: day.date.toISOString(),
          locations: day.locations.map((loc) => ({
            id: loc.id,
            name: loc.name,
            address: loc.address,
            lat: loc.lat,
            lng: loc.lng,
            photoUrl: loc.photoUrl || undefined,
            arrivalTime: loc.arrivalTime,
            departureTime: loc.departureTime,
            type: "location",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wayToCommute: loc.wayToCommute || "DRIVING",
          })),
        })),
      };

      const result = await updateSchedule({
        tripId: trip.id,
        scheduleData: scheduleData,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Check if there were any changes during saving
      if (pendingChangesRef.current) {
        pendingChangesRef.current = false;
        debouncedSave();
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Modified debounced save handler
  const debouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (isSaving) {
      // Mark that we have pending changes
      pendingChangesRef.current = true;
      return;
    }

    saveTimeoutRef.current = setTimeout(saveSchedule, 500); // Reduced timeout
  };

  // Update handleTimeUpdate
  const handleTimeUpdate = (
    dayId: string,
    locationId: string,
    type: "arrival" | "departure",
    time: string
  ) => {
    setDaySchedules((prevSchedules) =>
      prevSchedules.map((schedule) => {
        if (schedule.dayId === dayId) {
          return {
            ...schedule,
            locations: schedule.locations.map((loc) => {
              if (loc.id === locationId) {
                return {
                  ...loc,
                  [type === "arrival" ? "arrivalTime" : "departureTime"]: time,
                };
              }
              return loc;
            }),
          };
        }
        return schedule;
      })
    );

    setIsEdited(true);
    debouncedSave();
  };

  // Add handleWayToCommuteChange function
  const handleWayToCommuteChange = (
    dayId: string,
    locationId: string,
    wayToCommute: "DRIVING" | "WALKING" | "TRANSIT"
  ) => {
    setDaySchedules((prevSchedules) =>
      prevSchedules.map((schedule) => {
        if (schedule.dayId === dayId) {
          return {
            ...schedule,
            locations: schedule.locations.map((loc) => {
              if (loc.id === locationId) {
                return {
                  ...loc,
                  wayToCommute,
                };
              }
              return loc;
            }),
          };
        }
        return schedule;
      })
    );

    setIsEdited(true);
    debouncedSave();
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update handleLocationDrop
  useImperativeHandle(ref, () => ({
    handleLocationDrop: async (
      dayId: string,
      location: Location,
      overId?: string
    ) => {
      setDaySchedules((prevSchedules) => {
        const existingScheduleIndex = prevSchedules.findIndex(
          (s) => s.dayId === dayId
        );

        // Create a new location with a different ID
        const newLocation: Location = {
          ...location,
          id: generateUniqueId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (existingScheduleIndex >= 0) {
          const newSchedules = [...prevSchedules];
          const daySchedule = newSchedules[existingScheduleIndex];

          if (overId) {
            // Find the target location's index
            const overIndex = daySchedule.locations.findIndex(
              (loc) => loc.id === overId
            );

            if (overIndex !== -1) {
              // Insert the new location at the beginning of the array
              const newLocations = [...daySchedule.locations];
              newLocations.unshift(newLocation);

              // Use arrayMove to move it to the desired position
              const reorderedLocations = arrayMove(newLocations, 0, overIndex);

              newSchedules[existingScheduleIndex] = {
                ...daySchedule,
                locations: reorderedLocations,
              };
            }
          } else {
            // If not dropping over a location, append to the end
            newSchedules[existingScheduleIndex] = {
              ...daySchedule,
              locations: [...daySchedule.locations, newLocation],
            };
          }
          return newSchedules;
        } else {
          // Create new day schedule
          return [
            ...prevSchedules,
            {
              dayId,
              date: new Date(),
              locations: [newLocation],
            },
          ];
        }
      });

      // After updating state, save to database
      await saveSchedule();
      setIsEdited(true);
    },
    handleReorder: async (active: any, over: any) => {
      const sourceDayId = active.data.current.dayId;
      const targetDayId = over.data.current?.dayId;

      if (sourceDayId === targetDayId) {
        // Handle reordering within same day
        setDaySchedules((prevSchedules) => {
          return prevSchedules.map((schedule) => {
            if (schedule.dayId === sourceDayId) {
              const dayLocations = [...schedule.locations];
              const oldIndex = dayLocations.findIndex(
                (loc) => loc.id === active.id
              );

              // If dropping over a location box, use its index
              if (over.data.current?.type === "locationBox") {
                const newIndex = dayLocations.findIndex(
                  (loc) => loc.id === over.id
                );

                if (oldIndex !== -1 && newIndex !== -1) {
                  return {
                    ...schedule,
                    locations: arrayMove(dayLocations, oldIndex, newIndex),
                  };
                }
              } else {
                // If dropping directly on the day (not over a location box)
                // Move the item to the end
                if (oldIndex !== -1) {
                  const [movedItem] = dayLocations.splice(oldIndex, 1);
                  return {
                    ...schedule,
                    locations: [...dayLocations, movedItem],
                  };
                }
              }
            }
            return schedule;
          });
        });
        setIsEdited(true);
      } else {
        // Handle moving between days
        setDaySchedules((prevSchedules) => {
          const sourceSchedule = prevSchedules.find(
            (s) => s.dayId === sourceDayId
          );
          if (!sourceSchedule) return prevSchedules;

          const movedLocation = sourceSchedule.locations.find(
            (loc) => loc.id === active.id
          );
          if (!movedLocation) return prevSchedules;

          // Create new location preserving times
          const newLocation = {
            ...movedLocation,
            id: generateUniqueId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            arrivalTime: "--:--",
            departureTime: "--:--",
          };

          // Check if target day exists
          const targetSchedule = prevSchedules.find(
            (s) => s.dayId === targetDayId
          );

          if (!targetSchedule) {
            // Create new day schedule
            const newDaySchedule: DaySchedule = {
              dayId: targetDayId,
              date: new Date(),
              locations: [newLocation],
            };

            return prevSchedules
              .map((schedule) => {
                if (schedule.dayId === sourceDayId) {
                  return {
                    ...schedule,
                    locations: schedule.locations.filter(
                      (loc) => loc.id !== active.id
                    ),
                  };
                }
                return schedule;
              })
              .concat(newDaySchedule);
          }

          return prevSchedules.map((schedule) => {
            if (schedule.dayId === sourceDayId) {
              return {
                ...schedule,
                locations: schedule.locations.filter(
                  (loc) => loc.id !== active.id
                ),
              };
            }
            if (schedule.dayId === targetDayId) {
              const targetLocations = [...schedule.locations];

              if (over.data.current?.id) {
                // Find the position to insert at
                const overIndex = targetLocations.findIndex(
                  (loc) => loc.id === over.data.current.id
                );
                if (overIndex !== -1) {
                  // Insert at specific position
                  targetLocations.splice(overIndex, 0, newLocation);
                  return {
                    ...schedule,
                    locations: targetLocations,
                  };
                }
              }

              // If no specific position, add to end
              return {
                ...schedule,
                locations: [...targetLocations, newLocation],
              };
            }
            return schedule;
          });
        });
        setIsEdited(true);
      }
    },
  }));

  if (scheduleError) {
    return <InvalidSchedule />;
  }

  if (!trip || !trip.startDate || !trip.endDate) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No trip dates available
      </div>
    );
  }

  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates = [];
    // Create new dates and set to noon UTC
    const currentDate = new Date(startDate);
    currentDate.setUTCHours(12, 0, 0, 0);

    const lastDate = new Date(endDate);
    lastDate.setUTCHours(12, 0, 0, 0);

    while (currentDate <= lastDate) {
      // Create a new date object for each day to avoid reference issues
      const date = new Date(currentDate);
      date.setUTCHours(12, 0, 0, 0);
      dates.push(date);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const tripDates = getDatesInRange(
    new Date(trip.startDate),
    new Date(trip.endDate)
  );

  // Add a new function for manual save
  const handleManualSave = async () => {
    try {
      await saveSchedule();
      setIsEdited(false);
      toast.success("Schedule saved successfully!", {
        position: "bottom-right",
        duration: 2000,
        style: {
          backgroundColor: "#10B981",
          color: "white",
        },
      });
    } catch (error) {
      toast.error("Failed to save schedule", {
        position: "bottom-right",
        duration: 3000,
        style: {
          backgroundColor: "#EF4444",
          color: "white",
        },
      });
    }
  };

  // Update handleLocationDeleted function
  const handleLocationDeleted = (dayId: string, locationId: string) => {
    // Update daySchedules state immediately
    setDaySchedules((prevSchedules) =>
      prevSchedules.map((schedule) => {
        if (schedule.dayId === dayId) {
          return {
            ...schedule,
            locations: schedule.locations.filter(
              (loc) => loc.id !== locationId
            ),
          };
        }
        return schedule;
      })
    );

    // Set edited flag to true to show save button pulse
    setIsEdited(true);
  };

  return (
    <div className="relative w-full h-full">
      <style jsx>{pulseAnimation}</style>
      <Button
        onClick={handleManualSave}
        className="absolute top-2 right-2 z-20 bg-sky-200 rounded-full p-4 h-auto w-auto"
      >
        <div className="reminder-container absolute top-0 right-4">
          {isEdited && (
            <div
              className="reminder-dot absolute  h-4 z-10 w-4 bg-red-500 rounded-full"
              style={{
                animation: "pulse 0.5s infinite",
                transformOrigin: "center",
              }}
            />
          )}
        </div>
        <RiSave3Line
          className="h-12 w-12 text-sky-500 hover:text-sky-100"
          style={{ transform: "scale(2.0)" }}
        />
      </Button>
      <div className="w-full relative h-full overflow-x-auto bg-gray-100/70 p-3">
        <div className="flex h-full space-x-4 min-w-fit">
          {tripDates.map((date, index) => {
            const dayId = `day-${index}`;
            const daySchedule = daySchedules.find((s) => s.dayId === dayId);

            return (
              <Day
                key={dayId}
                id={dayId}
                date={date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                locations={daySchedule?.locations || []}
                onTimeChange={handleTimeUpdate}
                onWayToCommuteChange={handleWayToCommuteChange}
                tripId={trip.id}
                onLocationDeleted={(locationId) =>
                  handleLocationDeleted(dayId, locationId)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

SchedulePage.displayName = "SchedulePage";
export default SchedulePage;
