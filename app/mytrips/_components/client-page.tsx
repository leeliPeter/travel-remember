"use client";

import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import Tripbox from "./tripbox";
import { CreateTripForm } from "./createTrip-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  users: {
    user: {
      image: string | null;
      name: string | null;
    };
  }[];
}

interface ClientTripPageProps {
  initialTrips: Trip[];
}

export default function ClientTripPage({ initialTrips }: ClientTripPageProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [open, setOpen] = useState(false);

  const handleTripCreated = (newTrip: any) => {
    setTrips((prev) => [newTrip, ...prev]);
    setOpen(false); // Close dialog after successful creation
  };

  const handleTripUpdate = (updatedTrip: Trip) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
    );
  };

  return (
    <div className="trip-page h-full min-h-screen pt-20 md:pt-28">
      <div className="container mx-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-10 lg:grid-cols-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="add-plan flex flex-col cursor-pointer justify-center items-center space-y-2 hover:text-gray-500 bg-white/50 hover:bg-white/90 hover:scale-105 duration-500 rounded-xl h-28 w-full col-span-full">
                <IoMdAdd className="text-4xl" />
                <p className="text-xl font-bold">Create a trip</p>
              </div>
            </DialogTrigger>
            <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
              <DialogHeader></DialogHeader>
              <CreateTripForm onSuccess={handleTripCreated} />
            </DialogContent>
          </Dialog>

          {trips.map((trip) => (
            <Tripbox
              key={trip.id}
              id={trip.id}
              name={trip.name}
              startDate={trip.startDate}
              endDate={trip.endDate}
              description={trip.description}
              onUpdate={handleTripUpdate}
              onDelete={() => {
                setTrips((prev) => prev.filter((t) => t.id !== trip.id));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
