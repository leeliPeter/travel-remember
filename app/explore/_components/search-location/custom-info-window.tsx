import { List } from "@/types";

interface OpeningHours {
  weekday_text: string[];
  isOpen: boolean;
}

interface CustomInfoWindowProps {
  location: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    photoUrl?: string;
    openingHours?: OpeningHours;
  };
  onClose: () => void;
  onSave: (location: any, listId: string) => void;
  lists: List[];
}

export function CustomInfoWindow({
  location,
  onClose,
  onSave,
  lists,
}: CustomInfoWindowProps) {
  // Format the current day's hours to be more prominent
  const getCurrentDayHours = () => {
    if (!location.openingHours?.weekday_text) return null;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = days[new Date().getDay()];
    const todayHours = location.openingHours.weekday_text.find((text) =>
      text.startsWith(today)
    );

    return todayHours?.split(": ")[1];
  };

  const todayHours = getCurrentDayHours();

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-[350px]">
      {/* Image */}
      {location.photoUrl && (
        <div className="relative h-[200px]">
          <img
            src={location.photoUrl}
            alt={location.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{location.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Address */}
        <div className="space-y-1">
          <div className="text-sm">{location.address}</div>
        </div>

        {/* Opening Hours */}
        {location.openingHours && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Opening Hours</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  location.openingHours.isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {location.openingHours.isOpen ? "Open Now" : "Closed"}
              </span>
            </div>

            {/* Today's hours */}
            {todayHours && (
              <div className="bg-blue-50 p-2 rounded-md text-sm">
                <span className="font-medium">Today:</span> {todayHours}
              </div>
            )}

            {/* All hours */}
            <div className="bg-gray-50 rounded-md p-2 max-h-[120px] overflow-y-auto">
              {location.openingHours.weekday_text.map((hours, index) => (
                <div
                  key={index}
                  className="text-sm py-0.5 flex justify-between"
                >
                  <span className="text-gray-600">{hours.split(": ")[0]}</span>
                  <span className="font-medium">{hours.split(": ")[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lists Section */}
        {lists.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Add to list:</p>
            <div className="grid gap-2 max-h-[150px] overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => onSave(location, list.id)}
                  className="w-full px-3 py-2 text-left text-sm bg-gray-50 font-semibold hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                >
                  <span>{list.name}</span>
                  <span className="text-xs text-gray-500">
                    {list.locations.length} locations
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center">
            Create a list first to save locations
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <a
            href={`https://maps.google.com/maps?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );
}
