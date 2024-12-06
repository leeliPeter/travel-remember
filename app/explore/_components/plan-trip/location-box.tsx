import React, { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoMdClose } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteLocationFromDay } from "@/actions/del-location-from-day";
import { toast } from "sonner";

interface LocationBoxProps {
  id: string;
  boxId: string;
  name: string;
  img: string | null;
  address: string;
  dayId: string;
  arrivalTime?: string;
  departureTime?: string;
  onTimeChange?: (type: "arrival" | "departure", time: string) => void;
  tripId: string;
  onLocationDeleted?: () => void;
}

function TimePickerDialog({
  isOpen,
  onClose,
  onSave,
  initialTime,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  initialTime: string;
  title: string;
}) {
  const [selectedHour, setSelectedHour] = useState(initialTime.split(":")[0]);
  const [selectedMinute, setSelectedMinute] = useState(
    initialTime.split(":")[1]
  );

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const handleSave = () => {
    onSave(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select the time by choosing hour and minute
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium mb-2">Hour</label>
            <div className="h-48 overflow-y-auto border rounded-lg">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    hour === selectedHour ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedHour(hour)}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium mb-2">Minute</label>
            <div className="h-48 overflow-y-auto border rounded-lg">
              {minutes.map((minute) => (
                <div
                  key={minute}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    minute === selectedMinute ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedMinute(minute)}
                >
                  {minute}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LocationBox({
  id,
  name,
  img,
  address,
  dayId,
  arrivalTime: initialArrivalTime = "--:--",
  departureTime: initialDepartureTime = "--:--",
  onTimeChange,
  tripId,
  onLocationDeleted,
}: LocationBoxProps) {
  const [arrivalTime, setArrivalTime] = useState(initialArrivalTime);
  const [departureTime, setDepartureTime] = useState(initialDepartureTime);
  const [isArrivalDialogOpen, setIsArrivalDialogOpen] = useState(false);
  const [isDepartureDialogOpen, setIsDepartureDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
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
      if (
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as HTMLElement).closest('[role="dialog"]') ||
        (e.target as HTMLElement).closest(".delete-button")
      ) {
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const result = await deleteLocationFromDay(tripId, dayId, id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        onLocationDeleted?.();

        toast.success(result.success, {
          position: "bottom-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...modifiedListeners}
      className={`
        location-box mx-auto w-full max-w-[260px] bg-gray-200 rounded-lg 
        transition-all duration-300 ease-in-out cursor-move
        ${
          isDragging
            ? "shadow-lg ring-2 ring-blue-400"
            : "shadow-sm hover:shadow-md"
        }
        ${isOver ? "ring-2 ring-blue-400 scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-center relative h-24 flex-row p-2">
        <div className="absolute top-2 text-gray-500 right-2 delete-button">
          <IoMdClose
            className="cursor-pointer hover:text-red-500 transition-colors"
            onClick={handleDelete}
          />
        </div>
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
          <div className="arrive-time flex items-center pl-2   justify-start space-x-4 text-gray-500">
            <div className="text-xs">Arrive:</div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsArrivalDialogOpen(true);
              }}
            >
              {arrivalTime}
            </Button>
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="departure-time flex items-center pl-2  justify-start space-x-3 text-gray-500">
            <div className="text-xs">Depart:</div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsDepartureDialogOpen(true);
              }}
            >
              {departureTime}
            </Button>
          </div>
        </div>
      </div>

      <TimePickerDialog
        isOpen={isArrivalDialogOpen}
        onClose={() => setIsArrivalDialogOpen(false)}
        onSave={(time) => {
          setArrivalTime(time);
          onTimeChange?.("arrival", time);
        }}
        initialTime={arrivalTime}
        title="Select Arrival Time"
      />

      <TimePickerDialog
        isOpen={isDepartureDialogOpen}
        onClose={() => setIsDepartureDialogOpen(false)}
        onSave={(time) => {
          setDepartureTime(time);
          onTimeChange?.("departure", time);
        }}
        initialTime={departureTime}
        title="Select Departure Time"
      />
    </div>
  );
}

export const DraggingPreview = ({
  name,
  img,
  arrivalTime = "--:--",
  departureTime = "--:--",
}: {
  name: string;
  img: string | null;
  address: string;
  arrivalTime: string;
  departureTime: string;
}) => {
  const format12Hour = (time: string) => {
    if (time === "--:--") return time;

    const [hours, minutes] = time.split(":");
    let hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? "PM" : "AM";

    if (hoursNum > 12) hoursNum -= 12;
    else if (hoursNum === 0) hoursNum = 12;

    return `${hoursNum}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-[250px] bg-white rounded-lg shadow-xl ring-2 ring-blue-400 transform-gpu scale-105 opacity-95">
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
              {format12Hour(arrivalTime)}
            </div>
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="departure-time flex items-center justify-between text-gray-500">
            <div className="text-xs">Depart:</div>
            <div className="text-sm bg-white border border-gray-300 rounded-lg px-1">
              {format12Hour(departureTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
