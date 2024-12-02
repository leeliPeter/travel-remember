import React, { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LocationBoxProps {
  id: string;
  name: string;
  img: string | null;
  address: string;
  dayId: string;
}

export default function LocationBox({
  id,
  name,
  img,
  address,
  dayId,
}: LocationBoxProps) {
  const [arrivalTime, setArrivalTime] = useState("00:00");
  const [departureTime, setDepartureTime] = useState("00:00");

  const modifiedListeners = {
    onPointerDown: (event: React.PointerEvent) => {
      if (
        event.target instanceof HTMLInputElement &&
        event.target.type === "time"
      ) {
        return;
      }
      listeners?.onPointerDown?.(event);
    },
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({
    id: id,
    data: {
      type: "locationBox",
      dayId,
      id,
      name,
      address,
      img,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 300ms ease, margin 300ms ease",
    opacity: isDragging ? 0.3 : 1,
    marginTop:
      isOver &&
      (active?.data?.current?.type === "location" ||
        (active?.data?.current?.type === "locationBox" &&
          active?.data?.current?.dayId !== dayId))
        ? "96px"
        : "0px",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...modifiedListeners}
      className="location-box w-full bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-center h-24 flex-row p-2">
        <div className="place-img w-1/3 h-full">
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
        <div className="place-info text-xs flex flex-col justify-between pl-1 space-y-1 w-2/3">
          <div className="arrive-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Arrive:</div>
            <input
              type="time"
              value={arrivalTime}
              disabled={isDragging}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded-lg px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="departure-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Depart:</div>
            <input
              type="time"
              value={departureTime}
              disabled={isDragging}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded-lg px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
