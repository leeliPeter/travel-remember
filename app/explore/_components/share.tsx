"use client";

import { useEffect, useState } from "react";
import { getTrip } from "@/actions/get-trip";
import { toast } from "sonner";
import Loading from "@/components/loading";
import ReadOnlySchedule from "./share/readonly-schedule";

interface ShareProps {
  tripId: string | null;
}

export default function Share({ tripId }: ShareProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tripInfo, setTripInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTripInfo = async () => {
      if (!tripId) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getTrip(tripId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.trip) {
          setTripInfo(result.trip);
        }
      } catch (error) {
        console.error("Error fetching trip info:", error);
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

  return (
    <div className="w-full h-[95vh] bg-white rounded-lg">
      {tripInfo ? (
        <div className="h-full flex flex-col">
          <div className="p-1 px-4 border-b">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl  font-bold">{tripInfo.name}</h2>
              {tripInfo.description && (
                <p className="mt-0 text-gray-500">{tripInfo.description}</p>
              )}
              <div className="flex items-center  text-gray-600">
                <p>{new Date(tripInfo.startDate).toLocaleDateString()}</p>
                <p className="mx-2">-</p>
                <p>{new Date(tripInfo.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ReadOnlySchedule trip={tripInfo} />
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            Please select a trip to share
          </div>
        </div>
      )}
    </div>
  );
}
