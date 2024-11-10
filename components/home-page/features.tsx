import React from "react";
import Image from "next/image";

export default function Features() {
  return (
    <div className="container pb-28 md:pt-20 max-w-6xl flex flex-col space-y-20  mx-auto p-6">
      <h1 className="text-5xl text-center md:text-start font-medium md:pl-10 ">
        Features
      </h1>
      <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 space-x-4">
        <div className=" md:w-1/2">
          <Image
            src="/images/map-2.jpg"
            alt="feature1"
            width={1000}
            height={1000}
          />
        </div>
        <div className="flex flex-col md:w-1/2 space-y-8 md:p-4 lg:p-16 text-center md:text-start">
          <h2 className="text-3xl  lg:text-4xl font-bold">
            STEP 1 - Create a trip
          </h2>
          <p className="text-base max-w-sm  mx-auto md:text-lg mt-4">
            Plan your perfect trip by creating an itinerary that includes a
            captivating title, a detailed description of your journey.
          </p>
        </div>
      </div>
      <div className="border-[1px] border-gray-300 mx-10 md:mx-40"></div>
      <div className="flex flex-col md:flex-row-reverse  space-y-8 md:space-y-0 space-x-4">
        <div className=" md:w-1/2">
          <Image
            src="/images/map-3.jpg"
            alt="feature2"
            width={1000}
            height={1000}
          />
        </div>
        <div className="flex flex-col md:w-1/2 space-y-8 md:p-4 lg:p-16 text-center md:text-start">
          <h2 className="text-3xl lg:text-4xl font-bold">
            STEP 2 - Add locations
          </h2>
          <p className="text-base max-w-sm  mx-auto md:text-lg mt-4">
            Add locations to your trip by searching for a place and selecting it
            from the search results.
          </p>
        </div>
      </div>
    </div>
  );
}
