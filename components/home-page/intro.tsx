import React from "react";
import Image from "next/image";

export default function Intro() {
  return (
    <div
      className=" container max-w-6xl mx-auto px-6 relative
          md:h-[530px] my-20 md:my-28 md:px-2 md:mb-40
      "
    >
      <div className="md:absolute md:left-2 contrast-75 ">
        <Image src="/images/canon.jpg" width={700} height={700} alt="sleep " />
      </div>
      <div className="flex flex-col md:z-2 md:absolute md:right-0 md:top-[350px] bg-white items-center space-y-8 p-8 md:p-16">
        <h2 className="text-4xl md:text-5xl md:text-left text-center max-w-md uppercase">
          Planning your next adventure!
        </h2>
        <p className="max-w-md md:text-left text-center">
          Our platform streamlines trip planning, helping you budget and build
          itineraries effortlessly. Enjoy personalized recommendations and focus
          on the journey ahead. Let’s create your perfect getaway!
        </p>
      </div>
    </div>
  );
}
