"use client";
import React from "react";

export default function Header() {
  return (
    <header className="py-40 md:py-60 2xl:py-80 4xl:py-96 md:pb-48">
      <div className=" container mx-auto p-6 ">
        <div className="border-2 border-white max-w-sm md:max-w-md mx-6 md:ml-10 p-4 md:p-8">
          <div className="text-white uppercase text-3xl sm:text-4xl md:text-5xl font-semibold  md:leading-[60px] ">
            Plan Smart, Travel Easy – Your Perfect Trip!
          </div>
        </div>
      </div>
    </header>
  );
}
