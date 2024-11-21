"use client";

import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import Tripbox from "./_components/tripbox";
import { CreateTripForm } from "./_components/createTrip-form";
import { addTrip } from "@/actions/add-trip";
import FormSuccess from "@/components/form-sucess";
import FormError from "@/components/form-error";
import { TripSchema } from "@/schemas";
import { useTransition } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

const tripdata = [
  {
    name: "Trip to Bali",
    startDate: "12/12/2022",
    endDate: "12/12/2022",
    description: "I got a trip with my friends to Bali.",
  },
  {
    name: "Trip to Cebu",
    startDate: "12/12/2022",
    endDate: "12/12/2022",
    description: "A trip to Cebu",
  },
  {
    name: "Trip to Maldives",
    startDate: "12/12/2022",
    endDate: "12/12/2022",
    description: "A trip to Maldives",
  },
  {
    name: "Trip to Japan",
    startDate: "12/12/2022",
    endDate: "12/12/2022",
    description: "A trip to Japan",
  },
];

export default function TripPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const handleFormSubmit = async (data: z.infer<typeof TripSchema>) => {
    console.log("Received form data:", data);
    setError("");
    setSuccess("");

    // Convert string dates to Date objects if they aren't already
    const formattedData = {
      ...data,
      startDate:
        data.startDate instanceof Date
          ? data.startDate
          : new Date(data.startDate),
      endDate:
        data.endDate instanceof Date ? data.endDate : new Date(data.endDate),
    };

    console.log("Formatted data:", formattedData);

    startTransition(async () => {
      const response = await addTrip(formattedData);
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        setSuccess(response.success);
      }
    });
  };

  return (
    <div className="trip-page h-full pt-20 md:pt-28">
      <div className="container mx-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-10 lg:grid-cols-3">
          <Dialog>
            <DialogTrigger asChild>
              <div className="add-plan flex flex-col cursor-pointer justify-center items-center space-y-2 hover:text-gray-500 bg-white/50 hover:bg-white/90 hover:scale-105 duration-500 rounded-xl h-28 w-full col-span-full">
                <IoMdAdd className="text-4xl" />
                <p className="text-xl font-bold">Create a trip</p>
              </div>
            </DialogTrigger>
            <DialogContent className="w-[90%] sm:w-full sm:max-w-[425px] rounded-xl">
              <DialogHeader></DialogHeader>
              <CreateTripForm onSubmit={handleFormSubmit} />
            </DialogContent>
          </Dialog>

          {tripdata.map((trip, index) => (
            <Tripbox
              key={index}
              name={trip.name}
              startDate={trip.startDate}
              endDate={trip.endDate}
              description={trip.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
