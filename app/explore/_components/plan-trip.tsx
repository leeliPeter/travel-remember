"use client";

import { useEffect, useState } from "react";
import { getTrip } from "@/actions/get-trip";
import { toast } from "sonner";
import Loading from "@/components/loading";

interface PlanTripProps {
  tripId: string | null;
}

export default function PlanTrip({ tripId }: PlanTripProps) {
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
    <div className="flex space-y-4 md:space-y-0 md:space-x-4 flex-col md:flex-row h-[90vh]">
      <div className="box1 w-full md:w-1/4 bg-white rounded-lg">
        {tripInfo ? (
          <div className="p-4">
            <h2 className="text-xl font-bold">{tripInfo.name}</h2>
            {/* Add your plan trip content here */}
          </div>
        ) : (
          <div className="p-4 text-center">
            Please select a trip to start planning
          </div>
        )}
      </div>
      <div className="box2 w-full md:w-3/4 bg-white rounded-lg"></div>
    </div>
  );
}
