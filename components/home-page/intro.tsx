"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Intro() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("intro-section");
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight * 0.75;
        setIsVisible(isInView);
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="intro-section"
      className="container max-w-6xl mx-auto px-6 relative
          md:h-[530px] my-20 md:my-28 md:px-2 md:mb-40"
    >
      <div
        className={`md:absolute md:left-2 contrast-75 transform transition-all duration-1000 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full"
          }`}
      >
        <Image src="/images/canon.jpg" width={700} height={700} alt="sleep" />
      </div>
      <div
        className={`flex flex-col md:z-2 md:absolute md:right-0 md:top-[350px] bg-white items-center 
          space-y-8 p-8 md:p-16 transform transition-all duration-1000 delay-300 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full"
          }`}
      >
        <h2 className="text-4xl md:text-5xl md:text-left text-center max-w-md uppercase">
          Planning your next adventure!
        </h2>
        <p className="max-w-md md:text-left text-center">
          Designed to make trip planning simple and hassle-free! Easily search
          for locations, add your favorites to a personalized list, and
          seamlessly drag and drop them into your schedule.
        </p>
      </div>
    </div>
  );
}
