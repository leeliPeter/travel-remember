"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="py-36 md:py-60 2xl:py-80 4xl:py-96 md:pb-48">
      <div className=" container mx-auto p-6 ">
        <div className="border-2 border-white max-w-sm md:max-w-md mx-6 md:ml-10 p-4 md:p-8">
          <div className="text-white md:uppercase   text-3xl sm:text-4xl md:text-5xl font-bold md:font-semibold  md:leading-[60px] ">
            Plan Smart, Travel Easy – Your Perfect Trip!
          </div>
        </div>
        <div className="md:hidden w-full flex justify-center">
          <Button
            onClick={() => router.push("/mytrips")}
            className="px-6 py-6 bg-zinc-800 hover:bg-zinc-700 rounded-xl mt-20 font-bold text-lg
              transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
