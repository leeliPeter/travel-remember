import React from "react";
import { IoMdAdd } from "react-icons/io";
import Tripbox from "./_components/tripbox";

const tripdata = [
  {
    name: "Trip to Bali",
    startDate: "12/12/2022",
    endDate: "12/12/2022",
    description:
      "I got a trip with my friends to Bali. We will be staying at a villa in Ubud. however we are still looking for a place to stay in Kuta. We are planning to visit the beach and the monkey forest.",
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
  return (
    <div className="trip-page h-screen pt-20 md:pt-28">
      <div className="container mx-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-10 lg:grid-cols-3">
          <div className="add-plan flex flex-col cursor-pointer justify-center items-center space-y-2 hover:text-gray-500 bg-white/50 hover:bg-white/90 hover:scale-105 duration-500 rounded-xl h-28 w-full col-span-full">
            <IoMdAdd className="text-4xl" />
            <p className="text-xl font-bold">Create a trip</p>
          </div>
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
