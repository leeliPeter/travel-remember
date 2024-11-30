import React from "react";
import LocationBox from "./location-box";
import { useDroppable } from "@dnd-kit/core";
import { Location } from "@prisma/client";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DayProps {
  date: string;
  id: string;
  locations: Location[];
}

export default function Day({ date, id, locations }: DayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "day",
      dayId: id,
      locations,
      sortableLocationId: null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full min-w-[256px] border-2 ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      } flex flex-col items-center p-2 rounded-lg transition-colors`}
    >
      <div className="date font-bold text-gray-800 mb-3">{date}</div>
      <div className="w-full min-h-[100px]">
        <SortableContext
          items={locations.map((loc) => loc.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 transition-all duration-300 ease-in-out">
            {locations.map((location, index) => (
              <div
                key={`${location.id}-${id}-${index}`}
                className="transition-all duration-300 ease-in-out"
              >
                <LocationBox
                  id={location.id}
                  dayId={id}
                  name={location.name}
                  img={location.photoUrl}
                  address={location.address}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
