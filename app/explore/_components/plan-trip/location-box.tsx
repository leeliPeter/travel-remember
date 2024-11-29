import React, { useState } from "react";
import Image from "next/image";
import { List, Location } from "@prisma/client";

interface LocationBoxProps {
  id: string;
  name: string;
  img: string | null;
  address: string;
}

export default function LocationBox({
  id,
  name,
  img,
  address,
}: LocationBoxProps) {
  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [departureTime, setDepartureTime] = useState("12:00");

  return (
    <div className="location-box w-full bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center h-24 flex-row p-2">
        <div className="place-img w-2/5 h-full">
          {img && (
            <Image
              src={img}
              alt={name}
              className="w-full h-full rounded-lg object-cover"
              width={100}
              height={100}
            />
          )}
        </div>
        <div className="place-info text-xs flex flex-col h-24 justify-between p-2 w-3/5">
          <div className="arrive-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Arrive:</div>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="place-address text-gray-500 truncate">{address}</div>
          <div className="departure-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Depart:</div>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
