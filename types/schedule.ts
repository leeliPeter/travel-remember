export interface ScheduleLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  arrivalTime?: string;
  departureTime?: string;
  wayToCommute?: "DRIVING" | "WALKING" | "TRANSIT";
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleDay {
  dayId: string;
  date: string;
  locations: ScheduleLocation[];
}

export interface ScheduleData {
  days: ScheduleDay[];
}
