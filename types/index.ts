export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  name: string;
  tripId: string;
  locations: Location[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationToAdd {
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
}
