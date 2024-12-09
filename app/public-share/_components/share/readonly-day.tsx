import ReadOnlyLocationBox from "./readonly-location-box";
import ReadOnlyCommuteTime from "./readonly-commute-time";
import { Location } from "@prisma/client";

interface ReadOnlyDayProps {
  date: string;
  locations: (Location & {
    arrivalTime?: string;
    departureTime?: string;
    wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
  })[];
}

export default function ReadOnlyDay({ date, locations }: ReadOnlyDayProps) {
  return (
    <div className="h-full  w-[210px] md:w-[280px] 2xl:w-[300px]   border-0  md:border-2 overflow-y-auto border-gray-200 bg-white flex flex-col items-center px-2 rounded-lg">
      <div className="date font-bold text-gray-800 mb-3">{date}</div>
      <div className="w-full min-h-[100px]">
        <div className="space-y-2 pb-2">
          {locations.map((location, index) => (
            <div key={location.id}>
              {index !== 0 && locations[index - 1] && (
                <div className="w-full flex flex-col items-center py-0 md:py-2">
                  <ReadOnlyCommuteTime
                    origin={{
                      lat: Number(locations[index - 1].lat),
                      lng: Number(locations[index - 1].lng),
                    }}
                    destination={{
                      lat: Number(location.lat),
                      lng: Number(location.lng),
                    }}
                    wayToCommute={location.wayToCommute}
                  />
                </div>
              )}
              <ReadOnlyLocationBox
                name={location.name}
                img={location.photoUrl}
                arrivalTime={location.arrivalTime}
                departureTime={location.departureTime}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
