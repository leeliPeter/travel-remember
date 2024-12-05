import Image from "next/image";

interface ReadOnlyLocationBoxProps {
  name: string;
  img: string | null;
  arrivalTime?: string;
  departureTime?: string;
}

export default function ReadOnlyLocationBox({
  name,
  img,
  arrivalTime = "--:--",
  departureTime = "--:--",
}: ReadOnlyLocationBoxProps) {
  return (
    <div className="location-box mx-auto w-full max-w-[260px] bg-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center relative h-24 flex-row p-2">
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
          <div className="arrive-time flex items-center pl-2 justify-start space-x-4 text-gray-500">
            <div className="text-xs">Arrive:</div>
            <div className="text-sm px-2 py-1 bg-white rounded-md">
              {arrivalTime}
            </div>
          </div>
          <div className="place-name text-sm font-medium truncate">{name}</div>
          <div className="departure-time flex items-center pl-2 justify-start space-x-3 text-gray-500">
            <div className="text-xs">Depart:</div>
            <div className="text-sm px-2 py-1 bg-white rounded-md">
              {departureTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
