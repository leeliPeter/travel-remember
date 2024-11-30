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
      <div className="w-full space-y-2 min-h-[100px]">
        <SortableContext
          items={locations}
          strategy={verticalListSortingStrategy}
        >
          {locations.map((location, index) => (
            <LocationBox
              key={`${location.id}-${id}-${index}`}
              id={location.id}
              name={location.name}
              img={location.photoUrl}
              address={location.address}
              dayId={id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}