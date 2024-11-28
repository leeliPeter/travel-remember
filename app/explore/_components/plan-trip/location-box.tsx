import React from "react";
import Image from "next/image";

interface LocationBoxProps {
  name: string;
  img: string;
  address: string;
}

export default function LocationBox({ name, img, address }: LocationBoxProps) {
  return (
    <div className="location-box w-full bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center h-24 flex-row p-2">
        <div className="place-img w-2/5  h-full">
          <Image
            src={img}
            alt={name}
            className="w-full h-full rounded-lg object-cover"
            width={100}
            height={100}
          />
        </div>
        <div className="place-info text-xs flex flex-col h-24 justify-between p-2 w-3/5">
          <div className="arrive-time flex items-center text-gray-500">
            <div className="text-xs">Arrive:</div>
            <div className="text-sm">10:00</div>
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="place-address text-gray-500 truncate">{address}</div>
          <div className="departure-time flex items-center text-gray-500">
            <div className="text-xs">Depart:</div>
            <div className="text-sm">12:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
