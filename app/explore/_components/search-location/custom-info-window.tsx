interface CustomInfoWindowProps {
  location: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    photoUrl?: string;
    mrtInfo?: {
      station: string;
      line: string;
      lineColor: string;
      icon?: string;
    };
  };
  onClose: () => void;
  onSave: (location: any) => void;
  onRemove: (locationId: string) => void;
  isSaved: boolean;
}

export function CustomInfoWindow({
  location,
  onClose,
  onSave,
  onRemove,
  isSaved,
}: CustomInfoWindowProps) {
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

        {/* MRT Info */}
        {location.mrtInfo && (
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
            {location.mrtInfo.icon && (
              <img src={location.mrtInfo.icon} alt="MRT" className="w-4 h-4" />
            )}
            <div>
              <span className="text-sm">{location.mrtInfo.station}</span>
              <div
                className="text-xs px-2 py-0.5 rounded text-white mt-1 inline-block"
                style={{ backgroundColor: location.mrtInfo.lineColor }}
              >
                {location.mrtInfo.line}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          {isSaved ? (
            <button
              onClick={() => onRemove(location.id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Remove from List
            </button>
          ) : (
            <button
              onClick={() => onSave(location)}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Add to List
            </button>
          )}
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
