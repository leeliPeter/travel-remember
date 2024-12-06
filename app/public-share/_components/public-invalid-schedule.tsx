"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function PublicInvalidSchedule() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/70 rounded-lg">
      <div className="text-center space-y-4 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">
          Schedule Not Available
        </h3>
        <p className="text-gray-500">
          This schedule is not available or has expired.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 flex items-center gap-2"
          variant="outline"
        >
          <IoMdArrowRoundBack className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
