"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import Day from "./day";
import { Trip, Location } from "@prisma/client";

interface DaySchedule {
  dayId: string;
  date: Date;
  locations: Location[];
}

const SchedulePage = forwardRef(({ trip }: { trip: Trip }, ref) => {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  // Expose handleLocationDrop to parent
  useImperativeHandle(ref, () => ({
    handleLocationDrop: (dayId: string, location: Location) => {
      setDaySchedules((prevSchedules) => {
        // Find existing schedule or create new one
        const existingScheduleIndex = prevSchedules.findIndex(
          (s) => s.dayId === dayId
        );

        if (existingScheduleIndex >= 0) {
          // Update existing schedule
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
          // Create new schedule
          return [
            ...prevSchedules,
            {
              dayId,
              date: new Date(), // You might want to pass the actual date
              locations: [location],
            },
          ];
        }
      });
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
              key={index}
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
