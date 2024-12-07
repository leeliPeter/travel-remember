import { Trip } from "@prisma/client";
import ReadOnlyDay from "./readonly-day";
import { getScheduleByTripId } from "@/data/get-scheduleby-tripId";
import { getPublicSchedule } from "@/actions/get-schedule-no-login";
import { useEffect, useState } from "react";
import PublicInvalidSchedule from "../public-invalid-schedule";

interface ReadOnlyScheduleProps {
  trip: Trip;
  isPublic?: boolean;
}

export default function ReadOnlySchedule({
  trip,
  isPublic = false,
}: ReadOnlyScheduleProps) {
  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const result = isPublic
        ? await getPublicSchedule(trip.id)
        : await getScheduleByTripId(trip.id);

      if (!result.success) {
        setScheduleError("Schedule not found");
        return;
      }

      if (result.schedule?.scheduleData) {
        const scheduleData = result.schedule.scheduleData as {
          days: {
            dayId: string;
            date: string;
            locations: any[];
          }[];
        };
        setDaySchedules(scheduleData.days);
      }
    };

    fetchSchedule();
  }, [trip.id, isPublic]);

  if (scheduleError) {
    return <PublicInvalidSchedule />;
  }

  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates = [];
    const currentDate = new Date(startDate);
    currentDate.setUTCHours(12, 0, 0, 0);

    const lastDate = new Date(endDate);
    lastDate.setUTCHours(12, 0, 0, 0);

    while (currentDate <= lastDate) {
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

  return (
    <div className="w-full relative h-full overflow-x-auto p-0  md:p-2 xl:p-3">
      <div className="flex h-full space-x-0 md:space-x-4 min-w-fit">
        {tripDates.map((date, index) => {
          const dayId = `day-${index}`;
          const daySchedule = daySchedules.find((s) => s.dayId === dayId);

          return (
            <ReadOnlyDay
              key={dayId}
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
}
