"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicTrip } from "@/actions/get-trip-no-login";
import Loading from "@/components/loading";
import ReadOnlySchedule from "./_components/share/readonly-schedule";
import PublicInvalidSchedule from "./_components/public-invalid-schedule";

export default function PublicShare() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [isLoading, setIsLoading] = useState(true);
  const [tripInfo, setTripInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTripInfo = async () => {
      if (!tripId) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getPublicTrip(tripId);

        if (result.success) {
          setTripInfo(result.trip);
        }
      } catch (error) {
        console.error("Error fetching trip info:", error);
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

  if (!tripInfo) {
    return (
      <div className="h-[90vh]">
        <PublicInvalidSchedule />
      </div>
    );
  }

  return (
    <div className="w-auto h-[100vh] bg-gray-200">
      <div className="w-full h-full px-2 flex justify-center items-center py-0 md:py-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-2 border-b">
            <div className="flex flex-row items-center justify-between">
              <h2 className=" text-sm md:text-2xl font-bold truncate">
                {tripInfo.name}
              </h2>
              <div className="flex text-xs md:text-base min-w-fit space-x-1 md:space-x-2 items-center text-gray-600">
                <p>{new Date(tripInfo.startDate).toLocaleDateString()}</p>
                <p className="mx-2">-</p>
                <p>{new Date(tripInfo.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            {tripInfo.description && (
              <p className="mt-0 text-gray-500 truncate">
                {tripInfo.description}
              </p>
            )}
          </div>
          <div className="h-[90vh] overflow-hidden">
            <ReadOnlySchedule trip={tripInfo} isPublic={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
