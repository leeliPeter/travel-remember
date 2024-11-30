"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import Day from "./day";
import { Trip, Location } from "@prisma/client";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
interface DaySchedule {
  dayId: string;
  date: Date;
  locations: Location[];
}

const SchedulePage = forwardRef(({ trip }: { trip: Trip }, ref) => {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  // Add this function to generate a unique ID
  const generateUniqueId = () => {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        setDaySchedules((prevSchedules) => {
          return prevSchedules.map((schedule) => {
            if (schedule.dayId === sourceDayId) {
              // Find the locations for this day
              const dayLocations = [...schedule.locations];
              const oldIndex = dayLocations.findIndex(
                (loc) => loc.id === active.id
              );
              const newIndex = dayLocations.findIndex(
                (loc) => loc.id === over.id
              );

              console.log("Reordering:", {
                oldIndex,
                newIndex,
                dayLocations,
                activeId: active.id,
                overId: over.id,
              });

              if (oldIndex !== -1 && newIndex !== -1) {
                // Create new array with reordered locations
                const reorderedLocations = arrayMove(
                  dayLocations,
                  oldIndex,
                  newIndex
                );

                // Return updated schedule with new locations order
                return {
                  ...schedule,
                  locations: reorderedLocations,
                };
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

          return prevSchedules.map((schedule) => {
            if (schedule.dayId === sourceDayId) {
              // Remove from source day
              return {
                ...schedule,
                locations: schedule.locations.filter(
                  (loc) => loc.id !== active.id
                ),
              };
            }
            if (schedule.dayId === targetDayId) {
              // Add to target day
              return {
                ...schedule,
                locations: [...schedule.locations, movedLocation],
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
            />
          );
        })}
      </div>
    </div>
  );
});

SchedulePage.displayName = "SchedulePage";
export default SchedulePage;
