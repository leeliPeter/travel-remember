import { Trip } from "@prisma/client";
import ReadOnlyDay from "./readonly-day";
import { getScheduleByTripId } from "@/data/get-scheduleby-tripId";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import InvalidSchedule from "../plan-trip/invalid-schedule";

interface ReadOnlyScheduleProps {
  trip: Trip;
}

export default function ReadOnlySchedule({ trip }: ReadOnlyScheduleProps) {
  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
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
            locations: any[];
          }[];
        };
        setDaySchedules(scheduleData.days);
      }
    };

    fetchSchedule();
  }, [trip.id]);

  if (scheduleError) {
    return <InvalidSchedule />;
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
    <div className="w-full relative h-full overflow-x-auto bg-gray-100/70 p-3">
      <div className="flex h-full space-x-4 min-w-fit">
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
