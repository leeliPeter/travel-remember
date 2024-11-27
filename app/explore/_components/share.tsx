"use client";

import { useEffect, useState } from "react";
import { getTrip } from "@/actions/get-trip";
import { toast } from "sonner";
import Loading from "@/components/loading";

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
    <div className="w-full h-[90vh] bg-white rounded-lg">
      {tripInfo ? (
        <div className="p-4">
          <h2 className="text-xl font-bold">{tripInfo.name}</h2>
          {/* Add your share content here */}
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
