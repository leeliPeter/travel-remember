"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Day from "./day";
import { Trip, Location } from "@prisma/client";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

interface DaySchedule {
  dayId: string;
  date: Date;
  locations: Location[];
}

const SchedulePage = forwardRef(({ trip }: { trip: Trip }, ref) => {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const scheduleRef = useRef<any>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) return;

    const activeData = active.data.current as {
      type: string;
      dayId?: string;
      index?: number;
      id: string;
      name: string;
      address: string;
      photoUrl?: string;
    };

    // Handle dropping a new location from the list
    if (activeData.type === "location") {
      const location = {
        id: activeData.id,
        name: activeData.name,
        address: activeData.address,
        photoUrl: activeData.photoUrl,
        listId: "",
        lat: 0,
        lng: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Location;

      handleLocationDrop(over.id as string, location);
      return;
    }

    // Handle reordering within a day
    if (activeData.type === "locationBox" && activeData.dayId) {
      setDaySchedules((prevSchedules) => {
        // Create a new array to avoid mutating state
        const newSchedules = prevSchedules.map((schedule) => {
          // Remove from source day
          if (schedule.dayId === activeData.dayId) {
            return {
              ...schedule,
              locations: schedule.locations.filter(
                (_, idx) => idx !== activeData.index
              ),
            };
          }
          // Add to target day
          if (schedule.dayId === over.id) {
            const movedLocation = prevSchedules.find(
              (s) => s.dayId === activeData.dayId
            )?.locations[activeData.index!];

            if (movedLocation) {
              const newLocations = [...schedule.locations];
              newLocations.splice(
                over.data.current?.index || 0,
                0,
                movedLocation
              );
              return {
                ...schedule,
                locations: newLocations,
              };
            }
          }
          return schedule;
        });

        return newSchedules;
      });
    }
  };

  // Move handleLocationDrop outside useImperativeHandle
  const handleLocationDrop = (dayId: string, location: Location) => {
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
            location,
          ],
        };
        return newSchedules;
      } else {
        return [
          ...prevSchedules,
          {
            dayId,
            date: new Date(),
            locations: [location],
          },
        ];
      }
    });
  };

  // Update useImperativeHandle to use the handleLocationDrop function
  useImperativeHandle(ref, () => ({
    handleLocationDrop,
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
