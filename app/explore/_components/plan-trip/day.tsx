import React from "react";
import LocationBox from "./location-box";

interface DayProps {
  date: string;
}

export default function Day({ date }: DayProps) {
  return (
    <div className="h-full min-w-[256px] border-2 border-gray-200 flex flex-col items-center p-2 bg-white rounded-lg">
      <div className="date font-bold text-gray-800 mb-3">{date}</div>
      <div className="w-full space-y-2">
        <LocationBox
          name="Place Name"
          img="/images/map-3.jpg"
          address="Place Address"
        />
      </div>
    </div>
  );
}
