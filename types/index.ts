export interface ScheduleResponse {
  id: string;
  scheduleData: {
    days: {
      dayId: string;
      date: string;
      locations: {
        id: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
        photoUrl?: string;
        arrivalTime?: string;
        departureTime?: string;
        type: string;
        createdAt: string;
        updatedAt: string;
      }[];
    }[];
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationToAdd {
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string | null;
}
