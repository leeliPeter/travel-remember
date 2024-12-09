"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicTrip } from "@/actions/get-trip-no-login";
import Loading from "@/components/loading";
import ReadOnlySchedule from "./_components/share/readonly-schedule";
import PublicInvalidSchedule from "./_components/public-invalid-schedule";
import { FaRegCopy } from "react-icons/fa";
import { toast, Toaster } from "sonner";

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

  const handleCopyUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success("Link Copied!", {
          position: "bottom-right",
          duration: 2000,
          className: "bg-blue-600 text-white border-none",
          description: "Share this link with your friends",
          descriptionClassName: "text-gray-200",
        });
      })
      .catch(() => {
        toast.error("Failed to copy URL", {
          position: "bottom-right",
          duration: 2000,
          className: "bg-blue-600 text-white border-none",
        });
      });
  };

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
    <div className="w-auto h-auto bg-gray-200">
      <Toaster position="bottom-right" />
      <div className="w-full h-[100vh] px-2 flex justify-center items-center py-0 ">
        <div className="bg-white  rounded-lg shadow-sm overflow-hidden">
          <div className="p-2 mb-1 h-[8vh]  ">
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
            <div className="flex flex-row  items-center justify-between">
              {tripInfo.description ? (
                <p className="mt-0 text-gray-500 text-xs md:text-base truncate">
                  {tripInfo.description}
                </p>
              ) : (
                <p className="mt-0 text-gray-500 text-xs md:text-base truncate">
                  " "
                </p>
              )}
              <div
                onClick={handleCopyUrl}
                className="flex cursor-pointer items-center hover:bg-gray-100 transition-all duration-300 ease-in-out hover:border-gray-400 hover:scale-105 space-x-2 border-2 px-2 border-gray-800 rounded-md p-0 justify-center"
              >
                <p className="text-xs md:text-base">copy</p>
                <FaRegCopy className="text-xs md:text-base" />
              </div>
            </div>
          </div>
          <div className="h-[90vh] pb-0 md:pb-2 overflow-hidden">
            <ReadOnlySchedule trip={tripInfo} isPublic={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
