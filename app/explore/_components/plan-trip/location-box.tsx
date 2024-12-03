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
  arrivalTime?: string;
  departureTime?: string;
  onTimeChange?: (type: "arrival" | "departure", time: string) => void;
}

export default function LocationBox({
  id,
  name,
  img,
  address,
  dayId,
  arrivalTime: initialArrivalTime = "24:00",
  departureTime: initialDepartureTime = "24:00",
  onTimeChange,
}: LocationBoxProps) {
  const [arrivalTime, setArrivalTime] = useState(initialArrivalTime);
  const [departureTime, setDepartureTime] = useState(initialDepartureTime);

  const handleArrivalTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setArrivalTime(newTime);
    onTimeChange?.("arrival", newTime);
  };

  const handleDepartureTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTime = e.target.value;
    setDepartureTime(newTime);
    onTimeChange?.("departure", newTime);
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
      photoUrl: img,
      arrivalTime,
      departureTime,
    },
  });

  const modifiedListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.target instanceof HTMLInputElement) {
        return;
      }
      listeners?.onPointerDown?.(e);
    },
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: isDragging ? 0.3 : 1,
    marginTop:
      isOver &&
      (active?.data?.current?.type === "location" ||
        (active?.data?.current?.type === "locationBox" &&
          active?.data?.current?.dayId !== dayId))
        ? "96px"
        : "0px",
    backgroundColor: isOver ? "rgb(243, 244, 246)" : "",
    boxShadow: isOver ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...modifiedListeners}
      className={`
        location-box w-full bg-gray-200 rounded-lg 
        transition-all duration-300 ease-in-out cursor-move
        ${
          isDragging
            ? "shadow-lg ring-2 ring-blue-400"
            : "shadow-sm hover:shadow-md"
        }
        ${isOver ? "ring-2 ring-blue-400 scale-[1.02]" : ""}
      `}
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
              draggable={false}
            />
          )}
        </div>
        <div className="place-info text-xs flex flex-col justify-between pl-1 space-y-1 w-2/3">
          <div className="arrive-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Arrive:</div>
            <input
              type="time"
              value={arrivalTime}
              onChange={handleArrivalTimeChange}
              className="text-sm bg-white border border-gray-300 rounded-lg px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="departure-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Depart:</div>
            <input
              type="time"
              value={departureTime}
              onChange={handleDepartureTimeChange}
              className="text-sm bg-white border border-gray-300 rounded-lg px-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const DraggingPreview = ({
  name,
  img,
  address,
  arrivalTime,
  departureTime,
}: {
  name: string;
  img: string | null;
  address: string;
  arrivalTime: string;
  departureTime: string;
}) => (
  <div className="w-[300px] bg-white rounded-lg shadow-xl ring-2 ring-blue-400 transform-gpu scale-105 opacity-95">
    <div className="flex items-center h-24 flex-row p-2">
      <div className="place-img w-1/3 h-full">
        {img && (
          <Image
            src={img}
            alt={name}
            className="w-full h-full rounded-lg object-cover"
            width={100}
            height={100}
            draggable={false}
            priority={true}
          />
        )}
      </div>
      <div className="place-info text-xs flex flex-col justify-between pl-1 space-y-1 w-2/3">
        <div className="arrive-time flex items-center justify-between text-gray-500">
          <div className="text-xs">Arrive:</div>
          <div className="text-sm bg-white border border-gray-300 rounded-lg px-1">
            {arrivalTime}
          </div>
        </div>
        <div className="place-name text-sm font-medium truncate">{name}</div>
        <div className="departure-time flex items-center justify-between text-gray-500">
          <div className="text-xs">Depart:</div>
          <div className="text-sm bg-white border border-gray-300 rounded-lg px-1">
            {departureTime}
          </div>
        </div>
      </div>
    </div>
  </div>
);
