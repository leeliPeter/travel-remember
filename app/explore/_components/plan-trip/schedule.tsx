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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Handle dropping from plan-trip list
    if (!active.data.current?.dayId) {
      const location = active.data.current as Location;
      const dayId = over.id as string;

      // Create new location only when coming from plan-trip
      const newLocation: Location = {
        ...location,
        id: generateUniqueId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDaySchedules((prevSchedules) => {
        const existingScheduleIndex = prevSchedules.findIndex(
          (s) => s.dayId === dayId
        );

        if (existingScheduleIndex >= 0) {
          const newSchedules = [...prevSchedules];
          newSchedules[existingScheduleIndex] = {
            ...newSchedules[existingScheduleIndex],
            locations: [
              ...newSchedules[existingScheduleIndex].locations,
              newLocation,
            ],
          };
          return newSchedules;
        } else {
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
      return;
    }

    // Handle reordering within or between days
    const sourceDayId = active.data.current.dayId;
    const targetDayId = over.id;

    if (sourceDayId === targetDayId) {
      // Moving within the same day
      setDaySchedules((prevSchedules) => {
        return prevSchedules.map((schedule) => {
          if (schedule.dayId === sourceDayId) {
            const locations = [...schedule.locations];
            const oldIndex = locations.findIndex((loc) => loc.id === active.id);
            const newIndex = locations.findIndex((loc) => loc.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
              return {
                ...schedule,
                locations: arrayMove(locations, oldIndex, newIndex),
              };
            }
          }
          return schedule;
        });
      });
    } else {
      // Moving between different days
      setDaySchedules((prevSchedules) => {
        const sourceSchedule = prevSchedules.find(
          (s) => s.dayId === sourceDayId
        );
        const targetSchedule = prevSchedules.find(
          (s) => s.dayId === targetDayId
        );

        if (!sourceSchedule || !targetSchedule) return prevSchedules;

        const movedLocation = sourceSchedule.locations.find(
          (loc) => loc.id === active.id
        );

        if (!movedLocation) return prevSchedules;

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
            return {
              ...schedule,
              locations: [...schedule.locations, movedLocation],
            };
          }
          return schedule;
        });
      });
    }
  };

  // Add this function to generate a unique ID
  const generateUniqueId = () => {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Update handleLocationDrop
  useImperativeHandle(ref, () => ({
    handleLocationDrop: (dayId: string, location: Location) => {
      setDaySchedules((prevSchedules) => {
        const existingScheduleIndex = prevSchedules.findIndex(
          (s) => s.dayId === dayId
        );

        // Create a new location with a different ID
        const newLocation: Location = {
          ...location,
          id: generateUniqueId(), // New unique ID
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (existingScheduleIndex >= 0) {
          const newSchedules = [...prevSchedules];
          newSchedules[existingScheduleIndex] = {
            ...newSchedules[existingScheduleIndex],
            locations: [
              ...newSchedules[existingScheduleIndex].locations,
              newLocation, // Use the new location
            ],
          };
          return newSchedules;
        } else {
          return [
            ...prevSchedules,
            {
              dayId,
              date: new Date(),
              locations: [newLocation], // Use the new location
            },
          ];
        }
      });
    },
    handleReorder: (active: any, over: any) => {
      const sourceDayId = active.data.current.dayId;
      const targetDayId = over.id;

      if (sourceDayId === targetDayId) {
        setDaySchedules((prevSchedules) => {
          return prevSchedules.map((schedule) => {
            if (schedule.dayId === sourceDayId) {
              const locations = [...schedule.locations];
              const oldIndex = locations.findIndex(
                (loc) => loc.id === active.id
              );
              const newIndex = locations.findIndex((loc) => loc.id === over.id);

              if (oldIndex !== -1 && newIndex !== -1) {
                return {
                  ...schedule,
                  locations: arrayMove(locations, oldIndex, newIndex),
                };
              }
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
