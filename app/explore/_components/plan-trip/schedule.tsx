"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import Day from "./day";
import { Trip, Location } from "@prisma/client";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
interface DaySchedule {
  dayId: string;
  date: Date;
  locations: (Location & {
    arrivalTime?: string;
    departureTime?: string;
  })[];
}

const SchedulePage = forwardRef(({ trip }: { trip: Trip }, ref) => {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  // Add this function to generate a unique ID
  const generateUniqueId = () => {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add function to handle time updates
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
  };

  // Update handleLocationDrop
  useImperativeHandle(ref, () => ({
    handleLocationDrop: (
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
    },
    handleReorder: (active: any, over: any) => {
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
            arrivalTime: movedLocation.arrivalTime || "24:00",
            departureTime: movedLocation.departureTime || "24:00",
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
      }
    },
  }));

  if (!trip || !trip.startDate || !trip.endDate) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No trip dates available
      </div>
    );
  }

  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const tripDates = getDatesInRange(
    new Date(trip.startDate),
    new Date(trip.endDate)
  );

  return (
    <div className="w-full h-full overflow-x-auto bg-gray-100/70 p-3">
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
            />
          );
        })}
      </div>
    </div>
  );
});

SchedulePage.displayName = "SchedulePage";
export default SchedulePage;
