"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function InvalidSchedule() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/70 rounded-lg">
      <div className="text-center space-y-4 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">
          Schedule Unavailable
        </h3>
        <p className="text-gray-500">
          Unable to load the schedule. The trip ID might be incorrect or you may
          not have access to this trip.
        </p>
        <Button
          onClick={() => router.push("/mytrips")}
          className="mt-4 flex items-center gap-2"
          variant="outline"
        >
          <IoMdArrowRoundBack className="w-4 h-4" />
          Back to My Trips
        </Button>
      </div>
    </div>
  );
}
